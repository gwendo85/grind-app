"use client";
import Navigation from "./Navigation";
import NewWorkoutForm from "./NewWorkoutForm";
import XPProgress from "./XPProgress";
import MotivationalQuote from "./MotivationalQuote";
import WeeklyMissions from "./WeeklyMissions";
import StreakDisplay from "./StreakDisplay";
import BadgeSystem from "./BadgeSystem";
import HeaderDashboardClient from "./HeaderDashboard.client";
import { useUserStats } from "../hooks/useUserStats";
import { useMemo } from "react";

interface DashboardClientProps {
  userId: string;
  firstName?: string;
  avatarUrl?: string;
  recentBadges?: any[];
  plannedWorkouts?: any[];
  workouts?: any[];
  currentWeekStart?: Date;
  weeklyXP?: number;
  workoutsThisWeek?: number;
}

export default function DashboardClient({
  userId,
  firstName,
  avatarUrl,
  recentBadges,
  plannedWorkouts,
  workouts,
  currentWeekStart,
  weeklyXP,
  workoutsThisWeek
}: DashboardClientProps) {
  // Tous les hooks ici, jamais dans un if
  // const { ... } = useUserStats(userId); // exemple si besoin

  if (!userId) {
    return <div>Chargement du tableau de bord...</div>;
  }

  // Valeurs par défaut pour éviter les erreurs de typage
  const safeUserId = userId || "";
  const safeFirstName = firstName || "Utilisateur";
  const safeAvatarUrl = avatarUrl || "/default-avatar.png";
  const safeRecentBadges = recentBadges || [];
  const safePlannedWorkouts = plannedWorkouts || [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-white px-2 py-4">
      <div className="w-full max-w-2xl mx-auto px-2 py-6 sm:px-6 sm:py-8 rounded-3xl shadow-xl backdrop-blur-md bg-white/60 border border-white/30" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <HeaderDashboardClient 
          firstName={safeFirstName} 
          avatarUrl={safeAvatarUrl} 
          recentBadges={safeRecentBadges}
          plannedWorkouts={safePlannedWorkouts}
        />
        <XPProgress userId={safeUserId} />
        <div className="my-6">
          <NewWorkoutForm userId={safeUserId} />
        </div>
        {safePlannedWorkouts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              📅 Séances planifiées
            </h2>
            <ul className="space-y-3">
              {safePlannedWorkouts.map((workout: any) => (
                <li key={workout.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 rounded-xl p-3 border border-white/40 shadow-sm">
                  <div>
                    <span className="font-medium text-gray-800">{workout.name || 'Séance sans nom'}</span>
                    <span className="ml-2 text-sm text-gray-500">{workout.date ? new Date(workout.date).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                  <button
                    onClick={() => window.location.href = `/session/${workout.id}`}
                    className="mt-2 sm:mt-0 sm:ml-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold py-2 px-4 rounded-full shadow hover:scale-105 transition-transform text-sm"
                  >
                    Démarrer
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Ajoute ici les autres composants du dashboard selon tes besoins */}
        {/* <Navigation />
        <MotivationalQuote />
        <WeeklyMissions userId={safeUserId} />
        <StreakDisplay userId={safeUserId} />
        <BadgeSystem userId={safeUserId} /> */}
      </div>
    </div>
  );
}
