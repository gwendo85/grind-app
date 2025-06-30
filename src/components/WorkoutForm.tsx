"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { WorkoutFormData } from "@/types/database";

interface WorkoutFormProps {
  onWorkoutAdded?: () => void;
}

export default function WorkoutForm({ onWorkoutAdded }: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: "",
    exercises: [{ name: "", weight: 0, reps: 1, sets: 1 }],
    date: new Date().toISOString().split('T')[0],
    status: 'planned',
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'reps' || name === 'sets' || name === 'duration_minutes' 
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Vérifier que l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Vous devez être connecté pour ajouter une séance");
      }

      // Insérer le workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          exercise: formData.exercises[0].name,
          weight: formData.exercises[0].weight,
          reps: formData.exercises[0].reps,
          sets: formData.exercises[0].sets,
          notes: formData.notes,
          date: formData.date
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
          description: `Séance: ${formData.exercises[0].name}`
        });

      if (xpError) throw xpError;

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        exercises: [{ name: "", weight: 0, reps: 1, sets: 1 }],
        date: new Date().toISOString().split('T')[0],
        status: 'planned',
        notes: ""
      });

      setSuccess(true);
      
      // Appeler le callback pour rafraîchir l'affichage
      if (onWorkoutAdded) {
        onWorkoutAdded();
      }

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'ajout de la séance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🏋️‍♂️ Nouvelle Séance</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">✅ Séance ajoutée avec succès ! +100 XP gagnés</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date de la séance
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Exercice */}
        <div>
          <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 mb-1">
            Exercice *
          </label>
          <input
            type="text"
            id="exercise"
            name="exercise"
            value={formData.exercises[0].name}
            onChange={e => setFormData(prev => ({ ...prev, exercises: [{ ...prev.exercises[0], name: e.target.value }] }))}
            placeholder="Ex: Squat, Bench Press, Deadlift..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Poids et Répétitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
              Poids (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.exercises[0].weight || ''}
              onChange={e => setFormData(prev => ({ ...prev, exercises: [{ ...prev.exercises[0], weight: Number(e.target.value) }] }))}
              placeholder="80"
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="reps" className="block text-sm font-medium text-gray-700 mb-1">
              Répétitions
            </label>
            <input
              type="number"
              id="reps"
              name="reps"
              value={formData.exercises[0].reps || ''}
              onChange={e => setFormData(prev => ({ ...prev, exercises: [{ ...prev.exercises[0], reps: Number(e.target.value) }] }))}
              placeholder="8"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="sets" className="block text-sm font-medium text-gray-700 mb-1">
              Séries
            </label>
            <input
              type="number"
              id="sets"
              name="sets"
              value={formData.exercises[0].sets || ''}
              onChange={e => setFormData(prev => ({ ...prev, exercises: [{ ...prev.exercises[0], sets: Number(e.target.value) }] }))}
              placeholder="3"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Comment s'est passée la séance ?"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading || !formData.exercises[0].name}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Ajout en cours...
            </span>
          ) : (
            "💪 Ajouter la séance (+100 XP)"
          )}
        </button>
      </form>
    </div>
  );
} 