// Script de diagnostic de la structure de la table workouts
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🔍 Diagnostic de la structure de la table workouts...');

// Test 1: Vérifier la structure de la table
async function checkTableStructure() {
  console.log('1️⃣ Vérification de la structure de la table...');
  
  try {
    // Essayer de récupérer la structure via une requête
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Erreur structure:', error);
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Détails:', error.details);
      console.error('Hint:', error.hint);
      return false;
    }
    
    console.log('✅ Table workouts accessible');
    return true;
  } catch (err) {
    console.error('❌ Erreur table:', err);
    return false;
  }
}

// Test 2: Vérifier les colonnes disponibles
async function checkColumns() {
  console.log('2️⃣ Vérification des colonnes...');
  
  try {
    // Test avec différentes colonnes pour voir lesquelles existent
    const testColumns = [
      'id', 'user_id', 'date', 'exercise', 'exercises', 
      'weight', 'reps', 'sets', 'duration_minutes', 'notes', 
      'created_at', 'updated_at'
    ];
    
    for (const column of testColumns) {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`❌ Colonne '${column}': ${error.message}`);
        } else {
          console.log(`✅ Colonne '${column}': Existe`);
        }
      } catch (err) {
        console.log(`❌ Colonne '${column}': Erreur - ${err.message}`);
      }
    }
    
    return true;
  } catch (err) {
    console.error('❌ Erreur vérification colonnes:', err);
    return false;
  }
}

// Test 3: Test d'insertion avec différentes structures
async function testInsertion(user) {
  if (!user) {
    console.log('⚠️ Impossible de tester sans utilisateur');
    return false;
  }
  
  console.log('3️⃣ Test d\'insertion avec différentes structures...');
  
  // Test 1: Structure actuelle (exercise)
  console.log('📝 Test 1: Structure actuelle (exercise)');
  const testData1 = {
    user_id: user.id,
    exercise: 'Test Exercise',
    weight: 50,
    reps: 10,
    notes: 'Test structure actuelle'
  };
  
  try {
    const { data: data1, error: error1 } = await supabase
      .from('workouts')
      .insert(testData1)
      .select();
    
    if (error1) {
      console.error('❌ Erreur structure actuelle:', error1.message);
    } else {
      console.log('✅ Structure actuelle fonctionne:', data1);
      // Nettoyer
      if (data1 && data1[0]) {
        await supabase.from('workouts').delete().eq('id', data1[0].id);
        console.log('🧹 Test 1 nettoyé');
      }
    }
  } catch (err) {
    console.error('❌ Erreur test 1:', err);
  }
  
  // Test 2: Structure alternative (exercises)
  console.log('📝 Test 2: Structure alternative (exercises)');
  const testData2 = {
    user_id: user.id,
    exercises: [
      {
        name: 'Test Exercise',
        weight: 50,
        reps: 10,
        notes: 'Test structure alternative'
      }
    ],
    notes: 'Test structure alternative'
  };
  
  try {
    const { data: data2, error: error2 } = await supabase
      .from('workouts')
      .insert(testData2)
      .select();
    
    if (error2) {
      console.error('❌ Erreur structure alternative:', error2.message);
    } else {
      console.log('✅ Structure alternative fonctionne:', data2);
      // Nettoyer
      if (data2 && data2[0]) {
        await supabase.from('workouts').delete().eq('id', data2[0].id);
        console.log('🧹 Test 2 nettoyé');
      }
    }
  } catch (err) {
    console.error('❌ Erreur test 2:', err);
  }
  
  return true;
}

// Test 4: Vérifier le schéma SQL
async function checkSQLSchema() {
  console.log('4️⃣ Vérification du schéma SQL...');
  
  try {
    // Essayer de récupérer des informations sur la table
    const { data, error } = await supabase
      .rpc('get_table_info', { table_name: 'workouts' })
      .select();
    
    if (error) {
      console.log('⚠️ Impossible de récupérer les infos SQL (normal)');
      console.log('💡 Vérifiez manuellement dans Supabase > SQL Editor:');
      console.log('   SELECT column_name, data_type, is_nullable');
      console.log('   FROM information_schema.columns');
      console.log('   WHERE table_name = \'workouts\';');
    } else {
      console.log('✅ Informations SQL:', data);
    }
    
    return true;
  } catch (err) {
    console.log('⚠️ Impossible de récupérer les infos SQL');
    return true;
  }
}

// Test complet
async function runSchemaDiagnostic() {
  console.log('🚀 Démarrage du diagnostic de schéma...\n');
  
  const structureOK = await checkTableStructure();
  console.log('');
  
  const columnsOK = await checkColumns();
  console.log('');
  
  const { data: { user } } = await supabase.auth.getUser();
  const insertionOK = await testInsertion(user);
  console.log('');
  
  const schemaOK = await checkSQLSchema();
  console.log('');
  
  console.log('📊 Résumé du diagnostic:');
  console.log(`- Structure table: ${structureOK ? '✅' : '❌'}`);
  console.log(`- Vérification colonnes: ${columnsOK ? '✅' : '❌'}`);
  console.log(`- Test insertion: ${insertionOK ? '✅' : '❌'}`);
  console.log(`- Schéma SQL: ${schemaOK ? '✅' : '❌'}`);
  
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Vérifiez les colonnes disponibles ci-dessus');
  console.log('2. Comparez avec le schéma dans supabase-schema.sql');
  console.log('3. Appliquez les corrections nécessaires');
}

// Exporter pour utilisation
window.schemaDiagnostic = {
  runSchemaDiagnostic,
  checkTableStructure,
  checkColumns,
  testInsertion,
  checkSQLSchema
};

console.log('📋 Script de diagnostic de schéma chargé. Utilisez:');
console.log('- schemaDiagnostic.runSchemaDiagnostic() pour le diagnostic complet');
console.log('- schemaDiagnostic.checkColumns() pour vérifier les colonnes'); 