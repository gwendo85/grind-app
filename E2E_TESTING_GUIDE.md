# Guide des Tests End-to-End - Système de Badges

## 🎯 Vue d'ensemble

Ce guide décrit comment exécuter et maintenir les tests end-to-end pour le système de badges de l'application Grind.

## 📋 Prérequis

### 1. Installation des dépendances

```bash
# Installer les nouvelles dépendances
npm install

# Ou avec pnpm
pnpm install
```

### 2. Configuration de l'environnement

Assurez-vous que les variables d'environnement sont configurées :

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

### 3. Base de données de test

Créez un utilisateur de test dans Supabase :

```sql
-- Insérer un utilisateur de test
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'test-user-id',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);

-- Créer le profil correspondant
INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
VALUES (
  'test-user-id',
  'Test',
  'User',
  NOW(),
  NOW()
);
```

## 🚀 Exécution des tests

### 1. Démarrer l'application

```bash
# Terminal 1 - Démarrer l'application
npm run dev
```

### 2. Exécuter les tests E2E

```bash
# Terminal 2 - Tests en mode headless (recommandé)
npm run test:e2e

# Tests en mode debug (voir le navigateur)
npm run test:e2e:debug

# Tests en mode watch (redémarrage automatique)
npm run test:e2e:watch

# Tests avec rapport détaillé
npm run test:e2e:report
```

## 📊 Types de tests

### 1. Tests de Connexion et Dashboard
- **Objectif** : Vérifier que les badges s'affichent correctement après connexion
- **Scénario** : Connexion → Dashboard → Vérification des badges
- **Durée** : ~30 secondes

### 2. Tests de la Page Profile
- **Objectif** : Vérifier l'affichage des badges sur la page Profile
- **Scénario** : Navigation → Profile → Onglet Badges
- **Durée** : ~20 secondes

### 3. Tests Pendant les Séances
- **Objectif** : Vérifier l'affichage des badges pendant une séance
- **Scénario** : Création séance → Démarrage → Vérification badges
- **Durée** : ~30 secondes

### 4. Tests de Déblocage de Badges
- **Objectif** : Vérifier le déblocage automatique des badges
- **Scénario** : Création séance → Terminaison → Vérification nouveaux badges
- **Durée** : ~45 secondes

### 5. Tests de Performance
- **Objectif** : Vérifier l'amélioration des performances avec le cache
- **Scénario** : Chargement initial vs chargement avec cache
- **Durée** : ~30 secondes

### 6. Tests Responsive
- **Objectif** : Vérifier l'affichage sur différents écrans
- **Scénario** : Mobile → Tablette → Desktop
- **Durée** : ~20 secondes

## 🔧 Configuration

### Variables d'environnement pour les tests

```bash
# .env.test
TEST_BASE_URL=http://localhost:3001
HEADLESS=true
TEST_TIMEOUT=30000
```

### Configuration Jest

Le fichier `jest.e2e.config.js` configure :
- **Timeout** : 60 secondes par test
- **Workers** : 1 seul worker pour éviter les conflits
- **Reports** : Génération de rapports HTML
- **Screenshots** : Capture automatique en cas d'échec

## 📸 Captures d'écran

Les tests prennent automatiquement des captures d'écran :
- **Emplacement** : `tests/screenshots/`
- **Format** : `{test-name}-{timestamp}.png`
- **Déclenchement** : En cas d'échec ou manuellement

## 🐛 Débogage

### 1. Mode Debug

```bash
# Lancer les tests en mode visible
npm run test:e2e:debug
```

### 2. Logs détaillés

Les tests affichent des logs détaillés :
- ✅ Succès
- ❌ Échecs
- 📸 Captures d'écran
- ⏱️ Temps d'exécution

### 3. Points d'arrêt

Ajoutez des points d'arrêt dans les tests :

```javascript
// Pause pour inspection
await page.waitForTimeout(5000);

// Capture d'écran manuelle
await testUtils.takeScreenshot(page, 'debug-point');
```

## 📈 Métriques de Performance

Les tests mesurent automatiquement :
- **Temps de chargement initial**
- **Temps de chargement avec cache**
- **Taux de hit du cache**
- **Temps de réponse moyen**

## 🔄 Maintenance

### 1. Mise à jour des sélecteurs

Si l'interface change, mettez à jour les sélecteurs dans :
- `tests/e2e/badge-system.test.js`
- `tests/e2e/setup.js`

### 2. Ajout de nouveaux tests

Pour ajouter un nouveau test :

```javascript
test('Nouveau test', async () => {
  console.log('🧪 Description du test');
  
  // Actions du test
  await page.goto('/nouvelle-page');
  
  // Assertions
  expect(element).toBeTruthy();
  
  console.log('✅ Test réussi');
}, 30000);
```

### 3. Mise à jour des données de test

Si les données de test changent :
1. Mettre à jour les identifiants dans `setup.js`
2. Recréer l'utilisateur de test dans Supabase
3. Vérifier les permissions

## 🚨 Dépannage

### Problèmes courants

#### 1. Tests qui échouent sur la connexion
```bash
# Vérifier que l'utilisateur de test existe
# Vérifier les variables d'environnement
# Vérifier que l'application est démarrée
```

#### 2. Timeout des tests
```bash
# Augmenter le timeout dans jest.e2e.config.js
# Vérifier la performance de l'application
# Réduire le nombre d'actions par test
```

#### 3. Éléments non trouvés
```bash
# Vérifier que les data-testid sont présents
# Mettre à jour les sélecteurs CSS
# Vérifier que l'interface n'a pas changé
```

### Logs utiles

```bash
# Logs détaillés
DEBUG=puppeteer:* npm run test:e2e

# Logs de l'application
npm run dev 2>&1 | tee app.log
```

## 📋 Checklist de déploiement

Avant de déployer, vérifiez que :

- [ ] Tous les tests E2E passent
- [ ] Les captures d'écran sont à jour
- [ ] Les métriques de performance sont acceptables
- [ ] Les tests couvrent les fonctionnalités critiques
- [ ] La documentation est mise à jour

## 🎯 Prochaines étapes

### Améliorations possibles

1. **Tests de charge** : Simuler plusieurs utilisateurs
2. **Tests de régression visuelle** : Comparer les captures d'écran
3. **Tests d'accessibilité** : Vérifier l'accessibilité
4. **Tests de sécurité** : Vérifier les vulnérabilités
5. **Tests de compatibilité** : Tester sur différents navigateurs

### Intégration CI/CD

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
```

---

**Note** : Ce guide doit être mis à jour à chaque modification du système de badges ou de l'interface utilisateur. 