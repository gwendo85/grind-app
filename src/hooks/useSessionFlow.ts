import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Exercise {
  name: string;
  weight: number;
  reps: number;
  sets: number;
  rest?: number;
  notes?: string;
}

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  status: string;
  current_exercise_index?: number;
  current_set_index?: number;
  duration_seconds?: number;
}

interface SessionFlowState {
  // États de progression
  exerciseIdx: number;
  setIdx: number;
  exercises: ExerciseProgress[];
  
  // États de repos
  inRest: boolean;
  restTime: number;
  restLeft: number;
  
  // États de contrôle
  paused: boolean;
  finished: boolean;
  isSessionActive: boolean;
  
  // États audio/feedback
  audioEnabled: boolean;
  voiceEnabled: boolean;
  encouragement: string;
  
  // États de sauvegarde
  showQuitModal: boolean;
  loadingQuit: boolean;
  quitError: string | null;
  
  // Timer
  timerValue: number;
}

interface ExerciseProgress {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  completedSets: number;
  lastRestSeconds?: number;
  notes?: string;
}

const ENCOURAGEMENTS = [
  "Allez, tu gères !",
  "Encore une série !",
  "Force et honneur !",
  "Tu vas y arriver !",
  "Plus qu'un effort !",
  "On ne lâche rien !"
];

/**
 * Hook personnalisé pour gérer le déroulement d'une séance d'entraînement
 * 
 * Ce hook centralise toute la logique de gestion d'une séance :
 * - Progression des exercices et séries
 * - Gestion des temps de repos
 * - Timer de séance
 * - Feedback audio et vocal
 * - Sauvegarde de la progression
 * - États de pause/fin
 * 
 * @param workout - L'objet workout contenant les exercices et métadonnées
 * @param savedExerciseIndex - Index de l'exercice sauvegardé (pour reprise)
 * @param savedSetIndex - Index de la série sauvegardée (pour reprise)
 * @returns Objet contenant tous les états et actions pour gérer la séance
 */
export function useSessionFlow(workout: Workout, savedExerciseIndex = 0, savedSetIndex = 0) {
  // États de base
  const [state, setState] = useState<SessionFlowState>({
    exerciseIdx: workout.current_exercise_index || savedExerciseIndex || 0,
    setIdx: workout.current_set_index || savedSetIndex || 0,
    exercises: workout.exercises?.map((ex: any) => ({
      ...ex,
      completedSets: ex.completedSets || 0,
      lastRestSeconds: ex.lastRestSeconds || ex.rest,
    })) || [],
    inRest: false,
    restTime: 60,
    restLeft: 60,
    paused: false,
    finished: false,
    isSessionActive: true,
    audioEnabled: true,
    voiceEnabled: false,
    encouragement: ENCOURAGEMENTS[0],
    showQuitModal: false,
    loadingQuit: false,
    quitError: null,
    timerValue: workout.duration_seconds || 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer auto-incrémenté
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.isSessionActive) {
      interval = setInterval(() => {
        setState(prev => ({ ...prev, timerValue: prev.timerValue + 1 }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isSessionActive]);

  // Gestion du repos
  useEffect(() => {
    if (state.inRest && !state.paused) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.restLeft <= 1) {
            clearInterval(intervalRef.current!);
            playBeep();
            return {
              ...prev,
              inRest: false,
              restLeft: getCurrentExercise()?.rest ?? 60,
              encouragement: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
            };
          }
          return { ...prev, restLeft: prev.restLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [state.inRest, state.paused]);

  // Fonctions utilitaires
  const getCurrentExercise = () => workout.exercises[state.exerciseIdx];
  const getTotalSets = () => getCurrentExercise()?.sets || 1;
  const getRestDuration = () => getCurrentExercise()?.rest ?? 60;

  // Fonctions audio
  const playBeep = () => {
    if (!state.audioEnabled) return;
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

  const playDing = () => {
    if (!state.audioEnabled) return;
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

  const speak = (text: string) => {
    if (!state.voiceEnabled) return;
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      window.speechSynthesis.speak(utter);
    }
  };

  // Logguer la série
  const logSet = async () => {
    const user = (window as any).__supabaseUser || null;
    if (!user) return;
    
    await fetch('/api/log-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        workout_id: workout.id,
        exercise_name: getCurrentExercise()?.name,
        set_number: state.setIdx + 1,
        timestamp: new Date().toISOString(),
        success: true
      })
    });
  };

  // Actions principales
  const nextSet = async () => {
    playDing();
    await logSet();
    speak(state.encouragement);
    
    if (state.setIdx < getTotalSets() - 1) {
      setState(prev => ({
        ...prev,
        setIdx: prev.setIdx + 1,
        inRest: true,
        restLeft: getRestDuration()
      }));
    } else {
      speak('Exercice terminé !');
      goToNextExercise();
    }
  };

  const goToNextExercise = () => {
    if (state.exerciseIdx < workout.exercises.length - 1) {
      setState(prev => ({
        ...prev,
        exerciseIdx: prev.exerciseIdx + 1,
        setIdx: 0,
        inRest: false,
        restLeft: getRestDuration(),
        encouragement: ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
      }));
    } else {
      setState(prev => ({ ...prev, finished: true }));
      playBeep();
    }
  };

  const pause = () => setState(prev => ({ ...prev, paused: true }));
  const resume = () => setState(prev => ({ ...prev, paused: false }));
  const skipRest = () => setState(prev => ({ 
    ...prev, 
    inRest: false, 
    restLeft: getRestDuration() 
  }));

  // Gestion de la sauvegarde
  const handleQuitAction = async (action: 'save' | 'delete') => {
    setState(prev => ({ ...prev, loadingQuit: true, quitError: null }));
    
    try {
      if (action === 'save') {
        const { error } = await supabase
          .from('workouts')
          .update({
            status: 'in_progress',
            current_exercise_index: state.exerciseIdx,
            current_set_index: state.setIdx,
            duration_seconds: state.timerValue,
            exercises: state.exercises
          })
          .eq('id', workout.id);
          
        if (error) {
          setState(prev => ({ ...prev, quitError: error.message }));
        } else {
          window.location.href = '/dashboard';
        }
      } else if (action === 'delete') {
        const { error } = await supabase
          .from('workouts')
          .update({ status: 'cancelled' })
          .eq('id', workout.id);
          
        if (error) {
          setState(prev => ({ ...prev, quitError: error.message }));
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (e: any) {
      setState(prev => ({ ...prev, quitError: e.message }));
    } finally {
      setState(prev => ({ ...prev, loadingQuit: false }));
    }
  };

  const showQuitModal = () => {
    setState(prev => ({ ...prev, paused: true, showQuitModal: true }));
  };

  const hideQuitModal = () => {
    setState(prev => ({ ...prev, showQuitModal: false, paused: false }));
  };

  // Calculs de progression
  const totalSteps = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const currentStep = workout.exercises
    .slice(0, state.exerciseIdx)
    .reduce((acc, ex) => acc + ex.sets, 0) + state.setIdx + 1;
  const progress = Math.round((currentStep / totalSteps) * 100);
  const completedExercises = state.exerciseIdx + (state.setIdx + 1 > getTotalSets() ? 1 : 0);
  const totalExercises = workout.exercises.length;

  // Couleur dynamique pour la barre de progression
  let progressColor = "from-red-500 to-orange-400";
  if (progress >= 67) progressColor = "from-green-500 to-blue-500";
  else if (progress >= 34) progressColor = "from-orange-400 to-yellow-400";

  // Prochain exercice
  const nextExerciseData = workout.exercises[state.exerciseIdx + 1];

  return {
    // États
    ...state,
    
    // Données calculées
    currentExercise: getCurrentExercise(),
    totalSets: getTotalSets(),
    restDuration: getRestDuration(),
    progress,
    progressColor,
    completedExercises,
    totalExercises,
    nextExercise: nextExerciseData,
    
    // Actions
    nextSet,
    goToNextExercise,
    pause,
    resume,
    skipRest,
    openQuitModal: showQuitModal,
    hideQuitModal,
    handleQuitAction,
    
    // Contrôles audio
    setAudioEnabled: (enabled: boolean) => setState(prev => ({ ...prev, audioEnabled: enabled })),
    setVoiceEnabled: (enabled: boolean) => setState(prev => ({ ...prev, voiceEnabled: enabled })),
  };
} 