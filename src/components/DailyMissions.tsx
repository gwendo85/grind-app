"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "./ToastNotification";

interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  icon: string;
  type: "workout" | "streak" | "xp" | "special";
}

interface DailyMissionsProps {
  totalWorkouts: number;
  currentStreak: number;
  totalXP: number;
}

export default function DailyMissions({ totalWorkouts, currentStreak, totalXP }: DailyMissionsProps) {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { showSuccess } = useToast();

  // Générer les missions quotidiennes
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('dailyMissionsDate');
    
    // Réinitialiser les missions si c'est un nouveau jour
    if (storedDate !== today) {
      localStorage.setItem('dailyMissionsDate', today);
      setCompletedMissions([]);
    } else {
      const stored = localStorage.getItem('completedDailyMissions');
      if (stored) {
        setCompletedMissions(JSON.parse(stored));
      }
    }

    // Générer 3 missions aléatoires
    const allMissions: DailyMission[] = [
      {
        id: "daily_workout",
        title: "Séance quotidienne",
        description: "Complète une séance aujourd'hui",
        target: 1,
        current: 0,
        reward: 50,
        icon: "💪",
        type: "workout"
      },
      {
        id: "streak_3",
        title: "Streak de 3 jours",
        description: "Maintiens un streak de 3 jours",
        target: 3,
        current: 0,
        reward: 100,
        icon: "🔥",
        type: "streak"
      },
      {
        id: "xp_200",
        title: "200 XP en une journée",
        description: "Gagne 200 XP aujourd'hui",
        target: 200,
        current: 0,
        reward: 75,
        icon: "⭐",
        type: "xp"
      },
      {
        id: "morning_workout",
        title: "Séance matinale",
        description: "Fais une séance avant 9h",
        target: 1,
        current: 0,
        reward: 100,
        icon: "🌅",
        type: "special"
      },
      {
        id: "streak_7",
        title: "Streak d'une semaine",
        description: "7 jours consécutifs",
        target: 7,
        current: 0,
        reward: 200,
        icon: "🏆",
        type: "streak"
      },
      {
        id: "xp_500",
        title: "500 XP en une journée",
        description: "Gagne 500 XP aujourd'hui",
        target: 500,
        current: 0,
        reward: 150,
        icon: "💎",
        type: "xp"
      }
    ];

    // Sélectionner 3 missions aléatoires
    const shuffled = allMissions.sort(() => 0.5 - Math.random());
    const selectedMissions = shuffled.slice(0, 3);
    
    setMissions(selectedMissions);
  }, []);

  // Mettre à jour les missions avec les données actuelles
  useEffect(() => {
    setMissions(prev => prev.map(mission => {
      let current = 0;
      
      switch (mission.type) {
        case "workout":
          current = totalWorkouts;
          break;
        case "streak":
          current = currentStreak;
          break;
        case "xp":
          current = totalXP;
          break;
        case "special":
          // Pour les missions spéciales, on simule une progression
          current = Math.floor(Math.random() * mission.target);
          break;
      }

      return { ...mission, current: Math.min(current, mission.target) };
    }));
  }, [totalWorkouts, currentStreak, totalXP]);

  const handleMissionComplete = useCallback((mission: DailyMission) => {
    setIsAnimating(true);
    
    // Ajouter aux missions complétées
    const newCompleted = [...completedMissions, mission.id];
    setCompletedMissions(newCompleted);
    localStorage.setItem('completedDailyMissions', JSON.stringify(newCompleted));

    // Afficher la notification
    showSuccess(`🎉 Mission accomplie : ${mission.title} ! +${mission.reward} XP`, 5000);

    // Animation de confetti
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  }, [completedMissions, showSuccess]);

  // Vérifier les missions complétées
  useEffect(() => {
    missions.forEach(mission => {
      if (mission.current >= mission.target && !completedMissions.includes(mission.id)) {
        handleMissionComplete(mission);
      }
    });
  }, [missions, completedMissions, handleMissionComplete]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-gradient-to-r from-green-500 to-emerald-600";
    if (progress >= 75) return "bg-gradient-to-r from-blue-500 to-indigo-600";
    if (progress >= 50) return "bg-gradient-to-r from-yellow-500 to-orange-600";
    return "bg-gradient-to-r from-gray-400 to-gray-500";
  };

  const getProgressText = (progress: number) => {
    if (progress >= 100) return "Mission accomplie ! 🎉";
    if (progress >= 75) return "Presque là ! 💪";
    if (progress >= 50) return "Bien parti ! 🚀";
    return "À commencer...";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl animate-pulse">🎯</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Missions Quotidiennes
          </h3>
          <p className="text-sm text-gray-600">
            {completedMissions.length} / {missions.length} complétées
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {missions.map((mission) => {
          const progress = Math.min((mission.current / mission.target) * 100, 100);
          const isCompleted = completedMissions.includes(mission.id);

          return (
            <div 
              key={mission.id} 
              className={`p-4 rounded-lg border-2 transition-all duration-300 hover-lift ${
                isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              } ${isAnimating && isCompleted ? 'animate-pulse-glow' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${isCompleted ? 'animate-bounce' : ''}`}>
                  {mission.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {mission.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isCompleted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{mission.reward} XP
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {mission.description}
                  </p>

                  {/* Barre de progression animée */}
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-1000 ease-out relative`}
                        style={{ width: `${progress}%` }}
                      >
                        {/* Effet de brillance */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Progression et statut */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {mission.current} / {mission.target}
                      {mission.type === "xp" && " XP"}
                    </span>
                    <span className={`font-medium ${
                      isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {getProgressText(progress)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge de complétion */}
              {isCompleted && (
                <div className="mt-3 p-2 bg-green-100 rounded-lg text-center animate-fade-in">
                  <p className="text-sm text-green-700 font-medium">
                    ✅ Mission accomplie ! +{mission.reward} XP gagné
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Message de motivation */}
      {completedMissions.length === missions.length && missions.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center animate-bounce-in">
          <p className="text-sm text-green-800 font-medium">
            🎉 Toutes les missions quotidiennes sont accomplies ! Excellent travail !
          </p>
        </div>
      )}
    </div>
  );
} 