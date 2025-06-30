# 🔄 Guide de la Fonctionnalité de Reprise de Séance

## 📋 Vue d'ensemble

La fonctionnalité de reprise de séance permet aux utilisateurs de reprendre une séance d'entraînement interrompue exactement là où ils se sont arrêtés. Cette fonctionnalité améliore considérablement l'expérience utilisateur en évitant de perdre la progression lors d'interruptions.

## ✨ Fonctionnalités principales

### 1. **Sauvegarde automatique de la progression**
- Lorsqu'un utilisateur clique sur "Quitter" pendant une séance, un modal s'affiche avec 3 options :
  - ❌ Quitter sans sauvegarder
  - 💾 Sauvegarder et quitter
  - ⬅️ Revenir à la séance

### 2. **Affichage dans le dashboard**
- Les séances interrompues apparaissent dans une section dédiée "🔄 Séances À Reprendre"
- Chaque séance affiche :
  - Le nom de la séance
  - La date
  - Le pourcentage de progression
  - L'exercice et la série actuels
  - Une barre de progression visuelle
  - Un bouton "🔄 Reprendre"

### 3. **Message d'accueil motivant**
- Quand il y a des séances à reprendre, un message d'accueil s'affiche dans le header du dashboard
- Le message encourage l'utilisateur à reprendre ses séances

### 4. **Reprise précise**
- La séance reprend exactement à l'exercice et à la série sauvegardés
- Tous les états sont restaurés (timer, progression, etc.)

## 🏗️ Architecture technique

### Base de données

#### Table `workouts` - Nouveaux champs
```sql
ALTER TABLE workouts ADD COLUMN exercise_index INTEGER DEFAULT 0;
ALTER TABLE workouts ADD COLUMN set_index INTEGER DEFAULT 0;
```

#### Fonction PostgreSQL `save_workout_progression`
```sql
CREATE OR REPLACE FUNCTION save_workout_progression(
  workout_uuid UUID,
  exercise_idx INTEGER,
  set_idx INTEGER,
  save_progress BOOLEAN
) RETURNS VOID AS $$
BEGIN
  IF save_progress THEN
    -- Sauvegarder la progression
    UPDATE workouts 
    SET 
      status = 'in_progress',
      exercise_index = exercise_idx,
      set_index = set_idx,
      updated_at = NOW()
    WHERE id = workout_uuid;
  ELSE
    -- Supprimer la progression
    UPDATE workouts 
    SET 
      status = 'planned',
      exercise_index = 0,
      set_index = 0,
      updated_at = NOW()
    WHERE id = workout_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### API Next.js

#### Route `/api/save-progression`
```typescript
// POST /api/save-progression
{
  workout_id: string,
  exercise_index: number,
  set_index: number,
  save_progress: boolean
}
```

### Composants React

#### `SessionFlow.tsx` - Modifications
- Ajout des props `savedExerciseIndex` et `savedSetIndex`
- Initialisation des états avec les valeurs sauvegardées
- Modal de confirmation pour quitter

#### `Dashboard` - Modifications
- Récupération des séances `in_progress`
- Affichage de la section "Séances À Reprendre"
- Calcul et affichage de la progression
- Message d'accueil motivant

## 🎯 Calcul de la progression

La progression est calculée comme suit :

```javascript
const totalExercises = workout.exercises.length;
const currentExercise = workout.exercise_index;
const currentSet = workout.set_index;
const totalSets = workout.exercises[currentExercise].sets;

const progress = Math.round(
  ((currentExercise * totalSets + currentSet) / (totalExercises * totalSets)) * 100
);
```

**Exemple :**
- Séance avec 3 exercices : [3 séries, 4 séries, 3 séries]
- Interrompue à l'exercice 2, série 3
- Progression = ((1 × 4 + 2) / (3 × 4)) × 100 = 50%

## 🎨 Interface utilisateur

### Section "Séances À Reprendre"
- **Couleur :** Orange/rouge (dégradé)
- **Icône :** 🔄
- **Tag :** "À reprendre"
- **Bouton :** "🔄 Reprendre" (animation pulse)
- **Barre de progression :** Dégradé orange-rouge

### Modal de confirmation
- **Titre :** "⚠️ Quitter la séance ?"
- **Options :**
  - ❌ Quitter sans sauvegarder
  - 💾 Sauvegarder et quitter
  - ⬅️ Revenir à la séance

### Message d'accueil
- **Couleur :** Dégradé orange-rouge
- **Animation :** Pulse
- **Contenu :** Message motivant avec le nombre de séances à reprendre

## 🔄 Flux utilisateur

### 1. **Interruption de séance**
```
Utilisateur en séance → Clic "Quitter" → Modal de confirmation
```

### 2. **Sauvegarde**
```
Modal → "Sauvegarder et quitter" → API → Base de données → Dashboard
```

### 3. **Reprise**
```
Dashboard → Section "À reprendre" → Clic "Reprendre" → Séance reprend au bon endroit
```

## 🧪 Tests

### Script de test
```bash
node test-resume-simple.js
```

### Tests effectués
- ✅ Calcul de progression
- ✅ Validation des indices
- ✅ Simulation de reprise
- ✅ Calcul du prochain exercice
- ✅ Validation du statut
- ✅ Préparation des données de sauvegarde

## 🚀 Déploiement

### 1. **Migration de base de données**
```sql
-- Exécuter le fichier update-schema-progression.sql
```

### 2. **Déploiement des composants**
- Les composants modifiés sont déjà intégrés
- Aucune configuration supplémentaire requise

### 3. **Test en production**
1. Créer une séance
2. Démarrer la séance
3. Cliquer sur "Quitter" → "Sauvegarder et quitter"
4. Vérifier l'apparition dans le dashboard
5. Cliquer sur "Reprendre"
6. Vérifier la reprise au bon endroit

## 📊 Métriques et analytics

### Données collectées
- Nombre de séances interrompues
- Taux de reprise des séances
- Temps moyen entre interruption et reprise
- Pourcentage de progression moyen des séances interrompues

### KPIs
- **Taux de reprise :** % de séances interrompues qui sont reprises
- **Temps de reprise :** Délai moyen avant reprise
- **Taux de complétion :** % de séances reprises qui sont complétées

## 🔧 Maintenance

### Nettoyage automatique
- Les séances `in_progress` de plus de 7 jours peuvent être automatiquement supprimées
- Script de nettoyage disponible

### Monitoring
- Surveiller les erreurs dans l'API `/api/save-progression`
- Vérifier la cohérence des données `exercise_index` et `set_index`

## 🎯 Améliorations futures

### Fonctionnalités envisagées
1. **Notifications push** pour rappeler les séances à reprendre
2. **Historique des interruptions** avec raisons
3. **Reprise partielle** avec modification des exercices restants
4. **Synchronisation multi-appareils** pour la progression
5. **Analytics avancés** sur les patterns d'interruption

### Optimisations techniques
1. **Cache Redis** pour les données de progression
2. **WebSockets** pour la synchronisation en temps réel
3. **Service Worker** pour la sauvegarde offline
4. **Compression** des données de progression

---

## 📞 Support

Pour toute question ou problème lié à cette fonctionnalité :
1. Consulter les logs de l'API `/api/save-progression`
2. Vérifier la cohérence des données en base
3. Tester avec le script `test-resume-simple.js`
4. Contacter l'équipe de développement

---

*Documentation mise à jour le : $(date)* 