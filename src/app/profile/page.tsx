'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

interface UserStats {
  total_workouts: number;
  current_streak: number;
  total_xp: number;
  level: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      await fetchProfile(user.id);
      await fetchStats(user.id);
      setIsLoading(false);
    };

    getUser();
  }, [supabase, router]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || '');
    }
  };

  const fetchStats = async (userId: string) => {
    // Récupérer les statistiques depuis user_profiles et workouts
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('total_xp, current_streak, longest_streak')
      .eq('id', userId)
      .single();

    const { data: workouts } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId);

    if (workouts) {
      const totalWorkouts = workouts.length;
      const totalXp = userProfile?.total_xp || workouts.reduce((sum, workout) => sum + (workout.xp_earned || 0), 0);
      const level = Math.floor(totalXp / 100) + 1;
      const currentStreak = userProfile?.current_streak || calculateStreak(workouts);
      
      setStats({
        total_workouts: totalWorkouts,
        current_streak: currentStreak,
        total_xp: totalXp,
        level: level
      });
    }
  };

  const calculateStreak = (workouts: any[]) => {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = workouts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].created_at);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setProfile(prev => prev ? { ...prev, display_name: displayName } : null);
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-gray-700 text-xl animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header avec navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Retour</span>
            </button>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Mon Profil</h1>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Section Profil Principal */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg ring-4 ring-white">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* Informations utilisateur */}
            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-2">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-gray-50 text-gray-900 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-lg font-semibold"
                      placeholder="Votre nom"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(profile?.display_name || '');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors duration-200 font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start space-x-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {displayName || 'Utilisateur'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-gray-600 text-sm sm:text-base">{user?.email}</p>
                <p className="text-gray-500 text-xs sm:text-sm">
                  Membre depuis {new Date(user?.created_at || '').toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                  {stats.total_workouts}
                </div>
                <div className="text-gray-700 text-sm sm:text-base font-medium">Séances totales</div>
                <div className="text-blue-500 text-2xl">🏋️</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-200">
                  {stats.current_streak}
                </div>
                <div className="text-gray-700 text-sm sm:text-base font-medium">Jours consécutifs</div>
                <div className="text-green-500 text-2xl">🔥</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors duration-200">
                  {stats.total_xp}
                </div>
                <div className="text-gray-700 text-sm sm:text-base font-medium">XP total</div>
                <div className="text-yellow-500 text-2xl">⭐</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="text-center space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
                  {stats.level}
                </div>
                <div className="text-gray-700 text-sm sm:text-base font-medium">Niveau</div>
                <div className="text-purple-500 text-2xl">🏅</div>
              </div>
            </div>
          </div>
        )}

        {/* Section Paramètres */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-lg">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Paramètres</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v12a4 4 0 004 4h12a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-4 4v12a4 4 0 004 4h12" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">Notifications</div>
                  <div className="text-gray-500 text-sm">Recevoir des rappels d'entraînement</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">Mode clair</div>
                  <div className="text-gray-500 text-sm">Activer le thème clair</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">Synchronisation</div>
                  <div className="text-gray-500 text-sm">Synchroniser avec d'autres appareils</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 