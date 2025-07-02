# 🧪 Guide de Test - Phase 1 : Tables SQL et API Routes

## 📋 Vue d'ensemble

Ce guide vous aide à tester les fonctionnalités sociales implémentées dans la **Phase 1** :
- ✅ Tables SQL créées
- ✅ API Routes implémentées
- ✅ Système d'amis
- ✅ Feed d'activité
- ✅ Challenges communautaires
- ✅ Notifications

## 🚀 Étape 1 : Application du schéma SQL

### Option A : Script automatique
```bash
# Installer les dépendances si nécessaire
npm install @supabase/supabase-js dotenv

# Exécuter le script d'application
node apply-social-schema.js
```

### Option B : Manuel (recommandé)
1. Ouvrir l'interface Supabase de votre projet
2. Aller dans **SQL Editor**
3. Copier le contenu de `social-database-schema.sql`
4. Exécuter le script

## 🔍 Étape 2 : Vérification des tables

Dans l'interface Supabase, vérifiez que ces tables ont été créées :

### Tables principales
- ✅ `user_friends` - Relations d'amitié
- ✅ `activity_posts` - Posts d'activité
- ✅ `activity_kudos` - Système de likes
- ✅ `activity_comments` - Commentaires
- ✅ `community_challenges` - Défis communautaires
- ✅ `challenge_participants` - Participations aux défis
- ✅ `user_notifications` - Notifications

### Vues utiles
- ✅ `user_friends_stats` - Statistiques d'amis
- ✅ `activity_posts_with_stats` - Posts avec statistiques

## 🧪 Étape 3 : Test des API Routes

### 3.1 Test du système d'amis

#### Envoyer une demande d'ami
```bash
curl -X POST http://localhost:3000/api/social/friends \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "friend_id": "uuid-de-l-ami"
  }'
```

#### Récupérer les amis
```bash
# Amis acceptés
curl "http://localhost:3000/api/social/friends" \
  -H "Cookie: votre-cookie-session"

# Demandes reçues
curl "http://localhost:3000/api/social/friends?status=pending" \
  -H "Cookie: votre-cookie-session"

# Demandes envoyées
curl "http://localhost:3000/api/social/friends?status=sent" \
  -H "Cookie: votre-cookie-session"
```

#### Répondre à une demande d'ami
```bash
# Accepter
curl -X POST http://localhost:3000/api/social/friends/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "friendship_id": "uuid-de-la-demande",
    "action": "accept"
  }'

# Refuser
curl -X POST http://localhost:3000/api/social/friends/respond \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "friendship_id": "uuid-de-la-demande",
    "action": "decline"
  }'
```

### 3.2 Test du feed d'activité

#### Créer un post d'activité
```bash
curl -X POST http://localhost:3000/api/social/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "workout_id": "uuid-du-workout",
    "message": "Séance incroyable aujourd'hui ! 💪",
    "is_public": true
  }'
```

#### Récupérer les posts
```bash
# Posts avec pagination
curl "http://localhost:3000/api/social/posts?page=1&limit=10" \
  -H "Cookie: votre-cookie-session"
```

#### Donner un kudos
```bash
curl -X POST http://localhost:3000/api/social/kudos \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "post_id": "uuid-du-post"
  }'
```

#### Supprimer un kudos
```bash
curl -X DELETE "http://localhost:3000/api/social/kudos?post_id=uuid-du-post" \
  -H "Cookie: votre-cookie-session"
```

### 3.3 Test des challenges

#### Récupérer les challenges
```bash
# Tous les challenges actifs
curl "http://localhost:3000/api/social/challenges" \
  -H "Cookie: votre-cookie-session"

# Challenges mis en avant
curl "http://localhost:3000/api/social/challenges?featured=true" \
  -H "Cookie: votre-cookie-session"
```

#### Créer un challenge
```bash
curl -X POST http://localhost:3000/api/social/challenges \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "title": "Défi 7 jours",
    "description": "7 séances en 7 jours",
    "challenge_type": "workouts",
    "target_value": 7,
    "duration_days": 7,
    "is_featured": false
  }'
```

#### Rejoindre un challenge
```bash
curl -X POST http://localhost:3000/api/social/challenges/join \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "challenge_id": "uuid-du-challenge"
  }'
```

### 3.4 Test des notifications

#### Récupérer les notifications
```bash
# Toutes les notifications
curl "http://localhost:3000/api/social/notifications" \
  -H "Cookie: votre-cookie-session"

# Notifications non lues
curl "http://localhost:3000/api/social/notifications?unread=true" \
  -H "Cookie: votre-cookie-session"
```

#### Marquer comme lues
```bash
# Notifications spécifiques
curl -X PATCH http://localhost:3000/api/social/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "notification_ids": ["uuid1", "uuid2"]
  }'

# Toutes les notifications
curl -X PATCH http://localhost:3000/api/social/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: votre-cookie-session" \
  -d '{
    "mark_all": true
  }'
```

## 🎯 Étape 4 : Tests avec l'interface utilisateur

### 4.1 Test de la page sociale
1. Aller sur `http://localhost:3000/social`
2. Vérifier que la page se charge sans erreur
3. Tester la navigation entre les onglets

### 4.2 Test des fonctionnalités
1. **Feed d'activité** : Vérifier l'affichage des posts
2. **Système d'amis** : Tester l'ajout d'amis
3. **Challenges** : Vérifier l'affichage des défis
4. **Notifications** : Tester les interactions

## 🔧 Étape 5 : Dépannage

### Problèmes courants

#### Erreur 401 - Non autorisé
- Vérifier que l'utilisateur est connecté
- Vérifier les cookies de session

#### Erreur 500 - Erreur serveur
- Vérifier les logs du serveur Next.js
- Vérifier la connexion à Supabase
- Vérifier les politiques RLS

#### Tables manquantes
- Réexécuter le script SQL
- Vérifier les permissions dans Supabase

### Logs utiles
```bash
# Logs du serveur Next.js
npm run dev

# Logs Supabase (dans l'interface)
# Database > Logs
```

## ✅ Checklist de validation

- [ ] Tables SQL créées dans Supabase
- [ ] API routes répondent correctement
- [ ] Système d'amis fonctionne
- [ ] Feed d'activité fonctionne
- [ ] Challenges fonctionnent
- [ ] Notifications fonctionnent
- [ ] Page `/social` se charge
- [ ] Pas d'erreurs dans la console
- [ ] Politiques RLS configurées

## 🚀 Prochaines étapes

Une fois la **Phase 1** validée, vous pouvez passer à la **Phase 2** :
- Composants React pour l'interface utilisateur
- Intégration avec les API routes
- Amélioration de l'UX/UI

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifier les logs d'erreur
2. Consulter la documentation Supabase
3. Vérifier les variables d'environnement
4. Tester avec des données de démonstration 