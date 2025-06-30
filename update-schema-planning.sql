-- =====================================================
-- MISE À JOUR SCHÉMA GRIND - FONCTIONNALITÉ PLANNING
-- =====================================================

-- 1. AJOUT DU CHAMP STATUS À LA TABLE WORKOUTS
-- =====================================================

-- Ajouter le champ status avec des valeurs par défaut
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' 
CHECK (status IN ('planned', 'completed', 'cancelled'));

-- Mettre à jour les séances existantes comme 'completed'
UPDATE workouts 
SET status = 'completed' 
WHERE status IS NULL;

-- Index pour améliorer les performances sur le status
CREATE INDEX IF NOT EXISTS idx_workouts_status ON workouts(status);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date_status ON workouts(user_id, date, status);

-- 2. FONCTION POUR CALCULER LE STREAK AVEC STATUS
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_user_streak(user_uuid UUID)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, last_workout_date DATE) AS $$
DECLARE
    streak_count INTEGER := 0;
    max_streak INTEGER := 0;
    current_date DATE := CURRENT_DATE;
    check_date DATE := CURRENT_DATE;
    has_workout_today BOOLEAN := FALSE;
BEGIN
    -- Vérifier s'il y a une séance aujourd'hui (completed uniquement)
    SELECT EXISTS(
        SELECT 1 FROM workouts 
        WHERE user_id = user_uuid 
        AND date = CURRENT_DATE 
        AND status = 'completed'
    ) INTO has_workout_today;
    
    -- Si pas de séance aujourd'hui, commencer hier
    IF NOT has_workout_today THEN
        check_date := CURRENT_DATE - INTERVAL '1 day';
    END IF;
    
    -- Calculer le streak actuel
    WHILE EXISTS(
        SELECT 1 FROM workouts 
        WHERE user_id = user_uuid 
        AND date = check_date 
        AND status = 'completed'
    ) LOOP
        streak_count := streak_count + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    -- Calculer le streak le plus long (requête séparée pour les performances)
    SELECT COALESCE(MAX(streak_length), 0) INTO max_streak
    FROM (
        SELECT COUNT(*) as streak_length
        FROM (
            SELECT date, 
                   ROW_NUMBER() OVER (ORDER BY date DESC) as rn,
                   date - (ROW_NUMBER() OVER (ORDER BY date DESC) || ' days')::INTERVAL as grp
            FROM workouts 
            WHERE user_id = user_uuid 
            AND status = 'completed'
            ORDER BY date DESC
        ) t
        GROUP BY grp
    ) streaks;
    
    -- Récupérer la date de la dernière séance
    SELECT MAX(date) INTO last_workout_date
    FROM workouts 
    WHERE user_id = user_uuid 
    AND status = 'completed';
    
    RETURN QUERY SELECT streak_count, max_streak, last_workout_date;
END;
$$ LANGUAGE plpgsql;

-- 3. FONCTION POUR CALCULER LES MISSIONS HEBDOMADAIRES
-- =====================================================

CREATE OR REPLACE FUNCTION get_weekly_progress(user_uuid UUID, week_start DATE)
RETURNS TABLE(
    workouts_this_week INTEGER,
    xp_this_week INTEGER,
    consecutive_days INTEGER
) AS $$
BEGIN
    -- Séances de la semaine (completed uniquement)
    SELECT COUNT(*) INTO workouts_this_week
    FROM workouts 
    WHERE user_id = user_uuid 
    AND date >= week_start 
    AND date <= week_start + INTERVAL '6 days'
    AND status = 'completed';
    
    -- XP de la semaine (depuis daily_progress)
    SELECT COALESCE(SUM(xp_earned), 0) INTO xp_this_week
    FROM daily_progress 
    WHERE user_id = user_uuid 
    AND date >= week_start 
    AND date <= week_start + INTERVAL '6 days';
    
    -- Jours consécutifs (simplifié pour la semaine)
    SELECT COUNT(DISTINCT date) INTO consecutive_days
    FROM workouts 
    WHERE user_id = user_uuid 
    AND date >= week_start 
    AND date <= week_start + INTERVAL '6 days'
    AND status = 'completed';
    
    RETURN QUERY SELECT workouts_this_week, xp_this_week, consecutive_days;
END;
$$ LANGUAGE plpgsql;

-- 4. VUE POUR LES SÉANCES PLANIFIÉES
-- =====================================================

CREATE OR REPLACE VIEW planned_workouts AS
SELECT 
    w.id,
    w.user_id,
    w.date,
    w.exercises,
    w.notes,
    w.status,
    w.created_at,
    CASE 
        WHEN w.date = CURRENT_DATE THEN 'Aujourd''hui'
        WHEN w.date = CURRENT_DATE + INTERVAL '1 day' THEN 'Demain'
        ELSE TO_CHAR(w.date, 'DD/MM/YYYY')
    END as display_date,
    CASE 
        WHEN w.date < CURRENT_DATE THEN 'overdue'
        WHEN w.date = CURRENT_DATE THEN 'today'
        WHEN w.date <= CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
        ELSE 'future'
    END as date_category
FROM workouts w
WHERE w.status = 'planned'
ORDER BY w.date ASC;

-- 5. TRIGGER POUR METTRE À JOUR LE STREAK AUTOMATIQUEMENT
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_streak_on_workout()
RETURNS TRIGGER AS $$
DECLARE
    new_streak_data RECORD;
BEGIN
    -- Calculer le nouveau streak
    SELECT * INTO new_streak_data
    FROM calculate_user_streak(NEW.user_id);
    
    -- Mettre à jour le profil utilisateur
    UPDATE user_profiles 
    SET 
        current_streak = new_streak_data.current_streak,
        longest_streak = GREATEST(longest_streak, new_streak_data.longest_streak),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_update_streak ON workouts;
CREATE TRIGGER trigger_update_streak
    AFTER INSERT OR UPDATE OF status, date ON workouts
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak_on_workout();

-- 6. POLITIQUES RLS MISE À JOUR
-- =====================================================

-- Permettre la lecture des séances planifiées
CREATE POLICY "Allow user to read planned workouts" ON workouts
FOR SELECT USING (auth.uid() = user_id);

-- Permettre la mise à jour du status
CREATE POLICY "Allow user to update workout status" ON workouts
FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

/*
1. Connecte-toi à ton projet Supabase
2. Va dans SQL Editor
3. Copie et colle ce script
4. Exécute le script
5. Vérifie que les nouvelles colonnes sont ajoutées

Nouvelles fonctionnalités :
- Champ 'status' : 'planned', 'completed', 'cancelled'
- Fonction calculate_user_streak() mise à jour
- Fonction get_weekly_progress() pour les missions
- Vue planned_workouts pour les séances à venir
- Trigger automatique pour mettre à jour le streak

Utilisation :
- INSERT avec status = 'planned' pour programmer
- UPDATE status = 'completed' pour marquer comme fait
- Les missions/streak ne comptent que les séances 'completed'
*/ 