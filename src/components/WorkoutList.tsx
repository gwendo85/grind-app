"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Workout } from "@/types/database";

interface WorkoutListProps {
  refreshTrigger?: number;
}

export default function WorkoutList({ refreshTrigger }: WorkoutListProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setWorkouts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des séances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [refreshTrigger]);

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;

      // Rafraîchir la liste
      fetchWorkouts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Mes Séances Récentes</h2>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Mes Séances Récentes</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Mes Séances Récentes</h2>
      
      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <p className="text-gray-600 mb-2">Aucune séance enregistrée</p>
          <p className="text-sm text-gray-500">Commencez par ajouter votre première séance !</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {workout.name || 'Séance sans nom'}
                    </h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{formatDate(workout.created_at)}</span>
                    {Array.isArray(workout.exercises) && workout.exercises.length > 1 && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {workout.exercises.length} exercice{workout.exercises.length > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Résumé de la séance */}
                  {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1 min-w-fit">
                          <span className="text-base md:text-lg" style={{lineHeight:1}} role="img" aria-label="séries">🔄</span>
                          <span className="font-medium">{workout.exercises.length > 1 ? `${workout.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0)} séries` : `${workout.exercises[0].sets || 0} série${(workout.exercises[0].sets || 0) > 1 ? 's' : ''}`}</span>
                        </span>
                        <span className="flex items-center gap-1 min-w-fit">
                          <span className="text-base md:text-lg" style={{lineHeight:1}} role="img" aria-label="poids">⚖️</span>
                          <span className="font-medium">{workout.exercises.reduce((sum, ex) => sum + (ex.weight || 0), 0)} kg</span>
                        </span>
                        <span className="flex items-center gap-1 min-w-fit">
                          <span className="text-base md:text-lg" style={{lineHeight:1}} role="img" aria-label="répétitions">📊</span>
                          <span className="font-medium">{workout.exercises.reduce((sum, ex) => sum + (ex.reps || 0), 0)} répétitions</span>
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Affichage des exercices */}
                  {Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-50 rounded-md p-3 border-l-4 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{exercise.name}</span>
                            {workout.exercises.length > 1 && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            {exercise.sets && exercise.sets > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">🔄</span>
                                <span className="font-medium">{exercise.sets} séries</span>
                              </div>
                            )}
                            {exercise.weight && exercise.weight > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">⚖️</span>
                                <span className="font-medium">{exercise.weight} kg</span>
                              </div>
                            )}
                            {exercise.reps && exercise.reps > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">📊</span>
                                <span className="font-medium">{exercise.reps} reps</span>
                              </div>
                            )}
                            {exercise.notes && exercise.notes.trim() && (
                              <div className="col-span-2 md:col-span-1">
                                <div className="flex items-start gap-1">
                                  <span className="text-gray-500">💬</span>
                                  <span className="text-xs italic text-gray-600">&quot;{exercise.notes}&quot;</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
                    title="Supprimer cette séance"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  {workout.status === 'planned' && (
                    <a
                      href={`/session/${workout.id}`}
                      className="btn btn-primary btn-sm animate-bounce"
                      title="Démarrer la séance"
                    >
                      ▶️ Démarrer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {workouts.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Affichage des 10 dernières séances
          </p>
        </div>
      )}
    </div>
  );
} 