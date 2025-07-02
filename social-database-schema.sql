-- 🚀 GRIND - Schéma de base de données pour les fonctionnalités sociales
-- Phase 1 : Fondations sociales

-- ========================================
-- 1. SYSTÈME D'AMIS
-- ========================================

-- Table pour les relations d'amitié
CREATE TABLE IF NOT EXISTS user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);

-- ========================================
-- 2. FEED D'ACTIVITÉ
-- ========================================

-- Table pour les posts d'activité
CREATE TABLE IF NOT EXISTS activity_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les kudos (likes)
CREATE TABLE IF NOT EXISTS activity_kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES activity_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Table pour les commentaires
CREATE TABLE IF NOT EXISTS activity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES activity_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour le feed
CREATE INDEX IF NOT EXISTS idx_activity_posts_user_id ON activity_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_posts_created_at ON activity_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_kudos_post_id ON activity_kudos(post_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_post_id ON activity_comments(post_id);

-- ========================================
-- 3. CHALLENGES COMMUNAUTAIRES
-- ========================================

-- Table pour les challenges
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('workouts', 'streak', 'xp', 'distance')) NOT NULL,
  target_value INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les participations aux challenges
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Index pour les challenges
CREATE INDEX IF NOT EXISTS idx_community_challenges_active ON community_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_community_challenges_featured ON community_challenges(is_featured);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);

-- ========================================
-- 4. NOTIFICATIONS
-- ========================================

-- Table pour les notifications
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('friend_request', 'kudos', 'challenge_invite', 'challenge_complete', 'level_up')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Données supplémentaires (ex: post_id, challenge_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- ========================================
-- 5. FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_user_friends_updated_at BEFORE UPDATE ON user_friends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_posts_updated_at BEFORE UPDATE ON activity_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_comments_updated_at BEFORE UPDATE ON activity_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_challenges_updated_at BEFORE UPDATE ON community_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_participants_updated_at BEFORE UPDATE ON challenge_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. POLITIQUES RLS (Row Level Security)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_kudos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_friends
CREATE POLICY "Users can view their own friend relationships" ON user_friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests" ON user_friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friend relationships" ON user_friends
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Politiques pour activity_posts
CREATE POLICY "Users can view public posts and their own posts" ON activity_posts
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" ON activity_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON activity_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON activity_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour activity_kudos
CREATE POLICY "Users can view kudos on posts they can see" ON activity_kudos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM activity_posts 
      WHERE id = post_id AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create kudos" ON activity_kudos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kudos" ON activity_kudos
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour community_challenges
CREATE POLICY "Users can view active challenges" ON community_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create challenges" ON community_challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Politiques pour challenge_participants
CREATE POLICY "Users can view challenge participants" ON challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour user_notifications
CREATE POLICY "Users can view their own notifications" ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- 7. DONNÉES DE DÉMONSTRATION
-- ========================================

-- Insérer quelques challenges de démonstration
INSERT INTO community_challenges (title, description, challenge_type, target_value, duration_days, is_featured, created_by) VALUES
('Défi 30 jours', '30 séances en 30 jours pour créer une habitude durable', 'workouts', 30, 30, true, NULL),
('Streak de 7 jours', '7 jours consécutifs d''entraînement', 'streak', 7, 7, true, NULL),
('10k XP en 1 mois', 'Gagner 10 000 XP en un mois', 'xp', 10000, 30, true, NULL),
('Défi Cardio', '5 séances cardio cette semaine', 'workouts', 5, 7, false, NULL);

-- ========================================
-- 8. VUES UTILES
-- ========================================

-- Vue pour les statistiques d'amis
CREATE OR REPLACE VIEW user_friends_stats AS
SELECT 
  u.id as user_id,
  COUNT(CASE WHEN uf.status = 'accepted' THEN 1 END) as friends_count,
  COUNT(CASE WHEN uf.status = 'pending' AND uf.user_id = u.id THEN 1 END) as pending_sent,
  COUNT(CASE WHEN uf.status = 'pending' AND uf.friend_id = u.id THEN 1 END) as pending_received
FROM auth.users u
LEFT JOIN user_friends uf ON (u.id = uf.user_id OR u.id = uf.friend_id)
GROUP BY u.id;

-- Vue pour les posts avec statistiques
CREATE OR REPLACE VIEW activity_posts_with_stats AS
SELECT 
  ap.*,
  up.username,
  up.avatar_url,
  COUNT(DISTINCT ak.id) as kudos_count,
  COUNT(DISTINCT ac.id) as comments_count,
  EXISTS(SELECT 1 FROM activity_kudos WHERE post_id = ap.id AND user_id = auth.uid()) as has_liked
FROM activity_posts ap
LEFT JOIN user_profiles up ON ap.user_id = up.id
LEFT JOIN activity_kudos ak ON ap.id = ak.post_id
LEFT JOIN activity_comments ac ON ap.id = ac.post_id
WHERE ap.is_public = true OR ap.user_id = auth.uid()
GROUP BY ap.id, up.username, up.avatar_url
ORDER BY ap.created_at DESC;

-- ========================================
-- 9. COMMENTAIRES ET DOCUMENTATION
-- ========================================

COMMENT ON TABLE user_friends IS 'Relations d''amitié entre utilisateurs';
COMMENT ON TABLE activity_posts IS 'Posts d''activité partagés par les utilisateurs';
COMMENT ON TABLE activity_kudos IS 'Système de kudos (likes) sur les posts';
COMMENT ON TABLE community_challenges IS 'Défis communautaires pour motiver les utilisateurs';
COMMENT ON TABLE challenge_participants IS 'Participation des utilisateurs aux défis';
COMMENT ON TABLE user_notifications IS 'Notifications système pour les interactions sociales';

COMMENT ON COLUMN activity_posts.message IS 'Message optionnel accompagnant le post';
COMMENT ON COLUMN activity_posts.is_public IS 'Si false, seuls les amis peuvent voir le post';
COMMENT ON COLUMN community_challenges.challenge_type IS 'Type de défi: workouts, streak, xp, distance';
COMMENT ON COLUMN user_notifications.data IS 'Données JSON supplémentaires pour la notification'; 