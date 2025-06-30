"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Workout } from "@/types/database";

export default function WorkoutStats() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Utilisateur non connecté");
      }

      // Récupérer les séances de l'utilisateur
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (workoutsError) throw workoutsError;

      // Récupérer le total d'XP
      const { data: xpData, error: xpError } = await supabase
        .from("xp_logs")
        .select("xp_points")
        .eq("user_id", user.id);

      if (xpError) throw xpError;

      // Calculer le total d'XP
      const total = xpData?.reduce((sum, log) => sum + (log.xp_points || 0), 0) || 0;

      setWorkouts(workoutsData || []);
      setTotalXP(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Mes Statistiques</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Mes Statistiques</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">📊 Mes Statistiques</h2>
      
      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{workouts.length}</div>
          <div className="text-sm text-blue-800">Séances totales</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalXP}</div>
          <div className="text-sm text-green-800">Total XP</div>
        </div>
      </div>

      {/* Liste des séances */}
      <div>
        <h3 className="text-lg font-medium mb-3">🏋️‍♂️ Mes Séances Récentes</h3>
        
        {workouts.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">💪</div>
            <p className="text-gray-600">Aucune séance enregistrée</p>
            <p className="text-sm text-gray-500">Commencez par ajouter votre première séance !</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {workouts.slice(0, 10).map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {Array.isArray(workout.exercises) && workout.exercises.length > 0 
                          ? workout.exercises[0].name 
                          : 'Séance sans exercice'}
                      </h4>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-600">{formatDate(workout.date)}</span>
                    </div>
                    
                    {/* Affichage des exercices */}
                    {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                      <div className="flex gap-4 text-sm text-gray-600">
                        {workout.exercises.slice(0, 2).map((exercise, index) => (
                          <span key={index}>
                            {exercise.weight && `${exercise.weight}kg`}
                            {exercise.reps && ` ${exercise.reps} reps`}
                          </span>
                        ))}
                        {workout.exercises.length > 2 && (
                          <span className="text-gray-500">+{workout.exercises.length - 2} autres</span>
                        )}
                      </div>
                    )}
                    
                    {workout.notes && (
                      <p className="text-xs text-gray-500 mt-1 italic">&quot;{workout.notes}&quot;</p>
                    )}
                  </div>
                  
                  <div className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    +100 XP
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {workouts.length > 10 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-500">
              Affichage des 10 dernières séances sur {workouts.length} total
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 