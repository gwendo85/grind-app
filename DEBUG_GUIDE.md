# 🔧 Guide de Débogage - Erreur d'Ajout de Séance

## 🎯 Problème Identifié
Erreur `undefined` lors de l'ajout d'une séance d'entraînement, indiquant une gestion d'erreur incomplète.

## 🚀 Solutions Appliquées

### 1. ✅ Amélioration de la Gestion d'Erreur
- **Logs détaillés** : Affichage complet de l'erreur Supabase
- **Gestion robuste** : Try/catch avec fallbacks multiples
- **Messages informatifs** : Erreurs spécifiques et lisibles
- **Diagnostic complet** : Type, propriétés, code, détails, hint

### 2. ✅ Script de Test Automatisé
- **Fichier créé** : `test-quick.js` + intégré dans layout
- **Tests complets** : Authentification, structure, insertion, RLS
- **Diagnostic rapide** : Résumé en une commande
- **Nettoyage automatique** : Suppression des données de test

## 🔍 Étapes de Débogage

### Étape 1: Test Automatisé
```bash
# 1. Ouvrir la console du navigateur sur http://localhost:3000
# 2. Exécuter le test complet
quickTest.runQuickTest()
```

### Étape 2: Test Manuel du Formulaire
1. **Aller sur** : http://localhost:3000/dashboard
2. **Se connecter** si nécessaire
3. **Remplir le formulaire** avec des données valides
4. **Cliquer sur "Ajouter la séance"**
5. **Vérifier la console** pour les logs détaillés

### Étape 3: Vérification Supabase

#### 3.1 Structure de la Table
```sql
-- Dans Supabase > SQL Editor
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workouts';
```

**Colonnes attendues :**
- `id` (uuid, primary key)
- `user_id` (uuid, not null)
- `exercise` (text, not null)
- `weight` (integer)
- `reps` (integer)
- `notes` (text)
- `created_at` (timestamp)

#### 3.2 Policies RLS
```sql
-- Vérifier les policies existantes
SELECT * FROM pg_policies WHERE tablename = 'workouts';
```

**Policy INSERT requise :**
```sql
CREATE POLICY "Allow insert for authenticated users"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### 3.3 Test Direct en SQL
```sql
-- Test d'insertion directe (remplacer USER_ID)
INSERT INTO workouts (user_id, exercise, weight, reps, notes)
VALUES ('USER_ID_HERE', 'Test SQL', 50, 10, 'Test direct');
```

## 🐛 Diagnostic des Erreurs Courantes

### Erreur 1: "new row violates row-level security policy"
**Cause :** Policy RLS manquante ou incorrecte
**Solution :** Créer la policy INSERT appropriée

### Erreur 2: "column does not exist"
**Cause :** Nom de colonne incorrect
**Solution :** Vérifier les noms exacts dans Supabase

### Erreur 3: "null value in column violates not-null constraint"
**Cause :** Valeur manquante pour une colonne obligatoire
**Solution :** Vérifier que tous les champs requis sont remplis

### Erreur 4: "invalid input syntax for type integer"
**Cause :** Type de données incorrect
**Solution :** Vérifier que weight et reps sont des nombres

## 📊 Logs de Débogage

### Logs Console Attendus
```
✅ Utilisateur connecté: [user-id]
📝 Données à insérer: {user_id: "...", exercise: "...", weight: 50, reps: 10, notes: "..."}
✅ Workout inséré avec succès: [{...}]
✅ XP ajouté avec succès
```

### Logs d'Erreur Détaillés
```
❌ Erreur Supabase complète: {code: "...", message: "...", details: "...", hint: "..."}
❌ Type d'erreur: object
❌ Propriétés de l'erreur: ["code", "message", "details", "hint"]
❌ Code d'erreur: 42501
❌ Message d'erreur: new row violates row-level security policy
❌ Détails: Failing row contains (...)
❌ Hint: You may need to create a policy for this table
```

## 🛠️ Corrections Rapides

### Correction 1: Policy RLS Manquante
```sql
-- Dans Supabase > SQL Editor
CREATE POLICY "Allow insert for authenticated users"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select for authenticated users"
ON workouts
FOR SELECT
USING (auth.uid() = user_id);
```

### Correction 2: Vérification des Types
```sql
-- Vérifier les types de colonnes
ALTER TABLE workouts 
ALTER COLUMN weight TYPE integer USING weight::integer,
ALTER COLUMN reps TYPE integer USING reps::integer;
```

### Correction 3: Réinitialisation de la Table
```sql
-- Si nécessaire, recréer la table
DROP TABLE IF EXISTS workouts CASCADE;
-- Puis exécuter le schéma complet depuis supabase-schema.sql
```

## ✅ Checklist de Validation

- [ ] **Authentification** : Utilisateur connecté
- [ ] **Structure** : Table workouts accessible
- [ ] **Insertion** : Test d'insertion réussi
- [ ] **RLS** : Policies configurées
- [ ] **Types** : Colonnes avec bons types
- [ ] **Formulaire** : Données valides envoyées
- [ ] **Logs** : Messages d'erreur détaillés

## 🎯 Résolution Finale

Une fois le problème identifié via les logs détaillés :

1. **Corriger la cause** (RLS, structure, types)
2. **Tester à nouveau** avec le script automatisé
3. **Valider le formulaire** en conditions réelles
4. **Documenter la solution** pour éviter la récurrence

## 📞 Support

Si le problème persiste après ces étapes :
1. Copier les logs complets de la console
2. Vérifier la configuration Supabase
3. Tester avec des données minimales
4. Consulter la documentation Supabase RLS 