"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Exercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  rest?: number; // durée de repos personnalisée (en secondes)
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  date: string;
  status: string;
  duration_seconds?: number;
  current_exercise_index?: number;
  current_set_index?: number;
}

interface SessionFlowProps {
  workout: Workout;
  savedExerciseIndex?: number;
  savedSetIndex?: number;
}

const ENCOURAGEMENTS = [
  "Allez, tu gères !",
  "Encore une série !",
  "Force et honneur !",
  "Tu vas y arriver !",
  "Plus qu'un effort !",
  "On ne lâche rien !"
];

type ExerciseProgress = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  completedSets: number;
  lastRestSeconds?: number;
  notes?: string;
};

export default function SessionFlow({ workout, savedExerciseIndex = 0, savedSetIndex = 0 }: SessionFlowProps) {
  // Timer (reprend la valeur sauvegardée ou 0)
  const [timerValue, setTimerValue] = useState<number>(workout.duration_seconds || 0);
  // Suivi fin des exercices (reprend la valeur sauvegardée ou structure initiale)
  const [exercises, setExercises] = useState<ExerciseProgress[]>(
    workout.exercises?.map((ex: any) => ({
      ...ex,
      completedSets: ex.completedSets || 0,
      lastRestSeconds: ex.lastRestSeconds || ex.rest,
    })) || []
  );
  const [exerciseIdx, setExerciseIdx] = useState<number>(workout.current_exercise_index || savedExerciseIndex || 0);
  const [setIdx, setSetIdx] = useState<number>(workout.current_set_index || savedSetIndex || 0);
  const [inRest, setInRest] = useState(false);
  const [restTime, setRestTime] = useState(60); // secondes
  const [restLeft, setRestLeft] = useState(restTime);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [encouragement, setEncouragement] = useState(ENCOURAGEMENTS[0]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [loadingQuit, setLoadingQuit] = useState(false);
  const [quitError, setQuitError] = useState<string | null>(null);

  // Timer auto-incrémenté si la séance est active
  const [isSessionActive, setIsSessionActive] = useState(true);
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSessionActive) {
      interval = setInterval(() => {
        setTimerValue((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  const exercise = workout.exercises[exerciseIdx];
  const totalSets = exercise?.sets || 1;
  const restDuration = exercise?.rest ?? 60;

  // Feedback audio (bip)
  const playBeep = () => {
    if (!audioEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 880;
    o.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 180);
  };

  // Son "ding" validation série
  const playDing = () => {
    if (!audioEnabled) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = 1318;
    o.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 120);
  };

  // Chrono gestion
  useEffect(() => {
    if (inRest && !paused) {
      intervalRef.current = setInterval(() => {
        setRestLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setInRest(false);
            setRestLeft(restDuration);
            playBeep();
            setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
            return restDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [inRest, paused, restDuration]);

  // Logguer la série dans Supabase
  const logSet = async () => {
    // @ts-ignore
    const user = window.__supabaseUser || null;
    if (!user) return;
    await fetch('/api/log-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        workout_id: workout.id,
        exercise_name: exercise.name,
        set_number: setIdx + 1,
        timestamp: new Date().toISOString(),
        success: true
      })
    });
  };

  // Feedback vocal (Web Speech API)
  const speak = (text: string) => {
    if (!voiceEnabled) return;
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      window.speechSynthesis.speak(utter);
    }
  };

  // Passer à la série suivante
  const handleNextSet = async () => {
    playDing();
    await logSet();
    speak(encouragement);
    if (setIdx < totalSets - 1) {
      setSetIdx(setIdx + 1);
      setInRest(true);
      setRestLeft(restDuration);
    } else {
      speak('Exercice terminé !');
      handleNextExercise();
    }
  };

  // Passer à l'exercice suivant
  const handleNextExercise = () => {
    if (exerciseIdx < workout.exercises.length - 1) {
      setExerciseIdx(exerciseIdx + 1);
      setSetIdx(0);
      setInRest(false);
      setRestLeft(restDuration);
      setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
    } else {
      setFinished(true);
      playBeep();
    }
  };

  // Pause/reprise
  const handlePause = () => setPaused(true);
  const handleResume = () => setPaused(false);

  // Progression
  const totalSteps = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const currentStep = workout.exercises.slice(0, exerciseIdx).reduce((acc, ex) => acc + ex.sets, 0) + setIdx + 1;
  const progress = Math.round((currentStep / totalSteps) * 100);
  const completedExercises = exerciseIdx + (setIdx + 1 > totalSets ? 1 : 0);
  const totalExercises = workout.exercises.length;

  // Couleur dynamique pour la barre
  let progressColor = "from-red-500 to-orange-400";
  if (progress >= 67) progressColor = "from-green-500 to-blue-500";
  else if (progress >= 34) progressColor = "from-orange-400 to-yellow-400";

  // Prochain exercice
  const nextExercise = workout.exercises[exerciseIdx + 1];

  // Passer la pause
  const handleSkipRest = () => {
    setInRest(false);
    setRestLeft(restDuration);
  };

  // Gestion du clic sur Quitter
  const handleQuitClick = () => {
    setPaused(true); // Pause immédiate
    setShowQuitModal(true);
  };

  // Handler pour marquer une série comme complétée
  const handleSetCompleted = (exerciseIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx === exerciseIdx
          ? { ...ex, completedSets: (ex.completedSets || 0) + 1 }
          : ex
      )
    );
  };

  // Handler pour sauvegarder ou annuler la séance (modal Quitter)
  const handleQuitAction = async (action: 'save' | 'delete') => {
    setLoadingQuit(true);
    setQuitError(null);
    try {
      if (action === 'save') {
        const { error } = await supabase
          .from('workouts')
          .update({
            status: 'in_progress',
            current_exercise_index: exerciseIdx,
            current_set_index: setIdx,
            duration_seconds: timerValue,
            exercises: exercises
          })
          .eq('id', workout.id);
        if (error) setQuitError(error.message);
        else {
          // Feedback utilisateur, redirection, etc.
          window.location.href = '/dashboard';
        }
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('workouts')
          .update({ status: 'cancelled' })
          .eq('id', workout.id);
        if (error) setQuitError(error.message);
        else {
          // Feedback utilisateur, redirection, etc.
          window.location.href = '/dashboard';
        }
      }
    } catch (e: any) {
      setQuitError(e.message);
    } finally {
      setLoadingQuit(false);
    }
  };

  if (finished) {
    return (
      <div className="text-center p-6 animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">🎉 Séance terminée !</h2>
        <p className="mb-4">Bravo, tu as complété ta séance <span className="font-semibold">{workout.name}</span> !</p>
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
              <button className="btn btn-secondary" disabled={loadingQuit} onClick={() => { setShowQuitModal(false); setPaused(false); }}>⬅️ Revenir à la séance</button>
            </div>
            {loadingQuit && <div className="mt-2 text-center text-xs text-gray-500">Traitement...</div>}
          </div>
        </div>
      )}
      {/* Barre de progression améliorée */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tracking-wide drop-shadow-sm">{workout.name}</h2>
          <span className="text-lg font-bold tracking-wider drop-shadow-sm" style={{ minWidth: 110 }}>
            Exercices complétés : {exerciseIdx}/{totalExercises} <span className="text-gray-500">({progress}%)</span>
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
        <h3 className="text-lg font-semibold mb-1">Exercice {exerciseIdx + 1} / {workout.exercises.length} : <span className="text-blue-700">{exercise.name}</span></h3>
        <p className="text-sm text-gray-700 mb-2">Série {setIdx + 1} / {totalSets} — {exercise.reps} reps à {exercise.weight} kg</p>
        {exercise.notes && <p className="text-xs italic text-gray-500 mb-2">{exercise.notes}</p>}
      </div>
      {inRest ? (
        <div className="flex flex-col items-center mb-4">
          <span className="text-4xl font-mono mb-2 drop-shadow-lg animate-pulse">⏱️ {restLeft}s</span>
          <p className="text-xs text-gray-500 mb-1">Repos pour cet exercice : <b>{restDuration}s</b></p>
          <div className="flex gap-2 mb-2">
            {paused ? (
              <button className="btn btn-secondary" onClick={handleResume}>Reprendre</button>
            ) : (
              <button className="btn btn-secondary" onClick={handlePause}>Pause</button>
            )}
            {/* Bouton Passer la pause */}
            <button className="btn btn-outline text-blue-700 border-blue-300 hover:bg-blue-50" onClick={handleSkipRest} tabIndex={0} aria-label="Passer la pause">
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
          <button className="btn btn-primary text-lg px-8 py-2" onClick={handleNextSet} disabled={paused}>
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
        <button className="btn btn-outline text-red-600" onClick={handleQuitClick}>
          Quitter
        </button>
      </div>
    </div>
  );
} 