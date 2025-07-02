"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkouts } from "../hooks/useWorkouts";
import { useToast } from "./ToastNotification";

interface Exercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  rest?: number;
}

interface WorkoutFormData {
  name: string;
  exercises: Exercise[];
  date: string;
  notes?: string;
}

interface NewWorkoutFormProps {
  userId: string;
}

export default function NewWorkoutForm({ userId }: NewWorkoutFormProps) {
  const { addWorkout, loading: isSubmitting } = useWorkouts(userId);
  const [formData, setFormData] = useState<WorkoutFormData>({
    name: "",
    exercises: [{ name: "", weight: 20, reps: 10, sets: 3, rest: 90 }],
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });
  const [isGeneratingName, setIsGeneratingName] = useState(false);
  const { showSuccess, showError, showInfo } = useToast();

  // Générer automatiquement un nom de séance basé sur les exercices
  const generateWorkoutName = useCallback(() => {
    setIsGeneratingName(true);
    
    setTimeout(() => {
      const validExercises = formData.exercises.filter(ex => ex.name.trim() !== "");
      
      if (validExercises.length === 0) {
        setFormData(prev => ({ ...prev, name: "Séance d'entraînement" }));
      } else if (validExercises.length === 1) {
        setFormData(prev => ({ ...prev, name: `Séance ${validExercises[0].name}` }));
      } else if (validExercises.length <= 3) {
        const names = validExercises.map(ex => ex.name);
        setFormData(prev => ({ ...prev, name: `Séance ${names.join(" + ")}` }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          name: `Séance ${validExercises[0].name} + ${validExercises.length - 1} autres` 
        }));
      }
      
      setIsGeneratingName(false);
      showInfo("Nom de séance généré automatiquement ! ✨");
    }, 500);
  }, [formData.exercises, formData.name, showInfo]);

  // Générer automatiquement le nom quand les exercices changent
  useEffect(() => {
    const validExercises = formData.exercises.filter(ex => ex.name.trim() !== "");
    if (validExercises.length > 0 && !formData.name.trim()) {
      generateWorkoutName();
    }
  }, [formData.exercises, formData.name, generateWorkoutName]);

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: "", weight: 20, reps: 10, sets: 3, rest: 90 }]
    }));
    showInfo("Nouvel exercice ajouté ! 💪");
  };

  const removeExercise = (index: number) => {
    if (formData.exercises.length > 1) {
      setFormData(prev => ({
        ...prev,
        exercises: prev.exercises.filter((_, i) => i !== index)
      }));
      showInfo("Exercice supprimé ! 🗑️");
    } else {
      showError("Vous devez avoir au moins un exercice !");
    }
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      )
    }));
  };

  const isExerciseValid = (exercise: Exercise) => {
    return (
      exercise.reps >= 1 &&
      exercise.reps <= 100 &&
      exercise.sets >= 1 &&
      exercise.sets <= 20 &&
      exercise.weight >= 0 &&
      (typeof exercise.rest === 'number' ? exercise.rest : 90) >= 30 &&
      (typeof exercise.rest === 'number' ? exercise.rest : 90) <= 300
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showError("Le nom de la séance est obligatoire !");
      return;
    }

    const validExercises = formData.exercises.filter(ex => 
      ex.name.trim() !== "" && ex.weight > 0 && ex.reps > 0 && ex.sets > 0
    );

    if (validExercises.length === 0) {
      showError("Ajoutez au moins un exercice valide !");
      return;
    }

    try {
      // Déterminer le statut selon la date
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      const status = selectedDate.getTime() <= today.getTime() ? 'completed' : 'planned';

      // Préparer les données de la séance
      const workoutData = {
        name: formData.name.trim(),
        exercises: validExercises,
        date: formData.date,
        status: status as 'completed' | 'planned',
        notes: formData.notes?.trim() || undefined
      };

      // Utiliser le hook pour ajouter la séance
      await addWorkout(workoutData);

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        exercises: [{ name: "", weight: 0, reps: 0, sets: 1 }],
        date: new Date().toISOString().split('T')[0],
        notes: ""
      });

      // Messages de succès selon le statut
      if (status === 'completed') {
        showSuccess(`🎉 Séance "${formData.name}" ajoutée ! +100 XP gagné !`, 5000);
      } else {
        showSuccess(`📅 Séance "${formData.name}" planifiée pour le ${new Date(formData.date).toLocaleDateString('fr-FR')} !`, 5000);
      }

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la séance:', error);
      showError("Erreur lors de l'ajout de la séance !");
    }
  };

  const isToday = formData.date === new Date().toISOString().split('T')[0];
  const isFuture = new Date(formData.date) > new Date();

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl animate-pulse">💪</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nouvelle Séance
          </h2>
          <p className="text-sm text-gray-600">
            Ajoutez vos exercices et progressez !
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom de la séance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la séance *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring transition-all duration-200"
              placeholder="Ex: Séance pectoraux"
              required
            />
            <button
              type="button"
              onClick={generateWorkoutName}
              disabled={isGeneratingName}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 focus-ring disabled:opacity-50"
            >
              {isGeneratingName ? "..." : "✨"}
            </button>
          </div>
        </div>

        {/* Date de la séance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de la séance
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring transition-all duration-200"
          />
          <div className="mt-2 text-sm">
            {isToday && (
              <span className="text-green-600 font-medium">✅ Séance pour aujourd&apos;hui (immédiat)</span>
            )}
            {isFuture && (
              <span className="text-blue-600 font-medium">📅 Séance planifiée pour le futur</span>
            )}
          </div>
        </div>

        {/* Exercices */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Exercices *
            </label>
            <button
              type="button"
              onClick={addExercise}
              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors duration-200 focus-ring hover-scale"
              disabled={!isExerciseValid(formData.exercises[formData.exercises.length-1])}
            >
              + Ajouter
            </button>
          </div>
          {/* Scroll horizontal sur mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="flex flex-col gap-3 min-w-[600px]">
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="flex flex-col md:flex-row md:items-end gap-2 w-full bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition-all duration-200">
                  {/* Nom exercice */}
                  <div className="flex flex-col flex-1 min-w-0 max-w-xs w-full">
                    <input
                      id={`ex-name-${index}`}
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      className="w-full max-w-xs h-9 px-3 py-1 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Squat"
                      required
                      onKeyDown={e => { if (e.key === 'Enter') { document.getElementById(`ex-weight-${index}`)?.focus(); } }}
                    />
                  </div>
                  {/* Poids */}
                  <div className="flex flex-col min-w-0 max-w-xs w-full md:min-w-[80px] md:max-w-[100px]">
                    <input
                      id={`ex-weight-${index}`}
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => updateExercise(index, 'weight', parseFloat(e.target.value) || 0)}
                      className={`w-full max-w-xs h-9 px-3 py-1 border rounded-md text-base focus:ring-2 ${exercise.weight < 0 ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="20"
                      min="0"
                      max="500"
                      required
                      onKeyDown={e => { if (e.key === 'Enter') { document.getElementById(`ex-reps-${index}`)?.focus(); } }}
                    />
                    <span className="text-xs text-gray-400 ml-1">kg</span>
                    {exercise.weight < 0 && <span className="text-xs text-red-500">Poids ≥ 0</span>}
                  </div>
                  {/* Reps */}
                  <div className="flex flex-col min-w-0 max-w-xs w-full md:min-w-[70px] md:max-w-[90px]">
                    <input
                      id={`ex-reps-${index}`}
                      type="number"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                      className={`w-full max-w-xs h-9 px-3 py-1 border rounded-md text-base focus:ring-2 ${exercise.reps < 1 || exercise.reps > 100 ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="10"
                      min="1"
                      max="100"
                      required
                      onKeyDown={e => { if (e.key === 'Enter') { document.getElementById(`ex-sets-${index}`)?.focus(); } }}
                    />
                    <span className="text-xs text-gray-400 ml-1">reps</span>
                    {(exercise.reps < 1 || exercise.reps > 100) && <span className="text-xs text-red-500">1-100</span>}
                  </div>
                  {/* Séries */}
                  <div className="flex flex-col min-w-0 max-w-xs w-full md:min-w-[70px] md:max-w-[90px]">
                    <input
                      id={`ex-sets-${index}`}
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                      className={`w-full max-w-xs h-9 px-3 py-1 border rounded-md text-base focus:ring-2 ${exercise.sets < 1 || exercise.sets > 20 ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="3"
                      min="1"
                      max="20"
                      required
                      onKeyDown={e => { if (e.key === 'Enter') { document.getElementById(`ex-rest-${index}`)?.focus(); } }}
                    />
                    <span className="text-xs text-gray-400 ml-1">séries</span>
                    {(exercise.sets < 1 || exercise.sets > 20) && <span className="text-xs text-red-500">1-20</span>}
                  </div>
                  {/* Repos */}
                  <div className="flex flex-col min-w-0 max-w-xs w-full md:min-w-[80px] md:max-w-[100px]">
                    <input
                      id={`ex-rest-${index}`}
                      type="number"
                      value={typeof exercise.rest === 'number' ? exercise.rest : 90}
                      onChange={(e) => updateExercise(index, 'rest', parseInt(e.target.value) || 90)}
                      className={`w-full max-w-xs h-9 px-3 py-1 border rounded-md text-base focus:ring-2 ${(typeof exercise.rest === 'number' ? exercise.rest : 90) < 30 || (typeof exercise.rest === 'number' ? exercise.rest : 90) > 300 ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                      placeholder="90"
                      min="30"
                      max="300"
                      required
                      onKeyDown={e => { if (e.key === 'Enter') { if (isExerciseValid(exercise)) addExercise(); } }}
                    />
                    <span className="text-xs text-gray-400 ml-1">sec</span>
                    {((typeof exercise.rest === 'number' ? exercise.rest : 90) < 30 || (typeof exercise.rest === 'number' ? exercise.rest : 90) > 300) && <span className="text-xs text-red-500">30-300</span>}
                  </div>
                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="p-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors duration-200 focus-ring flex items-center justify-center ml-1 mt-2"
                    aria-label="Supprimer l'exercice"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring transition-all duration-200"
            rows={3}
            placeholder="Commentaires sur votre séance..."
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover-lift hover-glow"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isToday ? "Ajout en cours..." : "Planification..."}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {isToday ? "💪 Ajouter la séance" : "📅 Planifier la séance"}
            </span>
          )}
        </button>
      </form>

      {/* Indicateurs visuels */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm text-blue-800">
          <span className="font-medium">💡</span>
          <span>
            {isToday 
              ? "Séance immédiate : +100 XP et mise à jour du streak"
              : "Séance planifiée : sera marquée comme complétée à la date choisie"
            }
          </span>
        </div>
      </div>
    </div>
  );
} 