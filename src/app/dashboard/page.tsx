import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navigation from "@/components/Navigation";
import NewWorkoutForm from "@/components/NewWorkoutForm";
import XPProgress from "@/components/XPProgress";
import MotivationalQuote from "@/components/MotivationalQuote";
import WeeklyMissions from "@/components/WeeklyMissions";
import BadgeSystem from "@/components/BadgeSystem";
import StreakDisplay from "@/components/StreakDisplay";
import SeriesHistory from "@/components/SeriesHistory";
import type { Workout } from "@/types/database";
import UserBadgeMiniList from "@/components/UserBadgeMiniList";
import HeaderDashboardClient from "@/components/HeaderDashboard.client";
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // Récupération du profil utilisateur
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('id', user.id)
    .single();
  const firstName = profile?.username || 'GRINDER';
  const avatarUrl = '/default-avatar.png';

  // TODO : Remplacer ce mock par la vraie récupération des badges récents depuis la DB
  const recentBadges = [
    { id: 'streak-3', name: 'Streak 3j', icon: '🔥', unlockedAt: new Date().toISOString() },
    { id: 'xp-1000', name: '1000 XP', icon: '💪', unlockedAt: new Date().toISOString() },
    { id: 'first-workout', name: 'Débutant', icon: '🎯', unlockedAt: new Date().toISOString() },
  ];

  // Récupérer les séances (complétées et planifiées)
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  // Récupérer l'XP total depuis daily_progress
  const { data: dailyProgress } = await supabase
    .from("daily_progress")
    .select("xp_earned")
    .eq("user_id", user.id);

  const totalXP = dailyProgress?.reduce((sum: number, log: { xp_earned: number | null }) => sum + (log.xp_earned || 0), 0) || 0;

  // Calculer les streaks avec la nouvelle fonction
  const { data: streakData } = await supabase
    .rpc('calculate_user_streak', { user_uuid: user.id });

  const currentStreak = streakData?.[0]?.current_streak || 0;
  const longestStreak = streakData?.[0]?.longest_streak || 0;
  const lastWorkoutDate = streakData?.[0]?.last_workout_date;

  // Calcul des données pour les missions hebdomadaires
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Début de la semaine (dimanche)
  currentWeekStart.setHours(0, 0, 0, 0);

  // Utiliser la nouvelle fonction pour les missions
  const { data: weeklyProgress } = await supabase
    .rpc('get_weekly_progress', { 
      user_uuid: user.id, 
      week_start: currentWeekStart.toISOString().split('T')[0] 
    });

  const workoutsThisWeek = weeklyProgress?.[0]?.workouts_this_week || 0;
  const weeklyXP = weeklyProgress?.[0]?.xp_this_week || 0;

  // Fonction pour générer un nom de séance basé sur les exercices
  const generateWorkoutName = (workout: Workout) => {
    if (workout.name && workout.name.trim() !== "") {
      return workout.name;
    }
    
    if (workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0) {
      const exerciseNames = workout.exercises.map(ex => ex.name).filter(Boolean);
      if (exerciseNames.length > 0) {
        if (exerciseNames.length === 1) {
          return `Séance ${exerciseNames[0]}`;
        } else if (exerciseNames.length <= 3) {
          return `Séance ${exerciseNames.slice(0, 2).join(" + ")}`;
        } else {
          return `Séance ${exerciseNames[0]} + ${exerciseNames.length - 1} autres`;
        }
      }
    }
    
    return "Séance d'entraînement";
  };

  // Formater la date pour l'affichage
  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return "Aujourd'hui";
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return "Demain";
    } else {
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // Séparer les séances complétées et planifiées
  const completedWorkouts = workouts?.filter(w => w.status === 'completed') || [];
  const plannedWorkoutsList = workouts?.filter(w => w.status === 'planned') || [];
  const inProgressWorkouts = workouts?.filter(w => w.status === 'in_progress') || [];

  return (
    <DashboardClient
      userId={user.id}
      firstName={firstName}
      avatarUrl={avatarUrl}
      recentBadges={recentBadges}
      plannedWorkouts={plannedWorkoutsList}
      workouts={workouts}
      currentWeekStart={currentWeekStart}
      weeklyXP={weeklyXP}
      workoutsThisWeek={workoutsThisWeek}
    />
  );
}