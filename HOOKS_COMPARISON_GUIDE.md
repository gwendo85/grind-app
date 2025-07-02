# 🔄 Guide de Comparaison des Hooks de Session

## 📋 Vue d'ensemble

Nous avons maintenant **deux hooks complémentaires** pour gérer les sessions d'entraînement :

1. **`useSessionManager`** : Gestion générale des sessions (start/pause/stop)
2. **`useSessionFlow`** : Gestion détaillée du déroulement (exercices/séries)

## 🎯 Comparaison détaillée

| Aspect | `useSessionManager` | `useSessionFlow` |
|--------|-------------------|------------------|
| **Niveau** | Macro (session complète) | Micro (exercices/séries) |
| **Responsabilité** | Métadonnées de session | Progression détaillée |
| **Données gérées** | Durée, timestamps, statut | Exercices, séries, repos |
| **Complexité** | Simple (80 lignes) | Complexe (300+ lignes) |
| **Réutilisabilité** | Générique (toutes sessions) | Spécialisé (séances fitness) |
| **Base de données** | Table `sessions` | Table `workouts` |

## 🏗️ Architecture recommandée

### **Niveau 1 : SessionManager (Général)**
```typescript
// Gestion de haut niveau
const {
  status,           // 'idle' | 'started' | 'paused' | 'ended'
  duration,         // Durée en secondes
  startSession,     // Démarrer une session
  pauseSession,     // Mettre en pause
  resumeSession,    // Reprendre
  endSession        // Terminer
} = useSessionManager();
```

### **Niveau 2 : SessionFlow (Spécialisé)**
```typescript
// Gestion détaillée du fitness
const {
  exerciseIdx,      // Index de l'exercice actuel
  setIdx,           // Index de la série actuelle
  progress,         // Progression en %
  nextSet,          // Passer à la série suivante
  inRest,           // En période de repos
  restLeft          // Temps de repos restant
} = useSessionFlow(workout);
```

## 🎮 Cas d'usage

### **1. Session simple (cardio, yoga, etc.)**
```typescript
// Utiliser uniquement SessionManager
function CardioSession() {
  const { status, duration, startSession, endSession } = useSessionManager();
  
  return (
    <div>
      <p>Durée: {formatDuration(duration)}</p>
      <button onClick={startSession}>Démarrer</button>
      <button onClick={endSession}>Terminer</button>
    </div>
  );
}
```

### **2. Séance de musculation complète**
```typescript
// Utiliser les deux hooks ensemble
function WorkoutSession() {
  const sessionManager = useSessionManager();
  const sessionFlow = useSessionFlow(workout);
  
  // Synchronisation automatique
  useEffect(() => {
    if (sessionFlow.finished && sessionManager.isActive) {
      sessionManager.endSession();
    }
  }, [sessionFlow.finished]);
  
  return (
    <div>
      {/* Interface combinée */}
    </div>
  );
}
```

### **3. Dashboard avec historique**
```typescript
// Utiliser SessionManager pour les statistiques
function Dashboard() {
  const { status, duration } = useSessionManager();
  
  return (
    <div>
      <p>Session en cours: {status}</p>
      <p>Durée: {formatDuration(duration)}</p>
    </div>
  );
}
```

## 🚀 Avantages de l'architecture hybride

### ✅ **Séparation des responsabilités**
- **SessionManager** : Gestion temporelle et métadonnées
- **SessionFlow** : Logique métier fitness

### ✅ **Réutilisabilité maximale**
- SessionManager pour toutes les activités
- SessionFlow pour les séances fitness uniquement

### ✅ **Maintenance simplifiée**
- Bug dans la gestion temporelle → fix dans SessionManager
- Bug dans la progression fitness → fix dans SessionFlow

### ✅ **Tests isolés**
- Tests unitaires pour chaque hook
- Tests d'intégration pour la combinaison

## 📊 Exemples d'utilisation

### **Exemple 1 : Séance de musculation**
```typescript
function MuscleWorkout() {
  const sessionManager = useSessionManager();
  const sessionFlow = useSessionFlow(workout);
  
  return (
    <div>
      {/* Header avec infos de session */}
      <div className="session-header">
        <h2>{workout.name}</h2>
        <p>Durée: {sessionManager.formatDuration(sessionManager.duration)}</p>
        <p>Status: {sessionManager.status}</p>
      </div>
      
      {/* Interface de progression */}
      <div className="workout-progress">
        <p>Progression: {sessionFlow.progress}%</p>
        <p>Exercice: {sessionFlow.currentExercise?.name}</p>
        <button onClick={sessionFlow.nextSet}>Série terminée</button>
      </div>
    </div>
  );
}
```

### **Exemple 2 : Séance de cardio**
```typescript
function CardioSession() {
  const { status, duration, startSession, endSession, formatDuration } = useSessionManager();
  
  return (
    <div>
      <h2>Cardio</h2>
      <p>Durée: {formatDuration(duration)}</p>
      
      {status === 'idle' && (
        <button onClick={startSession}>Démarrer</button>
      )}
      
      {status === 'started' && (
        <button onClick={endSession}>Terminer</button>
      )}
    </div>
  );
}
```

### **Exemple 3 : Composant combiné**
```typescript
function SessionFlowWithManager({ workout }) {
  const sessionManager = useSessionManager();
  const sessionFlow = useSessionFlow(workout);
  
  // Synchronisation automatique
  useEffect(() => {
    if (sessionFlow.finished && sessionManager.isActive) {
      sessionManager.endSession();
    }
  }, [sessionFlow.finished, sessionManager.isActive]);
  
  return (
    <SessionFlowWithManager 
      sessionManager={sessionManager}
      sessionFlow={sessionFlow}
    />
  );
}
```

## 🔧 Migration et intégration

### **Étape 1 : Créer la table sessions**
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  status TEXT CHECK (status IN ('idle', 'started', 'paused', 'ended')),
  duration INTEGER,
  workout_id UUID REFERENCES workouts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Étape 2 : Intégrer SessionManager**
```typescript
// Dans SessionFlow.tsx
import { useSessionManager } from '@/hooks/useSessionManager';

export default function SessionFlow({ workout }) {
  const sessionManager = useSessionManager();
  const sessionFlow = useSessionFlow(workout);
  
  // Synchronisation
  useEffect(() => {
    if (sessionFlow.finished && sessionManager.isActive) {
      sessionManager.endSession();
    }
  }, [sessionFlow.finished]);
  
  // ... reste du code
}
```

### **Étape 3 : Mettre à jour les composants**
```typescript
// Remplacer les anciens composants par les nouveaux
// SessionFlow → SessionFlowWithManager
// Dashboard → avec SessionManager pour les stats
```

## 🎯 Prochaines étapes

### **Améliorations possibles**
1. **Hook useSessionStats** : Statistiques avancées
2. **Hook useSessionNotifications** : Notifications push
3. **Hook useSessionAnalytics** : Analytics et insights
4. **Hook useSessionSharing** : Partage de sessions

### **Intégrations futures**
1. **Wearables** : Synchronisation avec montres
2. **IA Coach** : Analyse automatique des sessions
3. **Social** : Partage et comparaison
4. **Gamification** : XP, badges, challenges

## 📝 Bonnes pratiques

### **1. Utiliser le bon hook selon le contexte**
- **Activité simple** → SessionManager uniquement
- **Séance fitness** → SessionManager + SessionFlow
- **Dashboard** → SessionManager pour les stats

### **2. Synchroniser les hooks**
```typescript
useEffect(() => {
  if (sessionFlow.finished && sessionManager.isActive) {
    sessionManager.endSession();
  }
}, [sessionFlow.finished, sessionManager.isActive]);
```

### **3. Gérer les erreurs**
```typescript
try {
  await sessionManager.startSession(workout.id);
} catch (error) {
  console.error('Erreur session:', error);
  // Gérer l'erreur
}
```

### **4. Tests unitaires**
```typescript
// Test SessionManager
test('startSession crée une nouvelle session', async () => {
  const { result } = renderHook(() => useSessionManager());
  await act(async () => {
    await result.current.startSession();
  });
  expect(result.current.status).toBe('started');
});

// Test SessionFlow
test('nextSet passe à la série suivante', async () => {
  const { result } = renderHook(() => useSessionFlow(workout));
  await act(async () => {
    await result.current.nextSet();
  });
  expect(result.current.setIdx).toBe(1);
});
```

---

## 🎉 Conclusion

Cette architecture hybride offre :

✅ **Flexibilité maximale** : Utilise le bon hook selon le besoin  
✅ **Maintenabilité** : Code organisé et séparé  
✅ **Réutilisabilité** : Hooks modulaires et indépendants  
✅ **Scalabilité** : Facile d'ajouter de nouveaux hooks  
✅ **Performance** : Optimisations spécifiques à chaque niveau  

Les deux hooks se complètent parfaitement pour créer une expérience utilisateur riche et une architecture robuste ! 🚀

---

*Documentation mise à jour le : $(date)* 