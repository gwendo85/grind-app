// =====================================================
// SCRIPT DE TEST - Vérification Migration JSONB
// =====================================================

// Copie ce script dans la console du navigateur (F12)
// après avoir exécuté la migration Supabase

console.log('🧪 Test de Migration JSONB GRIND');
console.log('================================');

// Test 1: Vérifier que Supabase est accessible
async function testSupabaseConnection() {
  console.log('\n1️⃣ Test de connexion Supabase...');
  
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erreur utilisateur:', userError);
      return false;
    }
    
    if (!user) {
      console.error('❌ Aucun utilisateur connecté');
      return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.id);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    return false;
  }
}

// Test 2: Vérifier la structure de la table
async function testTableStructure() {
  console.log('\n2️⃣ Test de la structure de la table...');
  
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur lecture table:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      const workout = data[0];
      console.log('📊 Structure du premier workout:', workout);
      
      // Vérifier si exercises existe
      if ('exercises' in workout) {
        console.log('✅ Colonne "exercises" présente');
        console.log('📝 Type:', typeof workout.exercises);
        console.log('📝 Contenu:', workout.exercises);
        return true;
      } else {
        console.error('❌ Colonne "exercises" manquante');
        return false;
      }
    } else {
      console.log('ℹ️ Table vide, pas de données à vérifier');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur test structure:', error);
    return false;
  }
}

// Test 3: Tester l'insertion d'une séance
async function testWorkoutInsertion() {
  console.log('\n3️⃣ Test d\'insertion de séance...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const testWorkout = {
      user_id: user.id,
      exercises: [
        {
          name: "Test Squat",
          weight: 100,
          reps: 5,
          notes: "Test de migration JSONB"
        }
      ],
      notes: "Séance de test pour vérifier la migration"
    };
    
    console.log('📝 Données de test:', testWorkout);
    
    const { data, error } = await supabase
      .from('workouts')
      .insert(testWorkout)
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion:', error);
      return false;
    }
    
    console.log('✅ Séance insérée avec succès:', data);
    
    // Nettoyer - supprimer la séance de test
    if (data && data.length > 0) {
      await supabase
        .from('workouts')
        .delete()
        .eq('id', data[0].id);
      console.log('🧹 Séance de test supprimée');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test insertion:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests de migration...\n');
  
  const test1 = await testSupabaseConnection();
  const test2 = await testTableStructure();
  const test3 = await testWorkoutInsertion();
  
  console.log('\n📊 Résultats des tests:');
  console.log('========================');
  console.log('1️⃣ Connexion Supabase:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('2️⃣ Structure table:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('3️⃣ Insertion séance:', test3 ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = test1 && test2 && test3;
  
  if (allPassed) {
    console.log('\n🎉 TOUS LES TESTS PASSENT !');
    console.log('✅ La migration JSONB fonctionne parfaitement');
    console.log('✅ Tu peux maintenant ajouter des séances normalement');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ÉCHOUENT');
    console.log('❌ Vérifie la migration dans Supabase');
    console.log('❌ Redémarre le serveur si nécessaire');
  }
  
  return allPassed;
}

// Instructions d'utilisation
console.log('\n📋 Instructions:');
console.log('1. Exécute d\'abord la migration dans Supabase SQL Editor');
console.log('2. Redémarre le serveur Next.js');
console.log('3. Va sur le dashboard et ouvre la console (F12)');
console.log('4. Copie-colle ce script et appuie sur Entrée');
console.log('5. Vérifie les résultats des tests');

// Exporter la fonction pour l'exécuter manuellement
window.testMigration = runAllTests; 