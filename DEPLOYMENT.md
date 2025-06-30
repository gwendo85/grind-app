# 🚀 Guide de Déploiement - GRIND

## 📋 Prérequis

- ✅ Code source sur GitHub
- ✅ Build local réussi (`pnpm build`)
- ✅ Tests fonctionnels validés
- ✅ Compte Vercel créé

---

## 🔧 Configuration Vercel

### 1️⃣ Connexion du Repository

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer le repository GitHub de GRIND
4. Sélectionner le framework : **Next.js**
5. Cliquer sur "Deploy"

### 2️⃣ Configuration du Projet

#### Variables d'Environnement
Dans les paramètres du projet Vercel, ajouter :

```bash
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
```

**Où trouver ces valeurs :**
1. Aller sur [supabase.com](https://supabase.com)
2. Sélectionner votre projet GRIND
3. Aller dans Settings → API
4. Copier :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Configuration Build
- **Framework Preset** : Next.js
- **Build Command** : `pnpm build`
- **Output Directory** : `.next`
- **Install Command** : `pnpm install`

### 3️⃣ Déploiement

1. Cliquer sur "Deploy"
2. Attendre la fin du build (2-3 minutes)
3. Vérifier que le déploiement est réussi (statut vert)

---

## 🧪 Tests Post-Déploiement

### Tests Fonctionnels
- [ ] **Authentification** : Créer un compte, se connecter, se déconnecter
- [ ] **Séances** : Ajouter des séances, vérifier l'affichage
- [ ] **Badges** : Vérifier le déblocage automatique des badges
- [ ] **Streaks** : Tester le calcul des séries consécutives
- [ ] **Navigation** : Tester tous les liens et la navigation

### Tests Techniques
- [ ] **Performance** : Vérifier les temps de chargement
- [ ] **Responsive** : Tester sur mobile, tablette, desktop
- [ ] **Sécurité** : Vérifier l'isolation des données utilisateur
- [ ] **Console** : Vérifier qu'il n'y a pas d'erreurs JavaScript

### Tests Supabase
- [ ] **Connexion** : Vérifier que l'app se connecte bien à Supabase
- [ ] **Données** : Vérifier que les séances s'enregistrent
- [ ] **XP** : Vérifier que les XP s'incrémentent
- [ ] **Isolation** : Vérifier que les données sont isolées par utilisateur

---

## 🔧 Configuration Avancée

### Domaine Personnalisé (Optionnel)
1. Aller dans Settings → Domains
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions Vercel

### Variables d'Environnement par Environnement
- **Production** : Variables de production Supabase
- **Preview** : Variables de staging (optionnel)
- **Development** : Variables locales

### Monitoring
- **Vercel Analytics** : Activer pour suivre les performances
- **Error Tracking** : Configurer Sentry si nécessaire

---

## 🚨 Dépannage

### Erreurs de Build
```bash
# Erreur : Variables d'environnement manquantes
# Solution : Vérifier que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies

# Erreur : Build échoue
# Solution : Vérifier que pnpm build fonctionne en local
```

### Erreurs de Runtime
```bash
# Erreur : Connexion Supabase échoue
# Solution : Vérifier les variables d'environnement et les permissions Supabase

# Erreur : Pages 404
# Solution : Vérifier la configuration des routes Next.js
```

### Problèmes de Performance
- Vérifier les images optimisées
- Vérifier le lazy loading des composants
- Vérifier la compression des assets

---

## 📊 Monitoring Post-Déploiement

### Métriques à Surveiller
- **Temps de chargement** : < 3 secondes
- **Taux d'erreur** : < 1%
- **Disponibilité** : > 99.9%
- **Utilisateurs actifs** : Croissance régulière

### Outils Recommandés
- **Vercel Analytics** : Performance et utilisateurs
- **Supabase Dashboard** : Base de données et API
- **Google Analytics** : Comportement utilisateur (optionnel)

---

## 🔄 Mises à Jour

### Déploiement Automatique
- Les push sur la branche `main` déclenchent automatiquement un déploiement
- Les pull requests créent des previews automatiques

### Déploiement Manuel
```bash
# Via Vercel CLI
vercel --prod

# Via GitHub Actions (optionnel)
# Configurer un workflow pour déployer automatiquement
```

---

## 📞 Support

### En Cas de Problème
1. Vérifier les logs Vercel dans le dashboard
2. Vérifier les logs Supabase dans le dashboard
3. Tester en local pour reproduire le problème
4. Consulter la documentation Vercel et Supabase

### Ressources Utiles
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)

---

## ✅ Checklist Finale

- [ ] Repository GitHub connecté à Vercel
- [ ] Variables d'environnement configurées
- [ ] Déploiement réussi
- [ ] Tests fonctionnels validés
- [ ] Performance acceptable
- [ ] Responsive design vérifié
- [ ] Sécurité validée
- [ ] Monitoring configuré

**🎉 Félicitations ! GRIND est maintenant en production !** 