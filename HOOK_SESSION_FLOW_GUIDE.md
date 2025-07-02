# 🎯 Guide du Hook useSessionFlow

## 📋 Vue d'ensemble

Le hook `useSessionFlow` est un hook personnalisé React qui centralise toute la logique de gestion d'une séance d'entraînement. Il remplace la logique complexe qui était dispersée dans le composant `SessionFlow.tsx`.

## ✨ Avantages du hook

### 🎯 **Centralisation**
- Toute la logique de séance est dans un seul endroit
- Plus facile à maintenir et à déboguer
- Réutilisable dans d'autres composants

### 🔧 **Réutilisabilité**
- Peut être utilisé dans différents composants
- Facile à tester de manière isolée
- Interface claire et documentée

### 🚀 **Performance**
- Optimisations intégrées (useEffect, useRef)
- Gestion propre des intervalles
- Nettoyage automatique des ressources

### 🛡️ **Sécurité**
- Validation des données
- Gestion d'erreurs centralisée
- États cohérents

## 🏗️ Architecture

### Structure du hook
```typescript
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
```

### Valeurs retournées
```typescript
return {
  // États
  ...state,
  
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
  showQuitModal,
  hideQuitModal,
  handleQuitAction,
  
  // Contrôles audio
  setAudioEnabled,
  setVoiceEnabled,
};
```

## 🎮 Utilisation

### Import et utilisation basique
```typescript
import { useSessionFlow } from "@/hooks/useSessionFlow";

function MonComposant() {
  const {
    // États
    exerciseIdx,
    setIdx,
    inRest,
    restLeft,
    paused,
    finished,
    
    // Actions
    nextSet,
    pause,
    resume,
    
    // Données calculées
    progress,
    currentExercise,
  } = useSessionFlow(workout, savedExerciseIndex, savedSetIndex);

  // Utilisation dans le JSX
  return (
    <div>
      <p>Progression: {progress}%</p>
      <button onClick={nextSet}>Série terminée</button>
    </div>
  );
}
```

### Exemple complet avec SessionFlow
```typescript
export default function SessionFlow({ workout, savedExerciseIndex = 0, savedSetIndex = 0 }) {
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
    pause,
    resume,
    skipRest,
    showQuitModal: showModal,
    hideQuitModal: hideModal,
    handleQuitAction,
    
    // Contrôles audio
    setAudioEnabled,
    setVoiceEnabled,
  } = useSessionFlow(workout, savedExerciseIndex, savedSetIndex);

  // Le reste du JSX utilise ces valeurs
}
```

## 🔧 Fonctionnalités

### ⏱️ **Timer automatique**
- Incrémente automatiquement pendant la séance
- Reprend la valeur sauvegardée si reprise
- Gestion propre des intervalles

### 🏋️ **Progression des exercices**
- Navigation automatique entre exercices
- Gestion des séries et repos
- Calcul de progression en temps réel

### 🔊 **Feedback audio/vocal**
- Sons de validation (ding, beep)
- Synthèse vocale pour les encouragements
- Contrôles ON/OFF

### 💾 **Sauvegarde automatique**
- Sauvegarde de la progression
- Gestion des erreurs
- Modal de confirmation pour quitter

### 🎨 **Calculs dynamiques**
- Progression en pourcentage
- Couleurs dynamiques de la barre
- Prochain exercice affiché

## 🧪 Tests

### Test du hook isolé
```typescript
import { renderHook, act } from '@testing-library/react';
import { useSessionFlow } from '@/hooks/useSessionFlow';

test('useSessionFlow initialise correctement', () => {
  const workout = {
    id: '1',
    name: 'Test Workout',
    exercises: [
      { name: 'Squats', sets: 3, reps: 10, weight: 50 }
    ],
    status: 'planned'
  };

  const { result } = renderHook(() => useSessionFlow(workout));

  expect(result.current.exerciseIdx).toBe(0);
  expect(result.current.setIdx).toBe(0);
  expect(result.current.finished).toBe(false);
});
```

### Test des actions
```typescript
test('nextSet passe à la série suivante', async () => {
  const { result } = renderHook(() => useSessionFlow(workout));

  await act(async () => {
    await result.current.nextSet();
  });

  expect(result.current.setIdx).toBe(1);
  expect(result.current.inRest).toBe(true);
});
```

## 🔄 Migration depuis l'ancien code

### Avant (SessionFlow.tsx)
```typescript
// 200+ lignes de logique complexe
const [exerciseIdx, setExerciseIdx] = useState(0);
const [setIdx, setSetIdx] = useState(0);
const [inRest, setInRest] = useState(false);
// ... beaucoup d'autres états

const handleNextSet = async () => {
  // 20+ lignes de logique
};

const handleNextExercise = () => {
  // 15+ lignes de logique
};
```

### Après (avec le hook)
```typescript
// 20 lignes d'import et utilisation
const {
  exerciseIdx,
  setIdx,
  inRest,
  nextSet,
  goToNextExercise,
  // ... tout le reste
} = useSessionFlow(workout);
```

## 🚀 Avantages de la migration

### 📊 **Réduction du code**
- **Avant** : ~400 lignes dans SessionFlow.tsx
- **Après** : ~150 lignes dans SessionFlow.tsx + ~300 lignes dans le hook
- **Gain** : Code plus lisible et maintenable

### 🔧 **Maintenance**
- Bug fix dans le hook = corrigé partout
- Nouvelle fonctionnalité = ajoutée une seule fois
- Tests isolés du hook

### 🎯 **Réutilisabilité**
- Peut être utilisé dans d'autres composants
- Interface claire et documentée
- Facile à étendre

## 📝 Exemples d'utilisation avancée

### Hook personnalisé pour statistiques
```typescript
function useSessionStats(sessionFlow) {
  const { progress, timerValue, completedExercises } = sessionFlow;
  
  return {
    timePerExercise: timerValue / completedExercises,
    estimatedTimeLeft: (timerValue / progress) * (100 - progress),
    efficiency: progress / (timerValue / 60), // % par minute
  };
}
```

### Hook pour notifications
```typescript
function useSessionNotifications(sessionFlow) {
  const { progress, inRest, restLeft } = sessionFlow;
  
  useEffect(() => {
    if (progress === 100) {
      // Notification de fin de séance
    }
  }, [progress]);
  
  useEffect(() => {
    if (inRest && restLeft <= 10) {
      // Notification de fin de repos
    }
  }, [inRest, restLeft]);
}
```

## 🎯 Prochaines étapes

### Améliorations possibles
1. **Persistance locale** : Sauvegarde dans localStorage
2. **Mode offline** : Fonctionnement sans connexion
3. **Analytics** : Tracking des performances
4. **Personnalisation** : Thèmes, sons personnalisés
5. **Multi-utilisateur** : Séances partagées

### Intégrations
1. **Notifications push** : Rappels de séances
2. **Wearables** : Synchronisation avec montres
3. **IA** : Suggestions d'exercices
4. **Social** : Partage de performances

---

## 📞 Support

Pour toute question sur l'utilisation du hook :
1. Consulter la documentation JSDoc dans le code
2. Voir les exemples d'utilisation
3. Tester avec les tests fournis
4. Contacter l'équipe de développement

---

*Documentation mise à jour le : $(date)* 