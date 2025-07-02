"use client";
import { useSessionFlow } from "@/hooks/useSessionFlow";
import { useUserStats } from "@/hooks/useUserStats";
import { useState, useEffect } from "react";

interface SessionFlowProps {
  workout: any;
  savedExerciseIndex?: number;
  savedSetIndex?: number;
}

// Composant BadgeSystem compact pour SessionFlow
function SessionBadgeSystem({ userId }: { userId: string }) {
  const { totalXP, currentStreak, longestStreak, totalWorkouts, loading } = useUserStats(userId);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);

  // Calculer les badges débloqués récemment
  useEffect(() => {
    const allBadges = [
      // Badges XP
      { id: 'first-100', name: 'Premier Pas', requirement: 100, unlocked: totalXP >= 100 },
      { id: 'xp-500', name: 'Motivé', requirement: 500, unlocked: totalXP >= 500 },
      { id: 'xp-1000', name: 'Déterminé', requirement: 1000, unlocked: totalXP >= 1000 },
      // Badges Workouts
      { id: 'first-workout', name: 'Débutant', requirement: 1, unlocked: totalWorkouts >= 1 },
      { id: 'workouts-10', name: 'Régulier', requirement: 10, unlocked: totalWorkouts >= 10 },
      { id: 'workouts-25', name: 'Consistant', requirement: 25, unlocked: totalWorkouts >= 25 },
      // Badges Streak
      { id: 'streak-3', name: 'En Forme', requirement: 3, unlocked: currentStreak >= 3 },
      { id: 'streak-7', name: 'Semaine Parfaite', requirement: 7, unlocked: currentStreak >= 7 },
    ];

    const newlyUnlocked = allBadges
      .filter(badge => badge.unlocked && !recentlyUnlocked.includes(badge.id))
      .map(badge => badge.id);

    if (newlyUnlocked.length > 0) {
      setRecentlyUnlocked(prev => [...prev, ...newlyUnlocked]);
      
      // Nettoyer après 5 secondes
      setTimeout(() => {
        setRecentlyUnlocked(prev => prev.filter(id => !newlyUnlocked.includes(id)));
      }, 5000);
    }
  }, [totalXP, totalWorkouts, currentStreak, loading, recentlyUnlocked]);

  if (loading) return null;

  return (
    <div className="mb-4">
      {/* Badges récemment débloqués */}
      {recentlyUnlocked.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3 animate-bounce-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏆</span>
            <span className="font-semibold text-green-800">Nouveau badge débloqué !</span>
          </div>
          <div className="text-sm text-green-700">
            Continue comme ça, tu progresses bien !
          </div>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">{totalXP}</div>
          <div className="text-xs text-blue-600">XP Total</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <div className="text-lg font-bold text-orange-600">{totalWorkouts}</div>
          <div className="text-xs text-orange-600">Séances</div>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <div className="text-lg font-bold text-red-600">{currentStreak}</div>
          <div className="text-xs text-red-600">Streak</div>
        </div>
      </div>
    </div>
  );
}

export default function SessionFlow({ workout, savedExerciseIndex = 0, savedSetIndex = 0 }: SessionFlowProps) {
  const {
    // États
    exerciseIdx,
    setIdx,
    inRest,
    restLeft,
    paused,
    finished,
    audioEnabled,
    voiceEnabled,
    encouragement,
    showQuitModal,
    loadingQuit,
    quitError,
    timerValue,
    
    // Données calculées
    currentExercise,
    totalSets,
    restDuration,
    progress,
    progressColor,
    completedExercises,
    totalExercises,
    nextExercise,
    
    // Actions
    nextSet,
    goToNextExercise,
    pause,
    resume,
    skipRest,
    openQuitModal,
    hideQuitModal: hideModal,
    handleQuitAction,
    
    // Contrôles audio
    setAudioEnabled,
    setVoiceEnabled,
  } = useSessionFlow(workout, savedExerciseIndex, savedSetIndex);

  // Récupérer l'utilisateur connecté
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const user = (window as any).__supabaseUser;
    if (user && user.id) {
      setUserId(user.id);
    }
  }, []);

  if (finished) {
    return (
      <div className="text-center p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">🎉 Séance terminée !</h2>
        <p className="mb-4">Bravo, tu as complété ta séance <span className="font-semibold">{workout.name}</span> !</p>
        
        {/* BadgeSystem pour la fin de séance */}
        {userId ? (
          <div className="mb-6">
            <SessionBadgeSystem userId={userId} />
          </div>
        ) : null}
        
        <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/dashboard'}>
          Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 rounded-lg shadow-lg p-6 animate-slide-in-up">
      {/* Modal de confirmation Quitter */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold mb-2 text-red-600 flex items-center gap-2">⚠️ Quitter la séance ?</h3>
            <p className="mb-4 text-gray-700">Tu es sur le point de quitter ta séance.<br/>Souhaites-tu sauvegarder ton avancée pour reprendre plus tard ?</p>
            {quitError && <div className="text-red-500 text-sm mb-2">{quitError}</div>}
            <div className="flex flex-col gap-2">
              <button className="btn btn-outline border-red-400 text-red-600" disabled={loadingQuit} onClick={() => handleQuitAction('delete')}>❌ Quitter sans sauvegarder</button>
              <button className="btn btn-primary" disabled={loadingQuit} onClick={() => handleQuitAction('save')}>💾 Sauvegarder et quitter</button>
              <button className="btn btn-secondary" disabled={loadingQuit} onClick={hideModal}>⬅️ Revenir à la séance</button>
            </div>
            {loadingQuit && <div className="mt-2 text-center text-xs text-gray-500">Traitement...</div>}
          </div>
        </div>
      )}
      
      {/* BadgeSystem compact pour la séance en cours */}
      {userId ? (
        <SessionBadgeSystem userId={userId} />
      ) : null}
      
      {/* Barre de progression améliorée */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tracking-wide drop-shadow-sm">{workout.name}</h2>
          <span className="text-lg font-bold tracking-wider drop-shadow-sm" style={{ minWidth: 110 }}>
            Exercices complétés : {completedExercises}/{totalExercises} <span className="text-gray-500">({progress}%)</span>
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded shadow-inner">
          <div
            className={`h-3 bg-gradient-to-r ${progressColor} rounded transition-all duration-500 shadow-md`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">Exercice {exerciseIdx + 1} / {workout.exercises.length} : <span className="text-blue-700">{currentExercise?.name}</span></h3>
        <p className="text-sm text-gray-700 mb-2">Série {setIdx + 1} / {totalSets} — {currentExercise?.reps} reps à {currentExercise?.weight} kg</p>
        {currentExercise?.notes && <p className="text-xs italic text-gray-500 mb-2">{currentExercise.notes}</p>}
      </div>
      
      {inRest ? (
        <div className="flex flex-col items-center mb-4">
          <span className="text-4xl font-mono mb-2 drop-shadow-lg animate-pulse">⏱️ {restLeft}s</span>
          <p className="text-xs text-gray-500 mb-1">Repos pour cet exercice : <b>{restDuration}s</b></p>
          <div className="flex gap-2 mb-2">
            {paused ? (
              <button className="btn btn-secondary" onClick={resume}>Reprendre</button>
            ) : (
              <button className="btn btn-secondary" onClick={pause}>Pause</button>
            )}
            <button className="btn btn-outline text-blue-700 border-blue-300 hover:bg-blue-50" onClick={skipRest} tabIndex={0} aria-label="Passer la pause">
              Passer la pause
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 animate-fade-in">Récupère, tu repars bientôt !</p>
          {/* Affichage du prochain exercice */}
          {nextExercise && (
            <div className="mt-4 p-2 bg-blue-50 rounded shadow-sm text-blue-900 text-sm animate-fade-in">
              <span className="font-semibold">Prochain exercice :</span> {nextExercise.name} ({nextExercise.sets}x{nextExercise.reps} à {nextExercise.weight}kg)
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center mb-4">
          <button className="btn btn-primary text-lg px-8 py-2" onClick={nextSet} disabled={paused}>
            {setIdx < totalSets - 1 ? 'Série terminée' : (exerciseIdx < workout.exercises.length - 1 ? 'Exercice suivant' : 'Terminer la séance')}
          </button>
          <p className="text-sm text-green-700 mt-2 animate-fade-in">{encouragement}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-6">
        <button className="btn btn-outline" onClick={() => setAudioEnabled(!audioEnabled)}>
          {audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
        </button>
        <button className="btn btn-outline" onClick={() => setVoiceEnabled(!voiceEnabled)}>
          {voiceEnabled ? '🗣️ Voix ON' : '🔕 Voix OFF'}
        </button>
        <button className="btn btn-outline text-red-600" onClick={openQuitModal}>
          Quitter
        </button>
      </div>
    </div>
  );
} 