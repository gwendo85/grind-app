// =====================================================
// TEST FINAL - Vérification Migration avec Vraies Données
// =====================================================

// Copie ce script dans la console du navigateur (F12)
// après avoir exécuté la migration Supabase

console.log('🧪 Test Final - Migration JSONB GRIND');
console.log('=====================================');

// Test 1: Vérifier la connexion avec les vraies variables
async function testRealConnection() {
  console.log('\n1️⃣ Test de connexion avec vraies variables...');
  
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Erreur utilisateur:', userError);
      return false;
    }
    
    if (!user) {
      console.error('❌ Aucun utilisateur connecté');
      console.log('💡 Connecte-toi d\'abord sur l\'application');
      return false;
    }
    
    console.log('✅ Utilisateur connecté:', user.id);
    console.log('📧 Email:', user.email);
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    return false;
  }
}

// Test 2: Vérifier la structure de la table workouts
async function testWorkoutsStructure() {
  console.log('\n2️⃣ Test de la structure de la table workouts...');
  
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur lecture table workouts:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      const workout = data[0];
      console.log('📊 Structure du premier workout:', workout);
      
      // Vérifier les colonnes essentielles
      const requiredColumns = ['id', 'user_id', 'date', 'exercises', 'notes', 'created_at'];
      const missingColumns = requiredColumns.filter(col => !(col in workout));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
        return false;
      }
      
      console.log('✅ Toutes les colonnes requises présentes');
      
      // Vérifier le type de exercises
      if (typeof workout.exercises === 'object' && Array.isArray(workout.exercises)) {
        console.log('✅ Colonne exercises est bien un array JSONB');
        console.log('📝 Contenu exercises:', workout.exercises);
      } else {
        console.error('❌ Colonne exercises n\'est pas un array JSONB');
        return false;
      }
      
      return true;
    } else {
      console.log('ℹ️ Table workouts vide, pas de données à vérifier');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur test structure:', error);
    return false;
  }
}

// Test 3: Tester l'insertion d'une vraie séance
async function testRealWorkoutInsertion() {
  console.log('\n3️⃣ Test d\'insertion d\'une vraie séance...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const testWorkout = {
      user_id: user.id,
      exercises: [
        {
          name: "Développé couché",
          weight: 80,
          reps: 8,
          notes: "Test final migration JSONB"
        },
        {
          name: "Squat",
          weight: 100,
          reps: 5,
          notes: "Deuxième exercice de test"
        }
      ],
      notes: "Séance de test finale pour vérifier la migration"
    };
    
    console.log('📝 Données de test à insérer:', testWorkout);
    
    const { data, error } = await supabase
      .from('workouts')
      .insert(testWorkout)
      .select();
    
    if (error) {
      console.error('❌ Erreur insertion:', error);
      console.error('📋 Détails de l\'erreur:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }
    
    console.log('✅ Séance insérée avec succès:', data);
    
    // Vérifier que les données sont bien structurées
    if (data && data.length > 0) {
      const insertedWorkout = data[0];
      console.log('📊 Séance insérée:', {
        id: insertedWorkout.id,
        user_id: insertedWorkout.user_id,
        exercises: insertedWorkout.exercises,
        notes: insertedWorkout.notes,
        created_at: insertedWorkout.created_at
      });
      
      // Nettoyer - supprimer la séance de test
      const { error: deleteError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', insertedWorkout.id);
      
      if (deleteError) {
        console.warn('⚠️ Erreur lors de la suppression de la séance de test:', deleteError);
      } else {
        console.log('🧹 Séance de test supprimée avec succès');
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test insertion:', error);
    return false;
  }
}

// Test 4: Vérifier les policies RLS
async function testRLSPolicies() {
  console.log('\n4️⃣ Test des policies RLS...');
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Tester la lecture des séances
    const { data: readData, error: readError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .limit(5);
    
    if (readError) {
      console.error('❌ Erreur lecture (RLS):', readError);
      return false;
    }
    
    console.log('✅ Lecture autorisée par RLS');
    console.log('📊 Nombre de séances trouvées:', readData ? readData.length : 0);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur test RLS:', error);
    return false;
  }
}

// Exécuter tous les tests
async function runFinalTests() {
  console.log('🚀 Démarrage des tests finaux...\n');
  
  const test1 = await testRealConnection();
  const test2 = await testWorkoutsStructure();
  const test3 = await testRealWorkoutInsertion();
  const test4 = await testRLSPolicies();
  
  console.log('\n📊 Résultats des tests finaux:');
  console.log('===============================');
  console.log('1️⃣ Connexion utilisateur:', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('2️⃣ Structure table:', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('3️⃣ Insertion séance:', test3 ? '✅ PASS' : '❌ FAIL');
  console.log('4️⃣ Policies RLS:', test4 ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = test1 && test2 && test3 && test4;
  
  if (allPassed) {
    console.log('\n🎉 TOUS LES TESTS PASSENT !');
    console.log('✅ La migration JSONB fonctionne parfaitement');
    console.log('✅ L\'ajout de séances fonctionne');
    console.log('✅ Les policies RLS sont correctes');
    console.log('✅ Prêt pour le déploiement Vercel !');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ÉCHOUENT');
    console.log('❌ Vérifie la migration dans Supabase');
    console.log('❌ Vérifie les policies RLS');
    console.log('❌ Redémarre le serveur si nécessaire');
  }
  
  return allPassed;
}

// Instructions d'utilisation
console.log('\n📋 Instructions:');
console.log('1. Assure-toi d\'être connecté sur l\'application');
console.log('2. Va sur le dashboard');
console.log('3. Ouvre la console (F12)');
console.log('4. Copie-colle ce script et appuie sur Entrée');
console.log('5. Vérifie les résultats des tests');

// Exporter la fonction pour l'exécuter manuellement
window.testFinal = runFinalTests; 