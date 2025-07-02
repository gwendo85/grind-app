"use client";
import { useSessionManager } from "@/hooks/useSessionManager";
import { useSessionFlow } from "@/hooks/useSessionFlow";
import { useState, useEffect } from "react";

interface SessionFlowWithManagerProps {
  workout: any;
  savedExerciseIndex?: number;
  savedSetIndex?: number;
}

export default function SessionFlowWithManager({ 
  workout, 
  savedExerciseIndex = 0, 
  savedSetIndex = 0 
}: SessionFlowWithManagerProps) {
  const [message, setMessage] = useState('');
  
  // Hook pour la gestion générale de la session
  const {
    status: sessionStatus,
    sessionId,
    duration,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    formatDuration,
    isActive,
    isPaused,
    isEnded
  } = useSessionManager();

  // Hook pour le déroulement détaillé de la séance
  const sessionFlow = useSessionFlow(workout, savedExerciseIndex, savedSetIndex);
  const {
    exerciseIdx,
    setIdx,
    inRest,
    restLeft,
    paused,
    finished,
    progress,
    currentExercise,
    totalSets,
    nextSet,
    skipRest,
    showQuitModal,
    hideQuitModal,
    handleQuitAction,
  } = sessionFlow;

  // Synchroniser les deux hooks
  useEffect(() => {
    // Si la session est en pause, mettre en pause le flow
    if (isPaused && !paused) {
      sessionFlow.pause();
    }
    // Si la session reprend, reprendre le flow
    if (isActive && paused) {
      sessionFlow.resume();
    }
  }, [isPaused, isActive, paused]);

  // Gérer le démarrage de la session
  const handleStartSession = async () => {
    try {
      await startSession(workout.id);
      setMessage('✅ Session démarrée !');
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Gérer la fin de la session
  const handleEndSession = async () => {
    try {
      await endSession();
      setMessage('✅ Session terminée !');
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Gérer la pause/reprise
  const handlePauseResume = async () => {
    try {
      if (isActive) {
        await pauseSession();
        setMessage('⏸️ Session en pause');
      } else if (isPaused) {
        await resumeSession();
        setMessage('▶️ Session reprise');
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // Si la séance est terminée, terminer aussi la session
  useEffect(() => {
    if (finished && isActive) {
      handleEndSession();
    }
  }, [finished, isActive]);

  if (finished) {
    return (
      <div className="text-center p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">🎉 Séance terminée !</h2>
        <p className="mb-4">
          Bravo, tu as complété ta séance <span className="font-semibold">{workout.name}</span> !
        </p>
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">
            <strong>Durée totale :</strong> {formatDuration(duration)}
          </p>
          <p className="text-sm text-green-700">
            <strong>Progression :</strong> {progress}%
          </p>
        </div>
        <button 
          className="btn btn-primary mt-4" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Retour au dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 rounded-lg shadow-lg p-6 animate-slide-in-up">
      {/* Header avec gestion de session */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">{workout.name}</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Durée: {formatDuration(duration)}</p>
            <p className="text-sm text-gray-600">Status: {sessionStatus}</p>
          </div>
        </div>
        
        {/* Contrôles de session */}
        <div className="flex gap-2 mb-2">
          {!sessionId ? (
            <button 
              onClick={handleStartSession}
              className="btn btn-success btn-sm"
            >
              🚀 Démarrer la session
            </button>
          ) : (
            <>
              <button 
                onClick={handlePauseResume}
                className={`btn btn-sm ${isActive ? 'btn-warning' : 'btn-success'}`}
              >
                {isActive ? '⏸️ Pause' : '▶️ Reprendre'}
              </button>
              <button 
                onClick={handleEndSession}
                className="btn btn-danger btn-sm"
              >
                🏁 Terminer
              </button>
            </>
          )}
        </div>

        {message && (
          <p className="text-sm text-center p-2 bg-blue-100 rounded">
            {message}
          </p>
        )}
      </div>

      {/* Modal de confirmation Quitter */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold mb-2 text-red-600 flex items-center gap-2">
              ⚠️ Quitter la séance ?
            </h3>
            <p className="mb-4 text-gray-700">
              Tu es sur le point de quitter ta séance.<br/>
              Souhaites-tu sauvegarder ton avancée pour reprendre plus tard ?
            </p>
            <div className="flex flex-col gap-2">
              <button 
                className="btn btn-outline border-red-400 text-red-600" 
                onClick={() => handleQuitAction('delete')}
              >
                ❌ Quitter sans sauvegarder
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => handleQuitAction('save')}
              >
                💾 Sauvegarder et quitter
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={hideQuitModal}
              >
                ⬅️ Revenir à la séance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de progression */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold tracking-wider drop-shadow-sm">
            Progression : {progress}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded shadow-inner">
          <div
            className={`h-3 bg-gradient-to-r ${sessionFlow.progressColor} rounded transition-all duration-500 shadow-md`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Informations de l'exercice */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">
          Exercice {exerciseIdx + 1} / {workout.exercises.length} : 
          <span className="text-blue-700"> {currentExercise?.name}</span>
        </h3>
        <p className="text-sm text-gray-700 mb-2">
          Série {setIdx + 1} / {totalSets} — {currentExercise?.reps} reps à {currentExercise?.weight} kg
        </p>
        {currentExercise?.notes && (
          <p className="text-xs italic text-gray-500 mb-2">{currentExercise.notes}</p>
        )}
      </div>

      {/* Interface de repos ou d'exercice */}
      {inRest ? (
        <div className="flex flex-col items-center mb-4">
          <span className="text-4xl font-mono mb-2 drop-shadow-lg animate-pulse">
            ⏱️ {restLeft}s
          </span>
          <p className="text-xs text-gray-500 mb-1">
            Repos pour cet exercice : <b>{sessionFlow.restDuration}s</b>
          </p>
          <div className="flex gap-2 mb-2">
            <button 
              className="btn btn-outline text-blue-700 border-blue-300 hover:bg-blue-50" 
              onClick={skipRest}
            >
              Passer la pause
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 animate-fade-in">
            Récupère, tu repars bientôt !
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center mb-4">
          <button 
            className="btn btn-primary text-lg px-8 py-2" 
            onClick={nextSet} 
            disabled={paused || !isActive}
          >
            {setIdx < totalSets - 1 ? 'Série terminée' : 
             (exerciseIdx < workout.exercises.length - 1 ? 'Exercice suivant' : 'Terminer la séance')}
          </button>
          <p className="text-sm text-green-700 mt-2 animate-fade-in">
            {sessionFlow.encouragement}
          </p>
        </div>
      )}

      {/* Contrôles audio et quitter */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => sessionFlow.setAudioEnabled(!sessionFlow.audioEnabled)}
          >
            {sessionFlow.audioEnabled ? '🔊 Audio ON' : '🔇 Audio OFF'}
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => sessionFlow.setVoiceEnabled(!sessionFlow.voiceEnabled)}
          >
            {sessionFlow.voiceEnabled ? '🗣️ Voix ON' : '🔕 Voix OFF'}
          </button>
        </div>
        <button 
          className="btn btn-outline text-red-600" 
          onClick={sessionFlow.openQuitModal}
        >
          Quitter
        </button>
      </div>
    </div>
  );
} 