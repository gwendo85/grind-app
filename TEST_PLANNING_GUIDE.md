# 📅 Guide de Test - Fonctionnalité Planning GRIND

## ✅ Fonctionnalités Implémentées

### 1. **Programmation de Séances**
- ✅ Picker de date dans le formulaire
- ✅ Date par défaut : aujourd'hui
- ✅ Sélection de dates futures
- ✅ Validation : pas de dates passées

### 2. **Gestion des Statuts**
- ✅ `completed` : séances d'aujourd'hui
- ✅ `planned` : séances futures
- ✅ `cancelled` : séances annulées (pour V2)

### 3. **Logique XP et Missions**
- ✅ XP uniquement pour les séances `completed`
- ✅ Missions basées sur les séances `completed`
- ✅ Streak calculé avec les nouvelles fonctions Supabase

### 4. **Interface Utilisateur**
- ✅ Affichage séparé des séances complétées et planifiées
- ✅ Indicateurs visuels (couleurs, icônes)
- ✅ Formatage intelligent des dates

## 🧪 Tests à Effectuer

### Test 1: Programmation de Séance
```bash
# 1. Test séance immédiate (aujourd'hui)
- Ouvrir le formulaire "Nouvelle Séance"
- Vérifier que la date par défaut est aujourd'hui
- Remplir les exercices
- Soumettre
- Vérifier : message "✅ Séance ajoutée avec succès ! (+100 XP)"
- Vérifier : XP total augmente de 100
- Vérifier : séance apparaît dans "Mes Séances Récentes"

# 2. Test séance planifiée (demain)
- Changer la date pour demain
- Remplir les exercices
- Soumettre
- Vérifier : message "📅 Séance programmée pour Demain !"
- Vérifier : XP total N'augmente PAS
- Vérifier : séance apparaît dans "Séances Planifiées"

# 3. Test séance planifiée (date future)
- Changer la date pour dans 3 jours
- Remplir les exercices
- Soumettre
- Vérifier : message avec la date formatée
- Vérifier : séance dans "Séances Planifiées"
```

### Test 2: Affichage des Séances
```bash
# 1. Vérifier la séparation
- Créer 2 séances : une aujourd'hui, une demain
- Vérifier que la séance d'aujourd'hui est dans "Mes Séances Récentes"
- Vérifier que la séance de demain est dans "Séances Planifiées"

# 2. Vérifier le formatage des dates
- Séance aujourd'hui : affiche "Aujourd'hui"
- Séance demain : affiche "Demain"
- Séance future : affiche "lun. 15 janv." (format court)

# 3. Vérifier les indicateurs visuels
- Séances complétées : bordure grise, badge "+100 XP"
- Séances planifiées : bordure bleue, badge "Planifiée"
```

### Test 3: Missions et Streak
```bash
# 1. Test des missions avec séances planifiées
- Créer une séance planifiée pour demain
- Vérifier : mission "3 séances cette semaine" N'augmente PAS
- Vérifier : mission "500 XP cette semaine" N'augmente PAS

# 2. Test des missions avec séances complétées
- Créer une séance pour aujourd'hui
- Vérifier : mission "3 séances cette semaine" augmente
- Vérifier : mission "500 XP cette semaine" augmente

# 3. Test du streak
- Vérifier que le streak ne compte que les séances `completed`
- Créer une séance planifiée : streak ne change pas
- Créer une séance aujourd'hui : streak augmente
```

### Test 4: Validation et UX
```bash
# 1. Test validation des dates
- Essayer de sélectionner une date passée
- Vérifier : le picker empêche la sélection
- Vérifier : message d'erreur approprié

# 2. Test nom de séance auto-généré
- Laisser le nom vide
- Ajouter un exercice "Squat"
- Soumettre
- Vérifier : nom généré "Séance Squat"

# 3. Test responsive
- Tester sur mobile
- Vérifier : picker de date accessible
- Vérifier : affichage correct des séances
```

## 🔍 Points de Vérification Critiques

### Base de Données
- [ ] Champ `status` ajouté à la table `workouts`
- [ ] Champ `date` utilisé au lieu de `created_at`
- [ ] Fonction `calculate_user_streak()` mise à jour
- [ ] Fonction `get_weekly_progress()` créée
- [ ] Vue `planned_workouts` créée

### Frontend
- [ ] Picker de date fonctionnel
- [ ] Validation des dates (pas de passé)
- [ ] Affichage séparé des séances
- [ ] Messages appropriés selon le statut
- [ ] XP uniquement pour les séances `completed`

### Logique Métier
- [ ] Missions basées sur `completed` uniquement
- [ ] Streak basé sur `completed` uniquement
- [ ] XP ajouté uniquement pour `completed`
- [ ] Formatage intelligent des dates

## 🐛 Bugs Potentiels à Surveiller

1. **XP incorrect** : Vérifier que l'XP n'est ajouté que pour les séances `completed`
2. **Missions fausses** : Vérifier que les missions ne comptent que les séances `completed`
3. **Streak incorrect** : Vérifier que le streak ne compte que les séances `completed`
4. **Dates passées** : S'assurer qu'on ne peut pas programmer dans le passé
5. **Affichage confus** : Vérifier la séparation claire entre complétées et planifiées

## 📱 Test sur Mobile

```bash
# 1. Test du picker de date
- Ouvrir sur mobile
- Tester la sélection de date
- Vérifier l'accessibilité

# 2. Test de l'affichage
- Vérifier que les séances s'affichent correctement
- Tester le scroll dans les listes
- Vérifier les boutons et interactions

# 3. Test de performance
- Créer plusieurs séances planifiées
- Vérifier la fluidité de l'interface
```

## 🚀 Prochaines Étapes (V2)

### Fonctionnalités Avancées
- [ ] Page "Planning" dédiée
- [ ] Notifications de rappel
- [ ] Statut `cancelled` pour annuler
- [ ] Modification des séances planifiées
- [ ] Vue calendrier

### Améliorations UX
- [ ] Drag & drop pour réorganiser
- [ ] Filtres par type d'exercice
- [ ] Recherche dans les séances
- [ ] Export des séances

## ✅ Checklist Finale

- [ ] Picker de date fonctionnel
- [ ] Validation des dates
- [ ] Séparation affichage complétées/planifiées
- [ ] XP uniquement pour `completed`
- [ ] Missions basées sur `completed`
- [ ] Streak basé sur `completed`
- [ ] Messages appropriés
- [ ] Responsive design
- [ ] Pas d'erreurs console
- [ ] Performance optimale

## 🎯 Résultat Attendu

L'utilisateur peut maintenant :
- ✅ Programmer des séances pour des dates futures
- ✅ Voir ses séances planifiées séparément
- ✅ Gagner XP uniquement en complétant des séances
- ✅ Suivre ses missions et streak correctement
- ✅ Avoir une interface claire et intuitive

**Status: READY FOR USER TESTING** 🚀 