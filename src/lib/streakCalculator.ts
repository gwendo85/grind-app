import type { Workout } from "@/types/database";

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
}

export function calculateStreaks(workouts: Workout[]): StreakData {
  if (!workouts || workouts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null
    };
  }

  // Trier les séances par date (plus récentes en premier)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Convertir les dates en objets Date et normaliser à minuit
  const workoutDates = sortedWorkouts.map(workout => {
    const date = new Date(workout.created_at);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Supprimer les doublons (même jour)
  const uniqueDates = workoutDates.filter((date, index, self) => 
    index === self.findIndex(d => d.getTime() === date.getTime())
  );

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null
    };
  }

  // Calculer le streak actuel
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Vérifier si la dernière séance était hier ou aujourd'hui
  const lastWorkoutDate = uniqueDates[0];
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceLastWorkout <= 1) {
    // Calculer le streak actuel
    let streakCount = 1;
    let currentDate = new Date(lastWorkoutDate);
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const previousDate = new Date(uniqueDates[i]);
      const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDifference === 1) {
        streakCount++;
        currentDate = previousDate;
      } else {
        break;
      }
    }
    
    currentStreak = streakCount;
  } else {
    currentStreak = 0;
  }

  // Calculer le streak le plus long
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = uniqueDates[i];
    const nextDate = uniqueDates[i + 1];
    const dayDifference = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDifference === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  // Vérifier le dernier streak
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate: uniqueDates[0]
  };
}

// Fonction utilitaire pour formater les streaks
export function formatStreak(streak: number): string {
  if (streak === 0) return "Aucun streak";
  if (streak === 1) return "1 jour";
  return `${streak} jours`;
}

// Fonction pour obtenir un message motivant basé sur le streak
export function getStreakMessage(currentStreak: number, longestStreak: number): string {
  if (currentStreak === 0) {
    return "Commence ton streak aujourd'hui ! 💪";
  }
  
  if (currentStreak === 1) {
    return "Premier jour de ton streak ! Continue demain ! 🚀";
  }
  
  if (currentStreak >= longestStreak) {
    return `Nouveau record ! ${currentStreak} jours consécutifs ! 🔥`;
  }
  
  if (currentStreak >= 7) {
    return `Une semaine complète ! Tu es en feu ! ⚡`;
  }
  
  if (currentStreak >= 3) {
    return `${currentStreak} jours consécutifs ! Tu tiens le rythme ! 💪`;
  }
  
  return `${currentStreak} jours consécutifs ! Continue comme ça ! 🎯`;
} 