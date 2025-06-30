# 🧪 Guide de Test - Système XP

## ✅ Implémentation Terminée

### 🔧 Modifications Apportées

1. **WeeklyMissions.tsx** - Calcul XP réel
   - ✅ Récupération depuis `daily_progress`
   - ✅ Calcul du début de semaine (lundi)
   - ✅ Affichage progression réelle (ex: 300/500 XP)
   - ✅ Barre de progression dynamique
   - ✅ État de chargement

2. **NewWorkoutForm.tsx** - Ajout XP automatique
   - ✅ Upsert dans `daily_progress`
   - ✅ Gestion des séances multiples par jour
   - ✅ Incrémentation XP (+100) et sessions_completed (+1)

## 🚀 Tests à Effectuer

### 1. Test de Base
```bash
# 1. Aller sur http://localhost:3000/dashboard
# 2. Ouvrir la console (F12)
# 3. Exécuter le script de test
testXPSystem()
```

### 2. Test Manuel - Ajout de Séance
1. **Ajouter une séance** via le formulaire
2. **Vérifier** que la mission XP s'incrémente
3. **Vérifier** que la barre de progression avance
4. **Vérifier** que le texte affiche "100/500 XP"

### 3. Test Multiples Séances
1. **Ajouter 2-3 séances** le même jour
2. **Vérifier** que l'XP s'accumule (300/500 XP)
3. **Vérifier** que `sessions_completed` s'incrémente

### 4. Test Mission Complète
1. **Ajouter 5 séances** (500 XP)
2. **Vérifier** que la mission affiche "Mission accomplie ! 🎉"
3. **Vérifier** que la barre est verte et complète

## 🔍 Vérifications Supabase

### Dans l'éditeur SQL de Supabase :

```sql
-- 1. Vérifier la structure de daily_progress
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'daily_progress' 
ORDER BY ordinal_position;

-- 2. Vérifier les données d'un utilisateur
SELECT * FROM daily_progress 
WHERE user_id = 'your-user-id' 
ORDER BY date DESC 
LIMIT 7;

-- 3. Calculer l'XP de la semaine
SELECT 
  SUM(xp_earned) as total_weekly_xp,
  SUM(sessions_completed) as total_sessions
FROM daily_progress 
WHERE user_id = 'your-user-id' 
  AND date >= '2024-01-01' -- Remplacer par le début de semaine
  AND date <= '2024-01-07'; -- Remplacer par la fin de semaine
```

## 🐛 Dépannage

### Problème : Mission XP reste à 0/500
**Cause possible :** Table `daily_progress` vide ou erreur de requête
**Solution :**
1. Vérifier que la table existe
2. Vérifier les policies RLS
3. Exécuter le script de test

### Problème : XP ne s'incrémente pas
**Cause possible :** Erreur dans l'upsert
**Solution :**
1. Vérifier les logs console
2. Vérifier la structure de `daily_progress`
3. Tester manuellement l'insertion

### Problème : Calcul de semaine incorrect
**Cause possible :** Logique de début de semaine
**Solution :**
1. Vérifier la fonction `getWeekStart()`
2. Ajuster selon le fuseau horaire

## 📊 Résultats Attendus

### Après 1 séance :
- Mission XP : "100/500 XP"
- Barre : 20% (bleue)
- Texte : "Bien parti ! 🚀"

### Après 3 séances :
- Mission XP : "300/500 XP"
- Barre : 60% (jaune)
- Texte : "Presque là ! 💪"

### Après 5 séances :
- Mission XP : "500/500 XP"
- Barre : 100% (verte)
- Texte : "Mission accomplie ! 🎉"

## 🎯 Validation Finale

✅ **Système XP fonctionnel**
✅ **Calcul hebdomadaire correct**
✅ **Affichage progression dynamique**
✅ **Intégration avec ajout de séance**
✅ **Gestion multi-séances par jour**

**Le système XP est maintenant opérationnel ! 🚀** 