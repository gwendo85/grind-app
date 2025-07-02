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
    <div>
      <HeaderDashboardClient 
        firstName={safeFirstName} 
        avatarUrl={safeAvatarUrl} 
        recentBadges={safeRecentBadges}
        plannedWorkouts={safePlannedWorkouts}
      />
      <XPProgress userId={safeUserId} />
      {/* Ajoute ici les autres composants du dashboard selon tes besoins */}
      {/* <Navigation />
      <NewWorkoutForm userId={safeUserId} />
      <MotivationalQuote />
      <WeeklyMissions userId={safeUserId} />
      <StreakDisplay userId={safeUserId} />
      <BadgeSystem userId={safeUserId} /> */}
    </div>
  );
}
