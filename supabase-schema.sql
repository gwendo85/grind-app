-- =====================================================
-- SCHÉMA DE BASE DE DONNÉES GRIND - SUPABASE
-- =====================================================

-- 1. TABLE WORKOUTS
-- =====================================================
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    exercises JSONB NOT NULL, -- Array d'exercices avec {name, weight, reps, notes}
    notes TEXT, -- Notes générales de la séance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workouts_exercises ON workouts USING GIN (exercises);

-- 2. TABLE XP_LOGS (pour le système de progression/expérience)
-- =====================================================
CREATE TABLE IF NOT EXISTS xp_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    xp_points INTEGER NOT NULL DEFAULT 0,
    activity_type TEXT NOT NULL, -- 'workout', 'streak', 'achievement', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour xp_logs
CREATE INDEX IF NOT EXISTS idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_logs_workout_id ON xp_logs(workout_id);

-- 3. TABLE USER_PROFILES (extension du profil utilisateur)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    weight NUMERIC(5,2), -- Poids actuel en kg
    height INTEGER, -- Taille en cm
    fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    goals TEXT[], -- Array des objectifs
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 4. TABLE WORKOUT_SETS (log des séries réalisées)
-- =====================================================
CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_name TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE
);

-- Index pour workout_sets
CREATE INDEX IF NOT EXISTS idx_workout_sets_user_id ON workout_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id ON workout_sets(workout_id);

-- 5. POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour WORKOUTS
-- =====================================================

-- Lecture : L'utilisateur peut voir ses propres workouts
CREATE POLICY "Allow user to read their workouts" ON workouts
FOR SELECT USING (auth.uid() = user_id);

-- Insertion : L'utilisateur peut créer ses propres workouts
CREATE POLICY "Allow user to insert their workouts" ON workouts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour : L'utilisateur peut modifier ses propres workouts
CREATE POLICY "Allow user to update their workouts" ON workouts
FOR UPDATE USING (auth.uid() = user_id);

-- Suppression : L'utilisateur peut supprimer ses propres workouts
CREATE POLICY "Allow user to delete their workouts" ON workouts
FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour XP_LOGS
-- =====================================================

-- Lecture : L'utilisateur peut voir ses propres logs XP
CREATE POLICY "Allow user to read their xp logs" ON xp_logs
FOR SELECT USING (auth.uid() = user_id);

-- Insertion : L'utilisateur peut créer ses propres logs XP
CREATE POLICY "Allow user to insert their xp logs" ON xp_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour : L'utilisateur peut modifier ses propres logs XP
CREATE POLICY "Allow user to update their xp logs" ON xp_logs
FOR UPDATE USING (auth.uid() = user_id);

-- Suppression : L'utilisateur peut supprimer ses propres logs XP
CREATE POLICY "Allow user to delete their xp logs" ON xp_logs
FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour USER_PROFILES
-- =====================================================

-- Lecture : L'utilisateur peut voir son propre profil
CREATE POLICY "Allow user to read their profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Insertion : L'utilisateur peut créer son propre profil
CREATE POLICY "Allow user to insert their profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Mise à jour : L'utilisateur peut modifier son propre profil
CREATE POLICY "Allow user to update their profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Suppression : L'utilisateur peut supprimer son propre profil
CREATE POLICY "Allow user to delete their profile" ON user_profiles
FOR DELETE USING (auth.uid() = id);

-- 6. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le total XP d'un utilisateur
CREATE OR REPLACE FUNCTION calculate_user_total_xp(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(xp_points) 
        FROM xp_logs 
        WHERE user_id = user_uuid
    ), 0);
END;
$$ LANGUAGE plpgsql;

-- 7. DONNÉES DE TEST (optionnel)
-- =====================================================

-- Insérer quelques séances de test (à exécuter après avoir créé un utilisateur)
-- INSERT INTO workouts (user_id, exercises, notes) VALUES
-- ('USER_UUID_HERE', '[{"name": "Squat", "weight": 80.0, "reps": 8, "notes": "Bonne forme, se sentir fort"}]', 'Séance jambes'),
-- ('USER_UUID_HERE', '[{"name": "Bench Press", "weight": 60.0, "reps": 10, "notes": "Progression constante"}]', 'Séance pectoraux'),
-- ('USER_UUID_HERE', '[{"name": "Deadlift", "weight": 100.0, "reps": 5, "notes": "Attention à la technique"}]', 'Séance dos');

-- =====================================================
-- INSTRUCTIONS D'UTILISATION
-- =====================================================

/*
1. Connecte-toi à ton projet Supabase
2. Va dans SQL Editor
3. Copie et colle tout ce script
4. Exécute le script
5. Vérifie dans Table Editor que les tables sont créées
6. Vérifie dans Authentication > Policies que les politiques RLS sont actives

Les tables créées :
- workouts : Stockage des séances d'entraînement (structure JSONB pour exercises)
- xp_logs : Système de points d'expérience
- user_profiles : Profils utilisateur étendus
- workout_sets : Log des séries réalisées

Structure JSONB pour exercises :
[
  {
    "name": "Nom de l'exercice",
    "weight": 80.0,
    "reps": 8,
    "notes": "Notes spécifiques à l'exercice"
  }
]

Sécurité :
- RLS activé sur toutes les tables
- Chaque utilisateur ne peut voir/modifier que ses propres données
- Références avec CASCADE pour la cohérence des données
*/ 