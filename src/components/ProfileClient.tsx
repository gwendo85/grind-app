"use client";

import { useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/lib/supabase";
import Navigation from "./Navigation";
import BadgeSystem from "./BadgeSystem";

interface ProfileClientProps {
  userId: string;
  profile: any;
  user: any;
}

export default function ProfileClient({ userId, profile, user }: ProfileClientProps) {
  const { totalXP, currentStreak, longestStreak, totalWorkouts, loading } = useUserStats(userId);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'stats' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    avatar_url: profile?.avatar_url || '',
  });

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...formData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getLevel = (xp: number) => {
    return Math.floor(xp / 100) + 1;
  };

  const getXPForNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    return currentLevel * 100;
  };

  const getProgressToNextLevel = (xp: number) => {
    const currentLevel = getLevel(xp);
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    return ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: '📊' },
    { id: 'badges', name: 'Badges', icon: '🏆' },
    { id: 'stats', name: 'Statistiques', icon: '📈' },
    { id: 'settings', name: 'Paramètres', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* En-tête du profil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={profile?.avatar_url || '/default-avatar.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600">
                  📷
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile?.first_name || 'Utilisateur'} {profile?.last_name || ''}
                </h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              {/* Niveau et XP */}
              {!loading && (
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">Niveau {getLevel(totalXP)}</div>
                    <div className="text-sm text-gray-600">{totalXP} XP</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression vers le niveau {getLevel(totalXP) + 1}</span>
                      <span>{Math.round(getProgressToNextLevel(totalXP))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressToNextLevel(totalXP)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{totalXP}</div>
                    <div className="text-blue-800 font-medium">XP Total</div>
                    <div className="text-sm text-blue-600 mt-1">Niveau {getLevel(totalXP)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{totalWorkouts}</div>
                    <div className="text-green-800 font-medium">Séances Complétées</div>
                    <div className="text-sm text-green-600 mt-1">Dernière: {profile?.last_workout_date ? new Date(profile.last_workout_date).toLocaleDateString('fr-FR') : 'Jamais'}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{currentStreak}</div>
                    <div className="text-red-800 font-medium">Streak Actuel</div>
                    <div className="text-sm text-red-600 mt-1">Record: {longestStreak} jours</div>
                  </div>
                </div>

                {/* BadgeSystem compact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Badges Récemment Débloqués</h3>
                  <BadgeSystem userId={userId} />
                </div>
              </div>
            )}

            {activeTab === 'badges' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Tous mes Badges</h3>
                <BadgeSystem userId={userId} />
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Statistiques Détaillées</h3>
                
                {/* Graphiques et statistiques avancées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Progression XP</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Niveau actuel</span>
                        <span className="font-bold">{getLevel(totalXP)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>XP pour le prochain niveau</span>
                        <span className="font-bold">{getXPForNextLevel(totalXP) - totalXP} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progression</span>
                        <span className="font-bold">{Math.round(getProgressToNextLevel(totalXP))}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Streak</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Streak actuel</span>
                        <span className="font-bold">{currentStreak} jours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Record personnel</span>
                        <span className="font-bold">{longestStreak} jours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Moyenne par semaine</span>
                        <span className="font-bold">{totalWorkouts > 0 ? Math.round((totalWorkouts / Math.max(1, Math.floor((Date.now() - new Date(profile?.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)))) * 10) / 10 : 0} séances</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Paramètres du Profil</h3>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {profile?.first_name || 'Non défini'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {profile?.last_name || 'Non défini'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                        {user.email}
                      </div>
                    </div>
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