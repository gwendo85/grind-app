-- =====================================================
-- MIGRATION SIMPLE - Ajout de la colonne exercises
-- =====================================================

-- 1. Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workouts' 
ORDER BY ordinal_position;

-- 2. Ajouter la colonne exercises si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workouts' AND column_name = 'exercises'
    ) THEN
        ALTER TABLE workouts ADD COLUMN exercises JSONB;
        RAISE NOTICE 'Colonne exercises ajoutée';
    ELSE
        RAISE NOTICE 'Colonne exercises existe déjà';
    END IF;
END $$;

-- 3. Migrer les données existantes de exercise vers exercises
UPDATE workouts 
SET exercises = jsonb_build_array(
    jsonb_build_object(
        'name', exercise,
        'weight', weight,
        'reps', reps,
        'notes', COALESCE(notes, '')
    )
)
WHERE exercise IS NOT NULL 
AND exercises IS NULL;

-- 4. Vérifier la migration
SELECT id, user_id, exercise, exercises, created_at 
FROM workouts 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Supprimer l'ancienne colonne exercise (optionnel - à faire après vérification)
-- ALTER TABLE workouts DROP COLUMN exercise;

-- 6. Recréer les index si nécessaire
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at);
CREATE INDEX IF NOT EXISTS idx_workouts_exercises ON workouts USING GIN (exercises);

-- 7. Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'workouts'; 