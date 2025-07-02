import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Workout {
  id: string;
  user_id: string;
  name?: string;
  date: string;
  status: 'planned' | 'in_progress' | 'completed';
  exercises: any[];
  created_at: string;
  updated_at: string;
}

export function useWorkouts(userId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏋️ [useWorkouts] Ajout d\'une séance...');
      const { data, error: supabaseError } = await supabase
        .from('workouts')
        .insert([{
          ...workoutData,
          user_id: userId,
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('✅ [useWorkouts] Séance ajoutée avec succès:', data.id);
      
      // Si c'est une séance complétée, ajouter l'XP
      if (workoutData.status === 'completed') {
        const today = new Date().toISOString().split('T')[0];
        const { error: xpError } = await supabase
          .from('daily_progress')
          .upsert({
            user_id: userId,
            date: today,
            xp_earned: 100,
          }, {
            onConflict: 'user_id,date'
          });

        if (xpError) {
          console.error('❌ [useWorkouts] Erreur ajout XP:', xpError);
        } else {
          console.log('✅ [useWorkouts] XP ajouté (+100)');
        }
      }
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la séance';
      setError(errorMessage);
      console.error('❌ [useWorkouts] Erreur:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateWorkout = useCallback(async (workoutId: string, updates: Partial<Workout>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('workouts')
        .update(updates)
        .eq('id', workoutId)
        .eq('user_id', userId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la séance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const deleteWorkout = useCallback(async (workoutId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: supabaseError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);

      if (supabaseError) throw supabaseError;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la séance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const completeWorkout = useCallback(async (workoutId: string, xpEarned: number = 100) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mettre à jour le statut de la séance
      const { error: workoutError } = await supabase
        .from('workouts')
        .update({ status: 'completed' })
        .eq('id', workoutId)
        .eq('user_id', userId);

      if (workoutError) throw workoutError;

      // Ajouter l'XP gagné
      const today = new Date().toISOString().split('T')[0];
      const { error: xpError } = await supabase
        .from('daily_progress')
        .upsert({
          user_id: userId,
          date: today,
          xp_earned: xpEarned,
        }, {
          onConflict: 'user_id,date'
        });

      if (xpError) throw xpError;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la finalisation de la séance';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    loading,
    error,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    completeWorkout,
  };
} 