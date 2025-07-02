// Script de test pour vérifier la revalidation via l'interface utilisateur
const puppeteer = require('puppeteer');

async function testUIRevalidation() {
  console.log('🧪 Test de revalidation via l\'interface utilisateur');
  console.log('==================================================\n');

  let browser;
  try {
    // 1. Lancer le navigateur
    console.log('1️⃣ Lancement du navigateur...');
    browser = await puppeteer.launch({ 
      headless: false, // Pour voir ce qui se passe
      slowMo: 1000 // Ralentir pour voir les actions
    });
    const page = await browser.newPage();

    // 2. Aller sur la page de connexion
    console.log('2️⃣ Navigation vers la page de connexion...');
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('input[type="email"]');

    // 3. Se connecter (utiliser un compte existant)
    console.log('3️⃣ Connexion...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // 4. Attendre la redirection vers le dashboard
    console.log('4️⃣ Attente de la redirection...');
    await page.waitForNavigation();
    await page.waitForSelector('.bg-gradient-to-r.from-blue-600.to-purple-600', { timeout: 10000 });

    // 5. Récupérer les stats initiales
    console.log('5️⃣ Récupération des stats initiales...');
    const initialXP = await page.$eval('.text-on-gradient', el => {
      const text = el.textContent;
      const match = text.match(/(\d+) XP total/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`📊 XP initial: ${initialXP}`);

    // 6. Remplir le formulaire d'ajout de séance
    console.log('6️⃣ Ajout d\'une séance de test...');
    await page.waitForSelector('input[name="name"]');
    
    // Nom de la séance
    await page.type('input[name="name"]', 'Test Revalidation UI');
    
    // Premier exercice
    await page.type('input[placeholder*="exercice"]', 'Pompes');
    await page.type('input[placeholder*="poids"]', '0');
    await page.type('input[placeholder*="répétitions"]', '10');
    await page.type('input[placeholder*="séries"]', '3');
    
    // Date (aujourd'hui)
    const today = new Date().toISOString().split('T')[0];
    await page.evaluate((date) => {
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput) {
        dateInput.value = date;
        dateInput.dispatchEvent(new Event('change'));
      }
    }, today);

    // 7. Soumettre le formulaire
    console.log('7️⃣ Soumission du formulaire...');
    await page.click('button[type="submit"]');

    // 8. Attendre la notification de succès
    console.log('8️⃣ Attente de la confirmation...');
    await page.waitForSelector('.bg-green-500', { timeout: 10000 });

    // 9. Attendre un peu pour la revalidation
    console.log('9️⃣ Attente de la revalidation...');
    await page.waitForTimeout(3000);

    // 10. Vérifier les nouvelles stats
    console.log('🔟 Vérification des nouvelles stats...');
    const finalXP = await page.$eval('.text-on-gradient', el => {
      const text = el.textContent;
      const match = text.match(/(\d+) XP total/);
      return match ? parseInt(match[1]) : 0;
    });
    console.log(`📊 XP final: ${finalXP}`);

    // 11. Comparaison
    console.log('\n📈 Résultats:');
    const xpDiff = finalXP - initialXP;
    console.log(`Différence XP: ${xpDiff} (attendu: 100)`);
    
    if (xpDiff >= 100) {
      console.log('✅ Revalidation automatique: SUCCÈS !');
    } else {
      console.log('❌ Revalidation automatique: ÉCHEC');
    }

    // 12. Vérifier que la séance apparaît dans la liste
    console.log('\n📋 Vérification de la liste des séances...');
    const workoutInList = await page.$eval('body', el => {
      return el.textContent.includes('Test Revalidation UI');
    });
    
    if (workoutInList) {
      console.log('✅ Séance visible dans la liste: SUCCÈS !');
    } else {
      console.log('❌ Séance non visible dans la liste: ÉCHEC');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    if (browser) {
      console.log('\n🔚 Fermeture du navigateur...');
      await browser.close();
    }
  }
}

// Vérifier si puppeteer est installé
try {
  require('puppeteer');
  testUIRevalidation().then(() => {
    console.log('\n🎉 Test terminé !');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
} catch (error) {
  console.log('📦 Installation de puppeteer...');
  require('child_process').execSync('npm install puppeteer', { stdio: 'inherit' });
  console.log('✅ Puppeteer installé, relancez le test');
} 