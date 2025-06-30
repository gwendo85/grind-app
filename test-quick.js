// Script de test rapide pour diagnostiquer le problème d'insertion
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🔍 Test rapide de diagnostic...');

// Test 1: Vérifier l'authentification
async function quickAuthTest() {
  console.log('1️⃣ Test d\'authentification...');
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('❌ Erreur auth:', error);
    return null;
  }
  
  if (!user) {
    console.log('⚠️ Aucun utilisateur connecté');
    return null;
  }
  
  console.log('✅ Utilisateur connecté:', user.id);
  return user;
}

// Test 2: Vérifier la structure de la table
async function quickTableTest() {
  console.log('2️⃣ Test de structure de table...');
  
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Erreur structure:', error);
      return false;
    }
    
    console.log('✅ Table workouts accessible');
    return true;
  } catch (err) {
    console.error('❌ Erreur table:', err);
    return false;
  }
}

// Test 3: Test d'insertion avec données minimales
async function quickInsertTest(user) {
  if (!user) {
    console.log('⚠️ Impossible de tester sans utilisateur');
    return false;
  }
  
  console.log('3️⃣ Test d\'insertion...');
  
  const testData = {
    user_id: user.id,
    exercise: 'Test Quick',
    weight: 50,
    reps: 10,
    notes: 'Test rapide'
  };
  
  console.log('📝 Données de test:', testData);
  
  try {
    const { data, error } = await supabase
      .from('workouts')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Détails:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Insertion réussie:', data);
    
    // Nettoyer
    if (data && data[0]) {
      await supabase.from('workouts').delete().eq('id', data[0].id);
      console.log('🧹 Test nettoyé');
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erreur générale:', err);
    return false;
  }
}

// Test 4: Vérifier les policies RLS
async function quickRLSTest(user) {
  if (!user) {
    console.log('⚠️ Impossible de tester RLS sans utilisateur');
    return false;
  }
  
  console.log('4️⃣ Test des policies RLS...');
  
  try {
    // Test de lecture
    const { data: readData, error: readError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (readError) {
      console.error('❌ Erreur lecture RLS:', readError);
      return false;
    }
    
    console.log('✅ Lecture RLS OK');
    return true;
  } catch (err) {
    console.error('❌ Erreur RLS:', err);
    return false;
  }
}

// Test complet
async function runQuickTest() {
  console.log('🚀 Démarrage du test rapide...\n');
  
  const user = await quickAuthTest();
  console.log('');
  
  const tableOK = await quickTableTest();
  console.log('');
  
  const insertOK = await quickInsertTest(user);
  console.log('');
  
  const rlsOK = await quickRLSTest(user);
  console.log('');
  
  console.log('📊 Résumé du test rapide:');
  console.log(`- Authentification: ${user ? '✅' : '❌'}`);
  console.log(`- Structure table: ${tableOK ? '✅' : '❌'}`);
  console.log(`- Insertion: ${insertOK ? '✅' : '❌'}`);
  console.log(`- RLS: ${rlsOK ? '✅' : '❌'}`);
  
  if (user && tableOK && insertOK && rlsOK) {
    console.log('\n🎉 Tout fonctionne ! Le problème vient peut-être du formulaire.');
  } else {
    console.log('\n⚠️ Problème identifié. Vérifiez la configuration Supabase.');
  }
}

// Exporter pour utilisation
window.quickTest = {
  runQuickTest,
  quickAuthTest,
  quickTableTest,
  quickInsertTest,
  quickRLSTest
};

console.log('📋 Script de test rapide chargé. Utilisez:');
console.log('- quickTest.runQuickTest() pour le test complet');
console.log('- quickTest.quickInsertTest(user) pour tester l\'insertion'); 