// Script de test pour vérifier la configuration Supabase
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🔍 Test de configuration Supabase...');

// Test 1: Vérifier que Supabase est accessible
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('workouts').select('count').limit(1);
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error);
      return false;
    }
    console.log('✅ Connexion Supabase OK');
    return true;
  } catch (err) {
    console.error('❌ Erreur de connexion:', err);
    return false;
  }
}

// Test 2: Vérifier l'authentification
async function testAuthentication() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Erreur d\'authentification:', error);
      return null;
    }
    if (!user) {
      console.log('⚠️ Aucun utilisateur connecté');
      return null;
    }
    console.log('✅ Utilisateur connecté:', user.id);
    return user;
  } catch (err) {
    console.error('❌ Erreur d\'authentification:', err);
    return null;
  }
}

// Test 3: Vérifier les permissions RLS
async function testRLSPermissions(user) {
  if (!user) {
    console.log('⚠️ Impossible de tester RLS sans utilisateur connecté');
    return false;
  }

  try {
    // Test d'insertion
    const testData = {
      user_id: user.id,
      exercise: 'Test Exercise',
      weight: 50,
      reps: 10,
      notes: 'Test note'
    };

    console.log('📝 Test d\'insertion avec données:', testData);

    const { data, error } = await supabase
      .from('workouts')
      .insert(testData)
      .select();

    if (error) {
      console.error('❌ Erreur d\'insertion:', error);
      console.error('Code d\'erreur:', error.code);
      console.error('Message d\'erreur:', error.message);
      console.error('Détails:', error.details);
      return false;
    }

    console.log('✅ Insertion réussie:', data);

    // Nettoyer le test
    if (data && data[0]) {
      await supabase.from('workouts').delete().eq('id', data[0].id);
      console.log('🧹 Données de test supprimées');
    }

    return true;
  } catch (err) {
    console.error('❌ Erreur lors du test RLS:', err);
    return false;
  }
}

// Test 4: Vérifier la structure de la table
async function testTableStructure() {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .limit(0);

    if (error) {
      console.error('❌ Erreur de structure de table:', error);
      return false;
    }

    console.log('✅ Structure de table workouts OK');
    return true;
  } catch (err) {
    console.error('❌ Erreur de structure:', err);
    return false;
  }
}

// Test 5: Vérifier les variables d'environnement
function testEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('🔧 Variables d\'environnement:');
  console.log('- URL:', url ? '✅ Définie' : '❌ Manquante');
  console.log('- ANON_KEY:', key ? '✅ Définie' : '❌ Manquante');

  return url && key;
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests...\n');

  // Test 1: Variables d'environnement
  console.log('1️⃣ Test des variables d\'environnement');
  const envOK = testEnvironmentVariables();
  console.log('');

  // Test 2: Connexion Supabase
  console.log('2️⃣ Test de connexion Supabase');
  const connectionOK = await testSupabaseConnection();
  console.log('');

  // Test 3: Structure de table
  console.log('3️⃣ Test de structure de table');
  const structureOK = await testTableStructure();
  console.log('');

  // Test 4: Authentification
  console.log('4️⃣ Test d\'authentification');
  const user = await testAuthentication();
  console.log('');

  // Test 5: Permissions RLS
  console.log('5️⃣ Test des permissions RLS');
  const rlsOK = await testRLSPermissions(user);
  console.log('');

  // Résumé
  console.log('📊 Résumé des tests:');
  console.log(`- Variables d'environnement: ${envOK ? '✅' : '❌'}`);
  console.log(`- Connexion Supabase: ${connectionOK ? '✅' : '❌'}`);
  console.log(`- Structure de table: ${structureOK ? '✅' : '❌'}`);
  console.log(`- Authentification: ${user ? '✅' : '❌'}`);
  console.log(`- Permissions RLS: ${rlsOK ? '✅' : '❌'}`);

  if (envOK && connectionOK && structureOK && user && rlsOK) {
    console.log('\n🎉 Tous les tests sont passés ! La configuration est correcte.');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
  }
}

// Exporter pour utilisation dans la console
window.testSupabase = {
  runAllTests,
  testSupabaseConnection,
  testAuthentication,
  testRLSPermissions,
  testTableStructure,
  testEnvironmentVariables
};

console.log('📋 Script de test chargé. Utilisez:');
console.log('- testSupabase.runAllTests() pour tous les tests');
console.log('- testSupabase.testAuthentication() pour tester l\'auth');
console.log('- testSupabase.testRLSPermissions(user) pour tester RLS'); 