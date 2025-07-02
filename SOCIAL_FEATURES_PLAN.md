# 🚀 GRIND - Plan d'implémentation des fonctionnalités sociales

## 📋 **Phase 1 : Fondations sociales (2-3 semaines)**

### ✅ **Système d'amis**
```sql
-- Table pour les relations d'amitié
CREATE TABLE user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Index pour les requêtes rapides
CREATE INDEX idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX idx_user_friends_friend_id ON user_friends(friend_id);
```

### ✅ **Feed d'activité**
```sql
-- Table pour les posts d'activité
CREATE TABLE activity_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les kudos (likes)
CREATE TABLE activity_kudos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES activity_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

### ✅ **Challenges communautaires**
```sql
-- Table pour les challenges
CREATE TABLE community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT CHECK (challenge_type IN ('workouts', 'streak', 'xp', 'distance')),
  target_value INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les participations aux challenges
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);
```

---

## 🎯 **Phase 2 : Fonctionnalités avancées (3-4 semaines)**

### ✅ **Statistiques visuelles**
- Graphiques de progression XP par semaine/mois
- Comparaison avec les amis
- Heatmap des séances (comme GitHub)
- Tendances de performance

### ✅ **Intégrations santé**
- Apple Health (iOS)
- Google Fit (Android)
- Synchronisation automatique des séances cardio
- Import des données de fréquence cardiaque

### ✅ **Système de badges sociaux**
- Badges pour les interactions sociales
- Badges de participation aux challenges
- Badges de mentorat (aider les nouveaux)

---

## 💎 **Phase 3 : Premium (4-5 semaines)**

### ✅ **Offre Premium GRIND Pro**
- Plans d'entraînement personnalisés
- Coaching IA avec recommandations
- Rapports détaillés et analytics avancés
- Challenges exclusifs
- Pas de publicités

### ✅ **Fonctionnalités Premium**
```sql
-- Table pour les abonnements Premium
CREATE TABLE premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🛠️ **Composants React à créer**

### 1. **SocialFeed.tsx**
```tsx
// Feed d'activité des amis
export default function SocialFeed({ userId }: { userId: string }) {
  // Récupérer les posts des amis
  // Afficher les séances récentes
  // Système de kudos
}
```

### 2. **FriendsList.tsx**
```tsx
// Gestion des amis
export default function FriendsList({ userId }: { userId: string }) {
  // Liste des amis
  // Demandes d'amitié
  // Recherche d'utilisateurs
}
```

### 3. **CommunityChallenges.tsx**
```tsx
// Challenges communautaires
export default function CommunityChallenges() {
  // Challenges actifs
  // Progression personnelle
  // Classements
}
```

### 4. **ProgressCharts.tsx**
```tsx
// Graphiques de progression
export default function ProgressCharts({ userId }: { userId: string }) {
  // Graphiques XP
  // Comparaisons
  // Tendances
}
```

---

## 📊 **Métriques de succès**

### **Engagement social**
- Nombre d'amis par utilisateur
- Taux de participation aux challenges
- Fréquence des interactions (kudos, commentaires)

### **Rétention**
- Temps passé dans l'app
- Fréquence des connexions
- Taux de conversion Premium

### **Croissance**
- Invitations d'amis
- Partages sur réseaux sociaux
- Téléchargements organiques

---

## 🎯 **Priorités d'implémentation**

1. **Semaine 1-2** : Système d'amis + Feed basique
2. **Semaine 3-4** : Challenges communautaires
3. **Semaine 5-6** : Graphiques et statistiques
4. **Semaine 7-8** : Intégrations santé
5. **Semaine 9-12** : Système Premium

---

## 💡 **Inspirations Strava à adapter**

- **Kudos** → "💪" pour les séances
- **Segments** → "Challenges" personnalisés
- **Clubs** → "Communautés" par sport
- **Routes** → "Plans d'entraînement" partagés
- **Photos** → "Avant/Après" de progression

---

## 🚀 **Résultat attendu**

GRIND devient une **plateforme sociale de fitness** avec :
- ✅ Engagement communautaire fort
- ✅ Rétention utilisateur améliorée
- ✅ Modèle économique Premium
- ✅ Différenciation concurrentielle 