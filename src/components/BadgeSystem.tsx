"use client";

import Link from "next/link";
import { useUserStats } from "../hooks/useUserStats";

interface BadgeSystemProps {
  userId: string;
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

export default function BadgeSystem({ userId }: BadgeSystemProps) {
  const { totalXP, currentStreak, longestStreak, totalWorkouts, loading } = useUserStats(userId);

  // Loader si les données ne sont pas prêtes
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
      </div>
    );
  }

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

  // Calculer les statistiques
  const unlockedBadges = allBadges.filter(badge => badge.unlocked);
  const totalBadges = allBadges.length;
  const completionRate = Math.round((unlockedBadges.length / totalBadges) * 100);

  // Grouper les badges par catégorie
  const badgesByCategory = {
    xp: allBadges.filter(badge => badge.category === 'xp'),
    workouts: allBadges.filter(badge => badge.category === 'workouts'),
    streak: allBadges.filter(badge => badge.category === 'streak'),
    special: allBadges.filter(badge => badge.category === 'special')
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏆</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Système de Badges
            </h3>
            <p className="text-sm text-gray-600">
              {unlockedBadges.length} / {totalBadges} badges débloqués ({completionRate}%)
            </p>
          </div>
        </div>
        <Link 
          href="/badges" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Voir tous →
        </Link>
      </div>

      {/* Progression générale */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progression globale</span>
          <span className="font-medium text-gray-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Badges récents débloqués */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Badges Récemment Débloqués</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {unlockedBadges.slice(-6).map((badge) => (
            <div
              key={badge.id}
              className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg text-center hover:shadow-md transition-all duration-200"
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium text-gray-900 truncate">{badge.name}</div>
              <div className={`text-xs px-1 py-0.5 rounded-full mt-1 ${getRarityColor(badge.rarity)}`}>
                {getRarityText(badge.rarity)}
              </div>
            </div>
          ))}
        </div>
        {unlockedBadges.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm">Aucun badge débloqué pour le moment</p>
            <p className="text-xs">Continue à t'entraîner pour débloquer tes premiers badges !</p>
          </div>
        )}
      </div>

      {/* Prochaines étapes */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Prochaines Étapes</h4>
        <div className="space-y-2">
          {allBadges
            .filter(badge => !badge.unlocked)
            .slice(0, 3)
            .map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="text-xl opacity-50">{badge.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-600">{badge.description}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${getRarityColor(badge.rarity)}`}>
                  {getRarityText(badge.rarity)}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Statistiques par catégorie */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {badgesByCategory.xp.filter(b => b.unlocked).length}
          </div>
          <div className="text-xs text-blue-600">Badges XP</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {badgesByCategory.streak.filter(b => b.unlocked).length}
          </div>
          <div className="text-xs text-green-600">Badges Streak</div>
        </div>
      </div>
    </div>
  );
} 