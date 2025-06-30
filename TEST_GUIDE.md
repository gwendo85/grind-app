# 🧪 Guide de Test Complet - GRIND

## 📋 Checklist de Test Avant Déploiement

### 1️⃣ **Tests d'Authentification**

#### Création de comptes tests
- [ ] Aller sur `http://localhost:3000/signup`
- [ ] Créer un compte avec email valide (ex: `test1@grind.com`)
- [ ] Vérifier la confirmation d'inscription
- [ ] Créer un second compte (ex: `test2@grind.com`)

#### Connexion/Déconnexion
- [ ] Se connecter avec le premier compte
- [ ] Vérifier la redirection vers `/dashboard`
- [ ] Tester la déconnexion depuis la navigation
- [ ] Vérifier la redirection vers la page d'accueil
- [ ] Se reconnecter avec le second compte

#### Sécurité
- [ ] Essayer d'accéder à `/dashboard` sans être connecté → redirection vers `/login`
- [ ] Vérifier que les données sont isolées entre les comptes

---

### 2️⃣ **Tests des Séances d'Entraînement**

#### Ajout de séances
- [ ] Ajouter une séance simple (ex: "Squats", 80kg, 10 reps, 3 sets)
- [ ] Ajouter une séance sans poids (ex: "Pompes", 20 reps, 4 sets)
- [ ] Ajouter une séance avec notes (ex: "Deadlift", 100kg, 5 reps, 3 sets, "Très dur aujourd'hui")
- [ ] Vérifier l'affichage dans la liste des séances récentes

#### Simulation de streaks
- [ ] Ajouter des séances sur plusieurs jours consécutifs :
  - Aujourd'hui : "Squats"
  - Hier : "Pompes" 
  - Avant-hier : "Développé couché"
  - Il y a 3 jours : "Tractions"
  - Il y a 4 jours : "Deadlift"
- [ ] Vérifier que le streak s'affiche correctement
- [ ] Simuler une coupure (pas de séance pendant 2 jours)
- [ ] Vérifier que le streak se réinitialise

---

### 3️⃣ **Tests du Système de Badges**

#### Vérification des badges XP
- [ ] Vérifier le badge "Premier Pas" (100 XP) après la première séance
- [ ] Ajouter des séances pour atteindre 500 XP → badge "Motivé"
- [ ] Continuer jusqu'à 1000 XP → badge "Déterminé"
- [ ] Vérifier les couleurs de rareté (gris, bleu, violet, jaune)

#### Vérification des badges Séances
- [ ] Vérifier le badge "Débutant" après la première séance
- [ ] Ajouter des séances pour atteindre 10 séances → badge "Régulier"
- [ ] Continuer jusqu'à 25 séances → badge "Consistant"

#### Vérification des badges Streak
- [ ] Vérifier le badge "En Forme" après 3 jours consécutifs
- [ ] Continuer jusqu'à 7 jours → badge "Semaine Parfaite"
- [ ] Vérifier le badge "Record Personnel" pour le streak le plus long

#### Interface des badges
- [ ] Aller sur la page `/badges`
- [ ] Vérifier l'affichage des badges débloqués
- [ ] Vérifier l'affichage des badges verrouillés (mystérieux)
- [ ] Vérifier les statistiques (progression globale, nombre de légendaires)

---

### 4️⃣ **Tests de Navigation et UX**

#### Navigation
- [ ] Tester le lien Dashboard dans la navigation
- [ ] Tester le lien Badges dans la navigation
- [ ] Vérifier l'indication de la page active
- [ ] Tester le bouton de déconnexion

#### Responsive Design
- [ ] Tester sur desktop (1920x1080)
- [ ] Tester sur tablette (768x1024)
- [ ] Tester sur mobile (375x667)
- [ ] Vérifier que tous les éléments sont lisibles
- [ ] Vérifier que les boutons sont cliquables
- [ ] Tester l'orientation portrait et paysage sur mobile

#### Accessibilité
- [ ] Vérifier les contrastes de couleurs
- [ ] Tester la navigation au clavier (Tab, Enter, Escape)
- [ ] Vérifier les labels des formulaires
- [ ] Tester avec un lecteur d'écran (si disponible)

---

### 5️⃣ **Tests des Missions et XP**

#### Missions hebdomadaires
- [ ] Vérifier l'affichage des missions de la semaine
- [ ] Compléter une mission (ex: "Faire 3 séances cette semaine")
- [ ] Vérifier la progression des missions
- [ ] Vérifier les récompenses XP

#### Système XP
- [ ] Vérifier +100 XP par séance ajoutée
- [ ] Vérifier l'affichage du niveau actuel
- [ ] Vérifier la barre de progression XP
- [ ] Vérifier le calcul du niveau suivant

---

### 6️⃣ **Tests de Performance**

#### Rapidité
- [ ] Mesurer le temps de chargement de la page d'accueil
- [ ] Mesurer le temps de chargement du dashboard
- [ ] Mesurer le temps de chargement de la page badges
- [ ] Vérifier que les animations sont fluides

#### Données
- [ ] Vérifier que les séances se sauvegardent correctement
- [ ] Vérifier que les XP s'incrémentent correctement
- [ ] Vérifier que les streaks se calculent correctement
- [ ] Vérifier la persistance des données après rechargement

---

### 7️⃣ **Vérification Supabase Studio**

#### Table `workouts`
- [ ] Vérifier que les séances apparaissent avec le bon user_id
- [ ] Vérifier que les dates sont correctes
- [ ] Vérifier que tous les champs sont remplis correctement

#### Table `xp_logs`
- [ ] Vérifier que les XP sont bien enregistrés
- [ ] Vérifier que le user_id correspond
- [ ] Vérifier que les montants sont corrects (100 XP par séance)

#### Table `badges` (si applicable)
- [ ] Vérifier que les badges débloqués sont enregistrés
- [ ] Vérifier les champs : user_id, badge_name, rarity, unlocked_at

---

### 8️⃣ **Tests de Build et Production**

#### Build local
```bash
pnpm build
```
- [ ] Vérifier qu'il n'y a aucune erreur
- [ ] Vérifier que toutes les pages sont générées

#### Test du build
```bash
pnpm start
```
- [ ] Tester l'application en mode production
- [ ] Vérifier que toutes les fonctionnalités marchent
- [ ] Vérifier les performances

---

### 9️⃣ **Tests de Sécurité**

#### Variables d'environnement
- [ ] Vérifier que les clés Supabase ne sont pas exposées côté client
- [ ] Vérifier que les variables sont bien dans `.env.local`

#### Authentification
- [ ] Vérifier que les routes protégées sont bien sécurisées
- [ ] Vérifier que les données sont isolées par utilisateur

---

## 🚨 **Problèmes Courants à Vérifier**

### Erreurs JavaScript
- [ ] Ouvrir la console du navigateur (F12)
- [ ] Vérifier qu'il n'y a pas d'erreurs en rouge
- [ ] Vérifier qu'il n'y a pas de warnings bloquants

### Erreurs de réseau
- [ ] Vérifier les appels API dans l'onglet Network
- [ ] Vérifier que les requêtes vers Supabase passent
- [ ] Vérifier les codes de statut (200, 201, etc.)

### Problèmes d'affichage
- [ ] Vérifier que tous les composants s'affichent
- [ ] Vérifier que les animations ne cassent pas l'interface
- [ ] Vérifier que les couleurs sont lisibles

---

## ✅ **Validation Finale**

Une fois tous les tests passés :

- [ ] **ESLint** : 0 erreur, 0 warning
- [ ] **Build** : Succès sans erreur
- [ ] **Fonctionnalités** : Toutes les features marchent
- [ ] **Responsive** : Interface adaptée à tous les écrans
- [ ] **Performance** : Temps de chargement acceptables
- [ ] **Sécurité** : Données protégées et isolées

---

## 🚀 **Prêt pour le Déploiement**

Si tous les tests sont validés, le projet est prêt pour le déploiement sur Vercel !

**URLs de test :**
- Local : `http://localhost:3000`
- Dashboard : `http://localhost:3000/dashboard`
- Badges : `http://localhost:3000/badges`
- Login : `http://localhost:3000/login`
- Signup : `http://localhost:3000/signup` 