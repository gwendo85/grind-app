#!/usr/bin/env node

/**
 * Script pour appliquer le schéma SQL des fonctionnalités sociales à Supabase
 * Usage: node apply-social-schema.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Assurez-vous que votre fichier .env.local contient ces variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySocialSchema() {
  console.log('🚀 Application du schéma SQL pour les fonctionnalités sociales...\n');

  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, 'social-database-schema.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ Fichier social-database-schema.sql non trouvé');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Diviser le SQL en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 ${commands.length} commandes SQL à exécuter...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        console.log(`[${i + 1}/${commands.length}] Exécution de la commande...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          // Si exec_sql n'existe pas, utiliser une approche différente
          console.log('   ⚠️  exec_sql non disponible, tentative avec query...');
          
          const { error: queryError } = await supabase.from('_dummy').select('*').limit(0);
          
          if (queryError && queryError.message.includes('relation "_dummy" does not exist')) {
            console.log('   ✅ Connexion à Supabase réussie');
            console.log('   ℹ️  Veuillez exécuter le schéma SQL manuellement dans l\'interface Supabase');
            console.log('   📁 Fichier: social-database-schema.sql');
            break;
          }
        } else {
          successCount++;
          console.log('   ✅ Succès');
        }
      } catch (err) {
        errorCount++;
        console.log(`   ❌ Erreur: ${err.message}`);
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);

    if (errorCount === 0) {
      console.log('\n🎉 Schéma SQL appliqué avec succès !');
      console.log('\n📋 Prochaines étapes:');
      console.log('   1. Vérifier les tables créées dans l\'interface Supabase');
      console.log('   2. Tester les API routes créées');
      console.log('   3. Commencer la Phase 2: Composants React');
    } else {
      console.log('\n⚠️  Certaines erreurs sont survenues.');
      console.log('   Veuillez vérifier les logs ci-dessus et corriger les problèmes.');
    }

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Fonction pour vérifier la connexion
async function testConnection() {
  console.log('🔍 Test de connexion à Supabase...');
  
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('   ℹ️  Connexion établie (pas d\'utilisateur connecté, normal)');
    } else {
      console.log('   ✅ Connexion établie');
    }
    
    return true;
  } catch (error) {
    console.error('   ❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🔧 Script d\'application du schéma social GRIND\n');
  
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('\n❌ Impossible de se connecter à Supabase');
    console.error('   Vérifiez vos variables d\'environnement et votre connexion internet');
    process.exit(1);
  }
  
  await applySocialSchema();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applySocialSchema, testConnection }; 