import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Hook pour récupérer et synchroniser les stats utilisateur (XP, streak, niveau, badges...)
 * @param userId string | undefined
 * @returns { totalXP, currentStreak, longestStreak, totalWorkouts, lastWorkoutDate, badges, refetchStats }
 */
export function useUserStats(userId?: string) {
  const [totalXP, setTotalXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invalidationCounter, setInvalidationCounter] = useState(0);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    console.log('🔄 [useUserStats] Début de la récupération des stats pour userId:', userId);
    setLoading(true);
    try {
      // XP
      const { data: dailyProgress } = await supabase
        .from("daily_progress")
        .select("xp_earned")
        .eq("user_id", userId);
      const newTotalXP = dailyProgress?.reduce((sum: number, log: { xp_earned: number | null }) => sum + (log.xp_earned || 0), 0) || 0;
      setTotalXP(newTotalXP);
      console.log('📊 [useUserStats] XP récupéré:', newTotalXP);
      
      // Total Workouts (séances complétées)
      const { data: workouts, error: workoutsError } = await supabase
        .from("workouts")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed");
      
      if (workoutsError) {
        console.error('❌ [useUserStats] Erreur récupération workouts:', workoutsError);
      } else {
        const newTotalWorkouts = workouts?.length || 0;
        setTotalWorkouts(newTotalWorkouts);
        console.log('💪 [useUserStats] Total workouts récupéré:', newTotalWorkouts);
      }
      
      // Streak
      const { data: streakData } = await supabase.rpc('calculate_user_streak', { user_uuid: userId });
      const newCurrentStreak = streakData?.[0]?.current_streak || 0;
      const newLongestStreak = streakData?.[0]?.longest_streak || 0;
      const newLastWorkoutDate = streakData?.[0]?.last_workout_date || null;
      setCurrentStreak(newCurrentStreak);
      setLongestStreak(newLongestStreak);
      setLastWorkoutDate(newLastWorkoutDate);
      console.log('🔥 [useUserStats] Streak récupéré:', { current: newCurrentStreak, longest: newLongestStreak });
      
      // Badges (à adapter selon la table)
      const { data: badgeRows } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);
      setBadges(badgeRows || []);
      console.log('🏆 [useUserStats] Badges récupérés:', badgeRows?.length || 0);
    } catch (error) {
      console.error('❌ [useUserStats] Erreur lors de la récupération des stats:', error);
    } finally {
      setLoading(false);
      console.log('✅ [useUserStats] Récupération terminée');
    }
  }, [userId]);

  // Revalidation forcée
  const invalidateStats = useCallback(() => {
    console.log('🚀 [useUserStats] Revalidation déclenchée !');
    setInvalidationCounter(prev => prev + 1);
  }, []);

  // Initial fetch et revalidation automatique
  useEffect(() => {
    fetchStats();
  }, [fetchStats, invalidationCounter]);

  return {
    totalXP,
    currentStreak,
    longestStreak,
    totalWorkouts,
    lastWorkoutDate,
    badges,
    loading,
    refetchStats: fetchStats,
    invalidateStats,
  };
} 