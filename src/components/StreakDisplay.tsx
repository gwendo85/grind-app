"use client";

import { formatStreak, getStreakMessage } from "@/lib/streakCalculator";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: Date | null;
}

export default function StreakDisplay({ currentStreak, longestStreak, lastWorkoutDate }: StreakDisplayProps) {
  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "💤";
    if (streak <= 3) return "🔥";
    if (streak <= 7) return "⚡";
    if (streak <= 14) return "🚀";
    if (streak <= 30) return "🤖";
    return "👑";
  };

  const isNewRecord = currentStreak > 0 && currentStreak >= longestStreak;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">🔥</div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Streak Actuel
          </h3>
          <p className="text-sm text-gray-600">
            Séries consécutives d&apos;entraînement
          </p>
        </div>
      </div>

      {/* Streak actuel */}
      <div className="mb-6">
        <div className={`p-4 rounded-lg border-2 ${
          isNewRecord 
            ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50' 
            : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentStreak}
                </div>
                <div className="text-sm text-gray-600">
                  {formatStreak(currentStreak)}
                </div>
              </div>
            </div>
            {isNewRecord && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full animate-pulse">
                🎉 Nouveau record !
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-700">
            {getStreakMessage(currentStreak, longestStreak)}
          </p>
        </div>
      </div>

      {/* Record personnel */}
      <div className="mb-4">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div>
              <div className="text-sm font-medium text-gray-900">Record personnel</div>
              <div className="text-lg font-bold text-blue-600">
                {longestStreak} jours
              </div>
            </div>
          </div>
          <div className="text-xs text-blue-600">
            {longestStreak > 0 ? `${Math.round((currentStreak / longestStreak) * 100)}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Dernière séance */}
      {lastWorkoutDate && (
        <div className="mb-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <div>
                <div className="text-sm font-medium text-gray-900">Dernière séance</div>
                <div className="text-sm text-green-600">
                  {lastWorkoutDate.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>
            </div>
            <div className="text-xs text-green-600">
              {Math.floor((new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))}j
            </div>
          </div>
        </div>
      )}

      {/* Conseils pour maintenir le streak */}
      <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Conseils pour maintenir ton streak</h4>
        <ul className="text-xs text-gray-700 space-y-1">
          {currentStreak === 0 ? (
            <>
              <li>• Commence par une séance simple aujourd&apos;hui</li>
              <li>• Fixe-toi un objectif réaliste pour demain</li>
              <li>• Prépare tes vêtements de sport la veille</li>
            </>
          ) : currentStreak <= 3 ? (
            <>
              <li>• Continue avec une séance demain</li>
              <li>• Même 10 minutes comptent pour le streak</li>
              <li>• Crée une routine matinale</li>
            </>
          ) : currentStreak <= 7 ? (
            <>
              <li>• Tu es en train de créer une habitude !</li>
              <li>• Varie tes exercices pour rester motivé</li>
              <li>• Planifie tes séances à l&apos;avance</li>
            </>
          ) : (
            <>
              <li>• Tu es devenu un expert de la discipline !</li>
              <li>• Inspire d&apos;autres avec ta persévérance</li>
              <li>• Continue à repousser tes limites</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
} 