import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navigation from "@/components/Navigation";
import NewWorkoutForm from "@/components/NewWorkoutForm";
import XPProgress from "@/components/XPProgress";
import MotivationalQuote from "@/components/MotivationalQuote";
import WeeklyMissions from "@/components/WeeklyMissions";
import DailyMissions from "@/components/DailyMissions";
import BadgeSystem from "@/components/BadgeSystem";
import StreakDisplay from "@/components/StreakDisplay";
import SeriesHistory from "@/components/SeriesHistory";
import type { Workout } from "@/types/database";
import UserBadgeMiniList from "@/components/UserBadgeMiniList";
import HeaderDashboardClient from "@/components/HeaderDashboard.client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  // Récupération du profil utilisateur
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();
  const firstName = profile?.full_name?.split(' ')[0] || 'Athlète';
  const avatarUrl = profile?.avatar_url || '/default-avatar.png';

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <HeaderDashboardClient firstName={firstName} avatarUrl={avatarUrl} recentBadges={recentBadges} plannedWorkouts={plannedWorkoutsList} />

        {/* Section Gamification - Progression XP avec animations */}
        <div className="mb-8 animate-slide-in-right">
          <XPProgress totalXP={totalXP} />
        </div>

        {/* Section Streaks avec micro-interactions */}
        <div className="mb-8 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <StreakDisplay 
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            lastWorkoutDate={lastWorkoutDate}
          />
        </div>

        {/* Contenu principal en grille avec animations échelonnées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Colonne 1 : Formulaire d'ajout de séance */}
          <div className="md:col-span-2 lg:col-span-1 animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <NewWorkoutForm />
          </div>

          {/* Colonne 2 : Missions quotidiennes et hebdomadaires */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6">
            {/* Missions Quotidiennes */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
              <DailyMissions 
                totalWorkouts={completedWorkouts.length}
                currentStreak={currentStreak}
                totalXP={totalXP}
              />
            </div>
            
            {/* Missions Hebdomadaires */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <WeeklyMissions 
                workoutsThisWeek={workoutsThisWeek} 
                currentWeekStart={currentWeekStart}
                weeklyXP={weeklyXP}
              />
            </div>
            
            {/* Citation motivante */}
            <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
              <MotivationalQuote />
            </div>
          </div>

          {/* Colonne 3 : Liste des séances avec micro-interactions */}
          <div className="md:col-span-2 lg:col-span-1 animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover-lift">
              <h2 className="text-xl font-semibold mb-4">🏋️‍♂️ Mes Séances Récentes</h2>
              
              {!completedWorkouts || completedWorkouts.length === 0 ? (
                <div className="text-center py-8 animate-fade-in">
                  <div className="text-4xl mb-2 animate-bounce">💪</div>
                  <p className="text-gray-600">Aucune séance complétée</p>
                  <p className="text-sm text-gray-500">Commencez par ajouter votre première séance !</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                  {completedWorkouts.slice(0, 8).map((workout: Workout, index: number) => (
                    <div 
                      key={workout.id} 
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] hover-lift"
                      style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{generateWorkoutName(workout)}</h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">•</span>
                            <span className="text-xs text-gray-600 flex-shrink-0">
                              {formatWorkoutDate(workout.date)}
                            </span>
                          </div>
                          
                          {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">{workout.exercises.length} exercice{workout.exercises.length > 1 ? 's' : ''}</span>
                              {workout.exercises.length <= 3 && (
                                <span className="ml-2 hidden sm:inline">
                                  ({workout.exercises.map(ex => ex.name).join(", ")})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0 hover-glow">
                          +100 XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {completedWorkouts && completedWorkouts.length > 8 && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500">
                    Affichage des 8 dernières séances sur {completedWorkouts.length} total
                  </p>
                </div>
              )}
            </div>

            {/* Section Séances Planifiées avec animations */}
            {plannedWorkoutsList.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 hover-lift animate-slide-in-right" style={{ animationDelay: '0.8s' }}>
                <h2 className="text-xl font-semibold mb-4">📅 Séances Planifiées</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {plannedWorkoutsList.slice(0, 5).map((workout: Workout, index: number) => (
                    <div 
                      key={workout.id} 
                      className="border border-blue-200 rounded-lg p-3 bg-blue-50 hover:bg-blue-100 transition-all duration-200 hover-lift"
                      style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{generateWorkoutName(workout)}</h4>
                            <span className="text-xs text-blue-500 flex-shrink-0">📅</span>
                            <span className="text-xs text-blue-600 flex-shrink-0">
                              {formatWorkoutDate(workout.date)}
                            </span>
                          </div>
                          {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">{workout.exercises.length} exercice{workout.exercises.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex-shrink-0 hover-glow">
                            Planifiée
                          </div>
                          <a
                            href={`/session/${workout.id}`}
                            className="btn btn-primary btn-sm animate-bounce"
                            title="Démarrer la séance"
                          >
                            ▶️ Démarrer
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {plannedWorkoutsList.length > 5 && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500">
                      +{plannedWorkoutsList.length - 5} autres séances planifiées
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Section Séances À Reprendre avec animations */}
            {inProgressWorkouts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-6 hover-lift animate-slide-in-right" style={{ animationDelay: '0.85s' }}>
                <h2 className="text-xl font-semibold mb-4">🔄 Séances À Reprendre</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inProgressWorkouts.slice(0, 5).map((workout: Workout, index: number) => {
                    // Calcul de la progression corrigé et typé
                    // On suppose que les propriétés d'index sont stockées dans workout.meta ou workout.progress, sinon on met 0
                    const currentExercise = typeof (workout as any).current_exercise_index === "number"
                      ? (workout as any).current_exercise_index
                      : (workout as any).progress?.current_exercise_index ?? 0;
                    const currentSet = typeof (workout as any).current_set_index === "number"
                      ? (workout as any).current_set_index
                      : (workout as any).progress?.current_set_index ?? 0;
                    const totalExercises = Array.isArray(workout.exercises) ? workout.exercises.length : 0;
                    const totalSets = (Array.isArray(workout.exercises) && workout.exercises[currentExercise] && typeof workout.exercises[currentExercise].sets === "number")
                      ? workout.exercises[currentExercise].sets
                      : 1;
                    let progress = 0;
                    if (totalExercises > 0 && totalSets > 0) {
                      const totalSteps = totalExercises * totalSets;
                      const currentStep = (currentExercise * totalSets) + currentSet;
                      progress = Math.round((currentStep / totalSteps) * 100);
                      if (progress > 100) progress = 100;
                      if (progress < 0) progress = 0;
                    }
                    return (
                      <div
                        key={workout.id}
                        className="border border-orange-200 rounded-lg p-3 bg-orange-50 hover:bg-orange-100 transition-all duration-200 hover-lift"
                        style={{ animationDelay: `${0.95 + index * 0.1}s` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 truncate">{generateWorkoutName(workout)}</h4>
                              <span className="text-xs text-orange-500 flex-shrink-0">🔄</span>
                              <span className="text-xs text-orange-600 flex-shrink-0">
                                {formatWorkoutDate(workout.date)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Progression : {progress}%</span>
                              {workout.exercises && Array.isArray(workout.exercises) && workout.exercises.length > 0 && (
                                <span className="ml-2">
                                  (Exercice {currentExercise + 1}/{totalExercises}, Série {currentSet + 1}/{totalSets})
                                </span>
                              )}
                            </div>
                            {/* Barre de progression */}
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full flex-shrink-0 hover-glow">
                              À reprendre
                            </div>
                            <a
                              href={`/session/${workout.id}`}
                              className="btn btn-warning btn-sm animate-bounce"
                              title="Reprendre la séance"
                            >
                              ▶️ Reprendre
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {inProgressWorkouts.length > 5 && (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-gray-500">
                      +{inProgressWorkouts.length - 5} autres séances à reprendre
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}