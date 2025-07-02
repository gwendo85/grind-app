# 🧪 Guide de Test - Revalidation Automatique des Stats

## Objectif
Vérifier que l'ajout de séances déclenche automatiquement la revalidation des stats (XP, streak, etc.) sans rechargement de page.

## Prérequis
- Serveur de développement lancé sur `http://localhost:3001`
- Console du navigateur ouverte (F12)
- Compte utilisateur connecté

## Étapes de Test

### 1. Préparation
1. Ouvrir `http://localhost:3001`
2. Se connecter avec un compte existant
3. Ouvrir la console du navigateur (F12)
4. Aller sur le dashboard

### 2. Vérification des Logs Initiaux
Dans la console, vous devriez voir :
```
🔄 [useUserStats] Début de la récupération des stats pour userId: [user-id]
📊 [useUserStats] XP récupéré: [nombre]
🔥 [useUserStats] Streak récupéré: { current: [nombre], longest: [nombre] }
🏆 [useUserStats] Badges récupérés: [nombre]
✅ [useUserStats] Récupération terminée
```

### 3. Test d'Ajout de Séance
1. **Récupérer l'XP initial** : Noter l'XP affiché dans le composant XPProgress
2. **Ajouter une séance** :
   - Remplir le formulaire "Nouvelle Séance"
   - Nom : "Test Revalidation"
   - Exercice : "Pompes" (poids: 0, rép: 10, séries: 3)
   - Date : Aujourd'hui
   - Cliquer sur "Ajouter la séance"

### 4. Vérification des Logs d'Ajout
Dans la console, vous devriez voir :
```
🏋️ [useWorkouts] Ajout d'une séance...
✅ [useWorkouts] Séance ajoutée avec succès: [workout-id]
✅ [useWorkouts] XP ajouté (+100)
```

### 5. Vérification de la Revalidation
**IMPORTANT** : Regarder si l'XP se met à jour automatiquement dans l'interface.

Dans la console, vous devriez voir une nouvelle récupération des stats :
```
🔄 [useUserStats] Début de la récupération des stats pour userId: [user-id]
📊 [useUserStats] XP récupéré: [nouveau-nombre]
🔥 [useUserStats] Streak récupéré: { current: [nouveau-nombre], longest: [nombre] }
🏆 [useUserStats] Badges récupérés: [nombre]
✅ [useUserStats] Récupération terminée
```

### 6. Vérification Visuelle
- ✅ L'XP dans le composant XPProgress a augmenté de 100
- ✅ La séance apparaît dans la liste "Mes Séances Récentes"
- ✅ Le streak s'est mis à jour si c'était la première séance du jour
- ✅ Pas de rechargement de page

## Résultats Attendus

### ✅ Succès
- L'XP augmente automatiquement de 100 points
- La séance apparaît immédiatement dans la liste
- Les logs montrent la revalidation automatique
- Pas de rechargement de page

### ❌ Échec
- L'XP ne change pas
- La séance n'apparaît pas dans la liste
- Pas de logs de revalidation
- Page qui se recharge

## Dépannage

### Problème : Pas de logs
- Vérifier que la console est ouverte
- Vérifier que les logs ne sont pas filtrés
- Recharger la page et réessayer

### Problème : XP ne change pas
- Vérifier que la date de la séance est aujourd'hui
- Vérifier que le statut est "completed"
- Vérifier les logs d'erreur dans la console

### Problème : Séance n'apparaît pas
- Vérifier que la séance a bien été ajoutée en base
- Vérifier les logs d'erreur dans la console
- Vérifier que le composant DashboardClient reçoit bien les nouvelles données

## Test de Stress
1. Ajouter plusieurs séances rapidement
2. Vérifier que chaque ajout déclenche une revalidation
3. Vérifier que l'XP s'accumule correctement

## Notes Techniques
- Le hook `useUserStats` se revalide automatiquement via `useEffect`
- Le hook `useWorkouts` ajoute l'XP directement en base
- La revalidation se fait via le changement de `invalidationCounter`
- Les logs permettent de tracer le flux de données 