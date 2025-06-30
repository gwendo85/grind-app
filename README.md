# 🚀 GRIND App

Application Next.js moderne avec authentification Supabase, construite avec TypeScript et Tailwind CSS.

## ✨ Fonctionnalités

- **🔐 Authentification complète** avec Supabase
- **📱 Interface responsive** et moderne
- **⚡ Performance optimisée** avec Next.js 15 et Turbopack
- **🎨 Design system** avec Tailwind CSS
- **🔒 Sécurité** avec variables d'environnement
- **📝 TypeScript** pour un développement robuste

## 🛠️ Technologies

- **Framework** : Next.js 15.3.4 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Supabase (Auth + Database)
- **Package Manager** : pnpm
- **Linting** : ESLint

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ 
- pnpm
- Compte Supabase

### Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/gwendo85/grind.git
   cd grind/grind-app
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Puis ajoutez vos clés Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
   ```

4. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```

5. **Ouvrir votre navigateur**
   ```
   http://localhost:3001
   ```

## 📁 Structure du projet

```
grind-app/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   ├── components/          # Composants React réutilisables
│   ├── hooks/              # Hooks personnalisés
│   └── lib/                # Utilitaires et configurations
├── public/                 # Assets statiques
├── .env.local             # Variables d'environnement locales
└── package.json           # Dépendances et scripts
```

## 🔐 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez vos clés d'API dans Settings > API

### 2. Configurer l'authentification

1. Dans votre dashboard Supabase, allez dans Authentication > Settings
2. Configurez vos providers d'authentification
3. Personnalisez les emails de confirmation

### 3. Créer des tables (optionnel)

```sql
-- Exemple de table utilisateurs
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Utilisation

### Authentification

L'application inclut un système d'authentification complet :

- **Inscription** : Créer un nouveau compte
- **Connexion** : Se connecter avec email/mot de passe
- **Déconnexion** : Se déconnecter de la session

### Hooks personnalisés

```typescript
import { useAuth } from '@/hooks/useSupabase'

function MyComponent() {
  const { user, signIn, signUp, signOut } = useAuth()
  
  // Utiliser les fonctions d'authentification
}
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Ajoutez vos variables d'environnement dans Vercel
3. Déployez automatiquement

### Variables d'environnement de production

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
```

## 📝 Scripts disponibles

```bash
pnpm dev          # Serveur de développement
pnpm build        # Build de production
pnpm start        # Serveur de production
pnpm lint         # Linter le code
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Développeur

**gwendo85** - [GitHub](https://github.com/gwendo85)

---

⭐ N'oubliez pas de donner une étoile si ce projet vous a aidé !
