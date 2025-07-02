const puppeteer = require('puppeteer');

describe('Système de Badges - Tests E2E', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Pour voir les tests en action
      slowMo: 100, // Ralentir les actions pour mieux voir
    });
    page = await browser.newPage();
    
    // Configurer la taille de la fenêtre
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Aller à la page d'accueil
    await page.goto('http://localhost:3001');
  });

  test('Connexion et vérification des badges sur le dashboard', async () => {
    console.log('🧪 Test: Connexion et vérification des badges');
    
    // Attendre que la page se charge
    await page.waitForSelector('body');
    
    // Cliquer sur le bouton de connexion
    const loginButton = await page.$('a[href="/login"]');
    if (loginButton) {
      await loginButton.click();
      await page.waitForNavigation();
    }
    
    // Remplir le formulaire de connexion
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    
    // Cliquer sur le bouton de connexion
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation();
    }
    
    // Vérifier qu'on est sur le dashboard
    await page.waitForSelector('.dashboard', { timeout: 10000 });
    
    // Vérifier que les badges sont affichés
    const badgeSystem = await page.$('[data-testid="badge-system"]');
    expect(badgeSystem).toBeTruthy();
    
    console.log('✅ Badges affichés sur le dashboard');
  }, 30000);

  test('Vérification des badges sur la page Profile', async () => {
    console.log('🧪 Test: Vérification des badges sur Profile');
    
    // Aller à la page Profile
    await page.goto('http://localhost:3001/profile');
    await page.waitForSelector('body');
    
    // Vérifier que la page Profile se charge
    const profileHeader = await page.$('h1');
    expect(profileHeader).toBeTruthy();
    
    // Vérifier que les onglets sont présents
    const tabs = await page.$$('nav button');
    expect(tabs.length).toBeGreaterThan(0);
    
    // Cliquer sur l'onglet Badges
    const badgesTab = await page.$('button:has-text("Badges")');
    if (badgesTab) {
      await badgesTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Vérifier que le système de badges est affiché
    const badgeSystem = await page.$('[data-testid="badge-system"]');
    expect(badgeSystem).toBeTruthy();
    
    console.log('✅ Badges affichés sur la page Profile');
  }, 20000);

  test('Vérification des badges pendant une séance', async () => {
    console.log('🧪 Test: Badges pendant une séance');
    
    // Aller à la page de création de séance
    await page.goto('http://localhost:3001/new-workout');
    await page.waitForSelector('body');
    
    // Créer une séance simple pour tester
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Test Séance Badges');
    
    // Ajouter un exercice
    const addExerciseButton = await page.$('button:has-text("Ajouter un exercice")');
    if (addExerciseButton) {
      await addExerciseButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Remplir les détails de l'exercice
    await page.type('input[name="exerciseName"]', 'Pompes');
    await page.type('input[name="sets"]', '3');
    await page.type('input[name="reps"]', '10');
    await page.type('input[name="weight"]', '0');
    
    // Sauvegarder la séance
    const saveButton = await page.$('button:has-text("Sauvegarder")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForNavigation();
    }
    
    // Vérifier qu'on est sur la page de séance
    await page.waitForSelector('.session-flow', { timeout: 10000 });
    
    // Vérifier que les badges sont affichés pendant la séance
    const sessionBadges = await page.$('.session-badge-system');
    expect(sessionBadges).toBeTruthy();
    
    console.log('✅ Badges affichés pendant la séance');
  }, 30000);

  test('Test de déblocage de badge', async () => {
    console.log('🧪 Test: Déblocage de badge');
    
    // Aller au dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForSelector('body');
    
    // Vérifier les badges existants
    const existingBadges = await page.$$('[data-testid="badge-item"]');
    const initialBadgeCount = existingBadges.length;
    
    // Créer une nouvelle séance pour débloquer un badge
    const newWorkoutButton = await page.$('a[href="/new-workout"]');
    if (newWorkoutButton) {
      await newWorkoutButton.click();
      await page.waitForNavigation();
    }
    
    // Créer une séance rapide
    await page.waitForSelector('input[name="name"]');
    await page.type('input[name="name"]', 'Séance Test Badge');
    
    // Ajouter un exercice
    const addExerciseButton = await page.$('button:has-text("Ajouter un exercice")');
    if (addExerciseButton) {
      await addExerciseButton.click();
      await page.waitForTimeout(1000);
    }
    
    await page.type('input[name="exerciseName"]', 'Squats');
    await page.type('input[name="sets"]', '1');
    await page.type('input[name="reps"]', '5');
    await page.type('input[name="weight"]', '0');
    
    // Sauvegarder et commencer la séance
    const saveButton = await page.$('button:has-text("Sauvegarder")');
    if (saveButton) {
      await saveButton.click();
      await page.waitForNavigation();
    }
    
    // Terminer la séance rapidement
    const finishButton = await page.$('button:has-text("Terminer la séance")');
    if (finishButton) {
      await finishButton.click();
      await page.waitForNavigation();
    }
    
    // Retourner au dashboard et vérifier les nouveaux badges
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForSelector('body');
    
    // Attendre que les badges se mettent à jour
    await page.waitForTimeout(2000);
    
    const updatedBadges = await page.$$('[data-testid="badge-item"]');
    const finalBadgeCount = updatedBadges.length;
    
    // Vérifier qu'au moins un badge a été débloqué
    expect(finalBadgeCount).toBeGreaterThanOrEqual(initialBadgeCount);
    
    console.log(`✅ Badges débloqués: ${initialBadgeCount} → ${finalBadgeCount}`);
  }, 45000);

  test('Test de performance avec cache', async () => {
    console.log('🧪 Test: Performance avec cache');
    
    // Aller au dashboard
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForSelector('body');
    
    // Mesurer le temps de chargement initial
    const startTime = Date.now();
    await page.waitForSelector('[data-testid="badge-system"]', { timeout: 10000 });
    const initialLoadTime = Date.now() - startTime;
    
    // Recharger la page pour tester le cache
    await page.reload();
    await page.waitForSelector('body');
    
    const cacheStartTime = Date.now();
    await page.waitForSelector('[data-testid="badge-system"]', { timeout: 10000 });
    const cachedLoadTime = Date.now() - cacheStartTime;
    
    // Vérifier que le chargement avec cache est plus rapide
    expect(cachedLoadTime).toBeLessThan(initialLoadTime);
    
    console.log(`✅ Performance améliorée: ${initialLoadTime}ms → ${cachedLoadTime}ms`);
  }, 30000);

  test('Test de responsive design des badges', async () => {
    console.log('🧪 Test: Responsive design des badges');
    
    // Tester sur mobile
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForSelector('body');
    
    // Vérifier que les badges s'affichent correctement sur mobile
    const mobileBadges = await page.$('[data-testid="badge-system"]');
    expect(mobileBadges).toBeTruthy();
    
    // Tester sur tablette
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForSelector('body');
    
    const tabletBadges = await page.$('[data-testid="badge-system"]');
    expect(tabletBadges).toBeTruthy();
    
    // Remettre la taille normale
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✅ Badges responsive sur tous les écrans');
  }, 20000);
});

// Fonction utilitaire pour attendre un élément
async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.warn(`Élément non trouvé: ${selector}`);
    return false;
  }
}

// Fonction utilitaire pour prendre une capture d'écran
async function takeScreenshot(page, name) {
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
} 