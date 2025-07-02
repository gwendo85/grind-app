import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "GRIND - Ton app de musculation et motivation",
  description: "Application de suivi d'entraînement avec système de gamification",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Script de test complet pour diagnostiquer les problèmes d'ajout de séance
              window.testWorkoutInsertion = async () => {
                console.log('🔍 Début du test d\'insertion de séance...');
                
                try {
                  // 1. Test de connexion Supabase
                  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
                  const supabaseUrl = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
                  const supabaseKey = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
                  
                  if (!supabaseUrl || !supabaseKey) {
                    console.error('❌ Variables d\'environnement manquantes');
                    return;
                  }
                  
                  const supabase = createClient(supabaseUrl, supabaseKey);
                  console.log('✅ Client Supabase créé');
                  
                  // 2. Test d'authentification
                  const { data: { user }, error: userError } = await supabase.auth.getUser();
                  if (userError) {
                    console.error('❌ Erreur authentification:', userError);
                    return;
                  }
                  
                  if (!user) {
                    console.error('❌ Aucun utilisateur connecté');
                    return;
                  }
                  
                  console.log('✅ Utilisateur connecté:', user.id);
                  
                  // 3. Test de structure de table
                  const { data: tableInfo, error: tableError } = await supabase
                    .from('workouts')
                    .select('*')
                    .limit(1);
                  
                  if (tableError) {
                    console.error('❌ Erreur accès table workouts:', tableError);
                    return;
                  }
                  
                  console.log('✅ Table workouts accessible');
                  
                  // 4. Test d'insertion avec différentes structures
                  const testData = {
                    user_id: user.id,
                    exercises: [
                      {
                        name: 'Test Exercise',
                        weight: 50,
                        reps: 10,
                        notes: 'Test insertion'
                      }
                    ],
                    notes: 'Test séance'
                  };
                  
                  console.log('📝 Tentative d\'insertion avec:', testData);
                  
                  const { data: insertResult, error: insertError } = await supabase
                    .from('workouts')
                    .insert(testData)
                    .select();
                  
                  if (insertError) {
                    console.error('❌ Erreur insertion:', insertError);
                    console.error('Code:', insertError.code);
                    console.error('Message:', insertError.message);
                    console.error('Details:', insertError.details);
                    console.error('Hint:', insertError.hint);
                    
                    // Test avec structure alternative
                    console.log('🔄 Test avec structure alternative...');
                    const altData = {
                      user_id: user.id,
                      exercise: 'Test Exercise', // Ancienne structure
                      weight: 50,
                      reps: 10,
                      notes: 'Test insertion alternative'
                    };
                    
                    const { data: altResult, error: altError } = await supabase
                      .from('workouts')
                      .insert(altData)
                      .select();
                      
                    if (altError) {
                      console.error('❌ Erreur insertion alternative:', altError);
                    } else {
                      console.log('✅ Insertion alternative réussie:', altResult);
                    }
                    
                    return;
                  }
                  
                  console.log('✅ Insertion réussie:', insertResult);
                  
                  // 5. Vérification des données insérées
                  const { data: verifyData, error: verifyError } = await supabase
                    .from('workouts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);
                  
                  if (verifyError) {
                    console.error('❌ Erreur vérification:', verifyError);
                  } else {
                    console.log('✅ Données vérifiées:', verifyData);
                  }
                  
                } catch (error) {
                  console.error('❌ Erreur générale:', error);
                }
              };
              
              // Test automatique au chargement
              window.addEventListener('load', () => {
                console.log('🚀 Page chargée, test disponible via: testWorkoutInsertion()');
              });
            `
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        
        {/* Scripts de test pour débogage */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Script de test rapide pour diagnostiquer le problème d'insertion
              console.log('🔍 Test rapide de diagnostic chargé...');
              
              // Test 1: Vérifier l'authentification
              async function quickAuthTest() {
                console.log('1️⃣ Test d\\'authentification...');
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
                
                console.log('3️⃣ Test d\\'insertion...');
                
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
                console.log('🚀 Démarrage du test rapide...\\n');
                
                const user = await quickAuthTest();
                console.log('');
                
                const tableOK = await quickTableTest();
                console.log('');
                
                const insertOK = await quickInsertTest(user);
                console.log('');
                
                const rlsOK = await quickRLSTest(user);
                console.log('');
                
                console.log('📊 Résumé du test rapide:');
                console.log(\`- Authentification: \${user ? '✅' : '❌'}\`);
                console.log(\`- Structure table: \${tableOK ? '✅' : '❌'}\`);
                console.log(\`- Insertion: \${insertOK ? '✅' : '❌'}\`);
                console.log(\`- RLS: \${rlsOK ? '✅' : '❌'}\`);
                
                if (user && tableOK && insertOK && rlsOK) {
                  console.log('\\n🎉 Tout fonctionne ! Le problème vient peut-être du formulaire.');
                } else {
                  console.log('\\n⚠️ Problème identifié. Vérifiez la configuration Supabase.');
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
              console.log('- quickTest.quickInsertTest(user) pour tester l\\'insertion');
            `
          }}
        />
        
        {/* Script de diagnostic de schéma */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Script de diagnostic de la structure de la table workouts
              console.log('🔍 Diagnostic de schéma chargé...');
              
              // Test 1: Vérifier la structure de la table
              async function checkTableStructure() {
                console.log('1️⃣ Vérification de la structure de la table...');
                
                try {
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
                        console.log(\`❌ Colonne '\${column}': \${error.message}\`);
                      } else {
                        console.log(\`✅ Colonne '\${column}': Existe\`);
                      }
                    } catch (err) {
                      console.log(\`❌ Colonne '\${column}': Erreur - \${err.message}\`);
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
                
                console.log('3️⃣ Test d\\'insertion avec différentes structures...');
                
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
              
              // Test complet
              async function runSchemaDiagnostic() {
                console.log('🚀 Démarrage du diagnostic de schéma...\\n');
                
                const structureOK = await checkTableStructure();
                console.log('');
                
                const columnsOK = await checkColumns();
                console.log('');
                
                const { data: { user } } = await supabase.auth.getUser();
                const insertionOK = await testInsertion(user);
                console.log('');
                
                console.log('📊 Résumé du diagnostic:');
                console.log(\`- Structure table: \${structureOK ? '✅' : '❌'}\`);
                console.log(\`- Vérification colonnes: \${columnsOK ? '✅' : '❌'}\`);
                console.log(\`- Test insertion: \${insertionOK ? '✅' : '❌'}\`);
                
                console.log('\\n💡 Prochaines étapes:');
                console.log('1. Vérifiez les colonnes disponibles ci-dessus');
                console.log('2. Comparez avec le schéma dans supabase-schema.sql');
                console.log('3. Appliquez les corrections nécessaires');
              }
              
              // Exporter pour utilisation
              window.schemaDiagnostic = {
                runSchemaDiagnostic,
                checkTableStructure,
                checkColumns,
                testInsertion
              };
              
              console.log('📋 Script de diagnostic de schéma chargé. Utilisez:');
              console.log('- schemaDiagnostic.runSchemaDiagnostic() pour le diagnostic complet');
              console.log('- schemaDiagnostic.checkColumns() pour vérifier les colonnes');
            `
          }}
        />
      </body>
    </html>
  );
}
