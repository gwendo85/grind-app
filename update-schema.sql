-- =====================================================
-- SCRIPT DE MISE À JOUR DU SCHÉMA GRIND
-- Migration de exercise (TEXT) vers exercises (JSONB)
-- =====================================================

-- 1. SAUVEGARDE DES DONNÉES EXISTANTES
-- =====================================================

-- Créer une table temporaire pour sauvegarder les données existantes
CREATE TABLE IF NOT EXISTS workouts_backup AS 
SELECT * FROM workouts;

-- 2. SUPPRIMER LES CONTRAINTES ET INDEX EXISTANTS
-- =====================================================

-- Supprimer les politiques RLS existantes
DROP POLICY IF EXISTS "Allow user to read their workouts" ON workouts;
DROP POLICY IF EXISTS "Allow user to insert their workouts" ON workouts;
DROP POLICY IF EXISTS "Allow user to update their workouts" ON workouts;
DROP POLICY IF EXISTS "Allow user to delete their workouts" ON workouts;

-- Supprimer les index existants
DROP INDEX IF EXISTS idx_workouts_user_id;
DROP INDEX IF EXISTS idx_workouts_date;

-- 3. MODIFIER LA STRUCTURE DE LA TABLE
-- =====================================================

-- Ajouter la nouvelle colonne exercises (JSONB)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS exercises JSONB;

-- Migrer les données existantes vers la nouvelle structure
UPDATE workouts 
SET exercises = json_build_array(
  json_build_object(
    'name', exercise,
    'weight', weight,
    'reps', reps,
    'notes', notes
  )
)
WHERE exercises IS NULL AND exercise IS NOT NULL;

-- Supprimer les anciennes colonnes
ALTER TABLE workouts DROP COLUMN IF EXISTS exercise;
ALTER TABLE workouts DROP COLUMN IF EXISTS weight;
ALTER TABLE workouts DROP COLUMN IF EXISTS reps;
ALTER TABLE workouts DROP COLUMN IF EXISTS sets;
ALTER TABLE workouts DROP COLUMN IF EXISTS duration_minutes;

-- Supprimer les colonnes exercise_index et set_index
ALTER TABLE workouts
DROP COLUMN IF EXISTS exercise_index,
DROP COLUMN IF EXISTS set_index;

-- 4. RECRÉER LES INDEX ET CONTRAINTES
-- =====================================================

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_exercises ON workouts USING GIN (exercises);

-- 5. RECRÉER LES POLITIQUES RLS
-- =====================================================

-- Politiques pour WORKOUTS
CREATE POLICY "Allow user to read their workouts" ON workouts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow user to insert their workouts" ON workouts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow user to update their workouts" ON workouts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow user to delete their workouts" ON workouts
FOR DELETE USING (auth.uid() = user_id);

-- 6. VÉRIFICATION
-- =====================================================

-- Vérifier que la migration s'est bien passée
SELECT 
  'workouts' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as records_with_exercises
FROM workouts;

-- Afficher un exemple de données migrées
SELECT 
  id,
  user_id,
  date,
  exercises,
  notes,
  created_at
FROM workouts 
LIMIT 3;

-- 7. NETTOYAGE (optionnel)
-- =====================================================

-- Supprimer la table de sauvegarde après vérification
-- DROP TABLE IF EXISTS workouts_backup;

-- =====================================================
-- INSTRUCTIONS D'EXÉCUTION
-- =====================================================

/*
1. Connecte-toi à ton projet Supabase
2. Va dans SQL Editor
3. Copie et colle ce script
4. Exécute le script
5. Vérifie les résultats de la section "VÉRIFICATION"
6. Si tout est OK, tu peux supprimer la table de sauvegarde

⚠️ ATTENTION : Ce script modifie la structure de la table workouts
   Assure-toi d'avoir une sauvegarde avant d'exécuter ce script
   
✅ Après exécution, redémarre ton serveur de développement :
   pkill -f "next dev" && cd grind-app && pnpm dev
*/ 