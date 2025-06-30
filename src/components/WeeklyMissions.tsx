"use client";

import { useState } from "react";

interface WeeklyMissionsProps {
  workoutsThisWeek: number;
  currentWeekStart: Date;
  weeklyXP: number;
}

export default function WeeklyMissions({ 
  workoutsThisWeek, 
  currentWeekStart, 
  weeklyXP 
}: WeeklyMissionsProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculer les objectifs hebdomadaires
  const weeklyGoals = {
    workouts: 5, // 5 séances par semaine
    xp: 500,     // 500 XP par semaine
    streak: 7    // 7 jours consécutifs
  };

  // Calculer les progressions
  const workoutProgress = Math.min((workoutsThisWeek / weeklyGoals.workouts) * 100, 100);
  const xpProgress = Math.min((weeklyXP / weeklyGoals.xp) * 100, 100);

  // Déterminer les couleurs selon la progression
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (progress >= 75) return "bg-gradient-to-r from-blue-500 to-indigo-600";
    if (progress >= 50) return "bg-gradient-to-r from-yellow-500 to-orange-600";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  // Formater la date de début de semaine
  const formatWeekStart = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-pulse">📅</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Missions Hebdomadaires
            </h3>
            <p className="text-sm text-gray-600">
              Semaine du {formatWeekStart(currentWeekStart)}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 focus-ring"
        >
          {expanded ? "Réduire" : "Voir plus"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Mission 1: Séances hebdomadaires */}
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">💪</span>
              <h4 className="font-medium text-gray-900">Séances hebdomadaires</h4>
            </div>
            <span className="text-sm text-gray-600">
              {workoutsThisWeek} / {weeklyGoals.workouts}
            </span>
          </div>
          
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`${getProgressColor(workoutProgress)} h-2 rounded-full transition-all duration-1000 ease-out relative`}
                style={{ width: `${workoutProgress}%` }}
              >
                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {workoutProgress >= 100 
              ? "🎉 Objectif atteint ! Excellent travail !"
              : `${weeklyGoals.workouts - workoutsThisWeek} séance${weeklyGoals.workouts - workoutsThisWeek > 1 ? 's' : ''} restante${weeklyGoals.workouts - workoutsThisWeek > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Mission 2: XP hebdomadaire */}
        <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">⭐</span>
              <h4 className="font-medium text-gray-900">XP hebdomadaire</h4>
            </div>
            <span className="text-sm text-gray-600">
              {weeklyXP} / {weeklyGoals.xp}
            </span>
          </div>
          
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`${getProgressColor(xpProgress)} h-2 rounded-full transition-all duration-1000 ease-out relative`}
                style={{ width: `${xpProgress}%` }}
              >
                {/* Effet de brillance */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            {xpProgress >= 100 
              ? "🎉 Objectif XP atteint ! Tu progresses bien !"
              : `${weeklyGoals.xp - weeklyXP} XP restant${weeklyGoals.xp - weeklyXP > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Section étendue avec plus de détails */}
        {expanded && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
            <h4 className="font-medium text-blue-900 mb-2">📊 Statistiques de la semaine</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Séances complétées</p>
                <p className="font-bold text-blue-900">{workoutsThisWeek}</p>
              </div>
              <div>
                <p className="text-blue-700">XP gagné</p>
                <p className="font-bold text-blue-900">{weeklyXP}</p>
              </div>
              <div>
                <p className="text-blue-700">Progression séances</p>
                <p className="font-bold text-blue-900">{workoutProgress.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-blue-700">Progression XP</p>
                <p className="font-bold text-blue-900">{xpProgress.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-blue-100 rounded text-center">
              <p className="text-xs text-blue-800">
                💡 Les missions se réinitialisent chaque dimanche à minuit
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message de motivation */}
      {(workoutProgress >= 100 || xpProgress >= 100) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center animate-bounce-in">
          <p className="text-sm text-green-800 font-medium">
            🎉 Au moins un objectif hebdomadaire atteint ! Continue comme ça !
          </p>
        </div>
      )}
    </div>
  );
} 