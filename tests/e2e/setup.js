// Configuration globale pour les tests E2E
global.TEST_CONFIG = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  slowMo: 100,
  headless: process.env.HEADLESS !== 'false',
};

// Fonctions utilitaires globales
global.testUtils = {
  // Attendre qu'un élément soit visible
  waitForElement: async (page, selector, timeout = 10000) => {
    try {
      await page.waitForSelector(selector, { 
        timeout,
        visible: true 
      });
      return true;
    } catch (error) {
      console.warn(`Élément non trouvé: ${selector}`);
      return false;
    }
  },

  // Attendre qu'un élément disparaisse
  waitForElementToDisappear: async (page, selector, timeout = 10000) => {
    try {
      await page.waitForFunction(
        (sel) => !document.querySelector(sel),
        { timeout },
        selector
      );
      return true;
    } catch (error) {
      console.warn(`Élément toujours présent: ${selector}`);
      return false;
    }
  },

  // Prendre une capture d'écran
  takeScreenshot: async (page, name) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `tests/screenshots/${name}-${timestamp}.png`;
    
    try {
      await page.screenshot({ 
        path: filename,
        fullPage: true 
      });
      console.log(`📸 Capture d'écran sauvegardée: ${filename}`);
    } catch (error) {
      console.warn(`Erreur lors de la capture d'écran: ${error.message}`);
    }
  },

  // Se connecter avec des identifiants de test
  login: async (page, email = 'test@example.com', password = 'password123') => {
    try {
      await page.goto(`${global.TEST_CONFIG.baseUrl}/login`);
      await page.waitForSelector('input[type="email"]');
      
      await page.type('input[type="email"]', email);
      await page.type('input[type="password"]', password);
      
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await page.waitForNavigation();
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Erreur lors de la connexion: ${error.message}`);
      return false;
    }
  },

  // Créer une séance de test
  createTestWorkout: async (page, name = 'Test Workout') => {
    try {
      await page.goto(`${global.TEST_CONFIG.baseUrl}/new-workout`);
      await page.waitForSelector('input[name="name"]');
      
      await page.type('input[name="name"]', name);
      
      // Ajouter un exercice
      const addExerciseButton = await page.$('button:has-text("Ajouter un exercice")');
      if (addExerciseButton) {
        await addExerciseButton.click();
        await page.waitForTimeout(1000);
      }
      
      await page.type('input[name="exerciseName"]', 'Test Exercise');
      await page.type('input[name="sets"]', '1');
      await page.type('input[name="reps"]', '5');
      await page.type('input[name="weight"]', '0');
      
      const saveButton = await page.$('button:has-text("Sauvegarder")');
      if (saveButton) {
        await saveButton.click();
        await page.waitForNavigation();
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Erreur lors de la création de séance: ${error.message}`);
      return false;
    }
  },

  // Vérifier que les badges sont affichés
  checkBadgesDisplayed: async (page) => {
    try {
      const badgeSystem = await page.$('[data-testid="badge-system"]');
      return badgeSystem !== null;
    } catch (error) {
      return false;
    }
  },

  // Attendre que les badges se chargent
  waitForBadges: async (page, timeout = 10000) => {
    try {
      await page.waitForSelector('[data-testid="badge-system"]', { timeout });
      return true;
    } catch (error) {
      console.warn('Badges non trouvés dans le délai imparti');
      return false;
    }
  },
};

// Configuration des logs
console.log('🚀 Configuration des tests E2E chargée');
console.log(`📍 URL de test: ${global.TEST_CONFIG.baseUrl}`);
console.log(`⏱️  Timeout par test: ${global.TEST_CONFIG.timeout}ms`);
console.log(`👻 Mode headless: ${global.TEST_CONFIG.headless}`);

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée:', error);
}); 