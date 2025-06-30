import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Workout, WorkoutInsert, WorkoutUpdate } from '@/types/database';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer tous les workouts
  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des séances");
    } finally {
      setLoading(false);
    }
  }, []);

  // Ajouter un nouveau workout
  const addWorkout = useCallback(async (workoutData: Omit<WorkoutInsert, 'user_id'>) => {
    try {
      setError(null);
      
      // Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter une séance");
      }

      // Insérer le workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          ...workoutData,
          user_id: user.id
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Ajouter les points XP
      const { error: xpError } = await supabase
        .from('xp_logs')
        .insert({
          user_id: user.id,
          workout_id: workout.id,
          xp_points: 100,
          activity_type: 'workout',
          description: `Séance: ${workoutData.name}`
        });

      if (xpError) throw xpError;

      // Mettre à jour l'état local
      setWorkouts(prev => [workout, ...prev]);

      return workout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout de la séance";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Mettre à jour un workout
  const updateWorkout = useCallback(async (workoutId: string, updates: WorkoutUpdate) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', workoutId)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      setWorkouts(prev => 
        prev.map(workout => 
          workout.id === workoutId ? data : workout
        )
      );

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Supprimer un workout
  const deleteWorkout = useCallback(async (workoutId: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      // Mettre à jour l'état local
      setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Récupérer les statistiques
  const getStats = useCallback(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const workoutsThisMonth = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.getMonth() === thisMonth && workoutDate.getFullYear() === thisYear;
    });

    const totalWorkouts = workouts.length;
    const workoutsThisMonthCount = workoutsThisMonth.length;

    // Calculer la série actuelle (jours consécutifs avec des workouts)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    // Trier par date décroissante pour calculer les séries
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      const workoutDateStr = workoutDate.toDateString();

      if (!lastDate) {
        lastDate = workoutDate;
        tempStreak = 1;
        currentStreak = 1;
        longestStreak = 1;
        continue;
      }

      const lastDateStr = lastDate.toDateString();
      const daysDiff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Jour consécutif
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        if (workoutDateStr === lastDateStr) {
          // Même jour, continuer la série
          continue;
        }
      } else if (daysDiff === 0) {
        // Même jour, continuer la série
        continue;
      } else {
        // Série brisée
        tempStreak = 1;
      }

      lastDate = workoutDate;
    }

    return {
      totalWorkouts,
      workoutsThisMonth: workoutsThisMonthCount,
      currentStreak,
      longestStreak
    };
  }, [workouts]);

  // Charger les workouts au montage du composant
  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    loading,
    error,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    fetchWorkouts,
    getStats
  };
} 