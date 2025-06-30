"use client";

import Link from "next/link";

interface BadgeSystemProps {
  totalXP: number;
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'xp' | 'workouts' | 'streak' | 'special';
  requirement: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function BadgeSystem({ totalXP, totalWorkouts, currentStreak, longestStreak }: BadgeSystemProps) {
  // Définition de tous les badges
  const allBadges: Badge[] = [
    // Badges XP
    {
      id: 'first-100',
      name: 'Premier Pas',
      description: 'Gagne tes premiers 100 XP',
      icon: '🌱',
      category: 'xp',
      requirement: 100,
      unlocked: totalXP >= 100,
      rarity: 'common'
    },
    {
      id: 'xp-500',
      name: 'Motivé',
      description: 'Atteins 500 XP',
      icon: '💪',
      category: 'xp',
      requirement: 500,
      unlocked: totalXP >= 500,
      rarity: 'common'
    },
    {
      id: 'xp-1000',
      name: 'Déterminé',
      description: 'Atteins 1000 XP',
      icon: '🔥',
      category: 'xp',
      requirement: 1000,
      unlocked: totalXP >= 1000,
      rarity: 'rare'
    },
    {
      id: 'xp-2500',
      name: 'Persévérant',
      description: 'Atteins 2500 XP',
      icon: '⚡',
      category: 'xp',
      requirement: 2500,
      unlocked: totalXP >= 2500,
      rarity: 'rare'
    },
    {
      id: 'xp-5000',
      name: 'Vétéran',
      description: 'Atteins 5000 XP',
      icon: '🏆',
      category: 'xp',
      requirement: 5000,
      unlocked: totalXP >= 5000,
      rarity: 'epic'
    },
    {
      id: 'xp-10000',
      name: 'Légende',
      description: 'Atteins 10000 XP',
      icon: '👑',
      category: 'xp',
      requirement: 10000,
      unlocked: totalXP >= 10000,
      rarity: 'legendary'
    },

    // Badges Workouts
    {
      id: 'first-workout',
      name: 'Débutant',
      description: 'Complète ta première séance',
      icon: '🎯',
      category: 'workouts',
      requirement: 1,
      unlocked: totalWorkouts >= 1,
      rarity: 'common'
    },
    {
      id: 'workouts-10',
      name: 'Régulier',
      description: 'Complète 10 séances',
      icon: '📈',
      category: 'workouts',
      requirement: 10,
      unlocked: totalWorkouts >= 10,
      rarity: 'common'
    },
    {
      id: 'workouts-25',
      name: 'Consistant',
      description: 'Complète 25 séances',
      icon: '🎖️',
      category: 'workouts',
      requirement: 25,
      unlocked: totalWorkouts >= 25,
      rarity: 'rare'
    },
    {
      id: 'workouts-50',
      name: 'Dévoué',
      description: 'Complète 50 séances',
      icon: '💎',
      category: 'workouts',
      requirement: 50,
      unlocked: totalWorkouts >= 50,
      rarity: 'epic'
    },
    {
      id: 'workouts-100',
      name: 'Maître',
      description: 'Complète 100 séances',
      icon: '🌟',
      category: 'workouts',
      requirement: 100,
      unlocked: totalWorkouts >= 100,
      rarity: 'legendary'
    },

    // Badges Streak
    {
      id: 'streak-3',
      name: 'En Forme',
      description: '3 jours consécutifs',
      icon: '🔥',
      category: 'streak',
      requirement: 3,
      unlocked: currentStreak >= 3,
      rarity: 'common'
    },
    {
      id: 'streak-7',
      name: 'Semaine Parfaite',
      description: '7 jours consécutifs',
      icon: '📅',
      category: 'streak',
      requirement: 7,
      unlocked: currentStreak >= 7,
      rarity: 'rare'
    },
    {
      id: 'streak-14',
      name: 'Discipliné',
      description: '14 jours consécutifs',
      icon: '⚡',
      category: 'streak',
      requirement: 14,
      unlocked: currentStreak >= 14,
      rarity: 'epic'
    },
    {
      id: 'streak-30',
      name: 'Machine',
      description: '30 jours consécutifs',
      icon: '🤖',
      category: 'streak',
      requirement: 30,
      unlocked: currentStreak >= 30,
      rarity: 'legendary'
    },

    // Badges Spéciaux
    {
      id: 'longest-streak-10',
      name: 'Record Personnel',
      description: 'Streak record de 10 jours',
      icon: '🏅',
      category: 'special',
      requirement: 10,
      unlocked: longestStreak >= 10,
      rarity: 'rare'
    },
    {
      id: 'longest-streak-30',
      name: 'Record Absolu',
      description: 'Streak record de 30 jours',
      icon: '🏆',
      category: 'special',
      requirement: 30,
      unlocked: longestStreak >= 30,
      rarity: 'legendary'
    }
  ];

  const unlockedBadges = allBadges.filter(badge => badge.unlocked);
  const lockedBadges = allBadges.filter(badge => !badge.unlocked);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Commun';
      case 'rare': return 'Rare';
      case 'epic': return 'Épique';
      case 'legendary': return 'Légendaire';
      default: return 'Commun';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏅</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Badges & Réalisations
            </h3>
            <p className="text-sm text-gray-600">
              {unlockedBadges.length} / {allBadges.length} badges débloqués
            </p>
          </div>
        </div>
        <Link 
          href="/badges" 
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <span>Voir tous</span>
          <span>→</span>
        </Link>
      </div>

      {/* Progression générale */}
      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-sm font-bold text-gray-900">
            {Math.round((unlockedBadges.length / allBadges.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedBadges.length / allBadges.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Badges débloqués */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Badges débloqués ({unlockedBadges.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {unlockedBadges.slice(0, 6).map((badge) => (
            <div
              key={badge.id}
              className={`p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)} transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{badge.icon}</div>
                <h5 className="text-xs font-medium text-gray-900 mb-1">
                  {badge.name}
                </h5>
                <p className="text-xs text-gray-600 mb-2">
                  {badge.description}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  badge.rarity === 'common' ? 'bg-gray-100 text-gray-700' :
                  badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  badge.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {getRarityText(badge.rarity)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {unlockedBadges.length > 6 && (
          <div className="text-center mt-3">
            <Link 
              href="/badges" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Voir tous les badges débloqués ({unlockedBadges.length})
            </Link>
          </div>
        )}
      </div>

      {/* Badges verrouillés (aperçu) */}
      {lockedBadges.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-3">
            Prochains objectifs ({lockedBadges.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lockedBadges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1 filter grayscale">{badge.icon}</div>
                  <h5 className="text-xs font-medium text-gray-500 mb-1">
                    ???
                  </h5>
                  <p className="text-xs text-gray-400 mb-2">
                    Badge verrouillé
                  </p>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                    À débloquer
                  </span>
                </div>
              </div>
            ))}
          </div>
          {lockedBadges.length > 6 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              +{lockedBadges.length - 6} autres badges à découvrir...
            </p>
          )}
        </div>
      )}

      {/* Statistiques des badges */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{unlockedBadges.length}</div>
            <div className="text-xs text-gray-600">Badges débloqués</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">
              {allBadges.filter(b => b.rarity === 'legendary' && b.unlocked).length}
            </div>
            <div className="text-xs text-gray-600">Légendaires</div>
          </div>
        </div>
      </div>
    </div>
  );
} 