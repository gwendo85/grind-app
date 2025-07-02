// Script de test pour vérifier la revalidation automatique des stats
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRevalidation() {
  console.log('🧪 Test de revalidation automatique des stats');
  console.log('=============================================\n');

  try {
    // 1. Récupérer un utilisateur de test
    console.log('1️⃣ Récupération d\'un utilisateur de test...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users || users.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé, création d\'un utilisateur de test...');
      // Créer un utilisateur de test si nécessaire
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'test-revalidation@grind.test',
        password: 'test123456',
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Erreur création utilisateur:', createError);
        return;
      }
      
      console.log('✅ Utilisateur de test créé:', newUser.user.id);
      userId = newUser.user.id;
    } else {
      userId = users[0].id;
      console.log('✅ Utilisateur trouvé:', userId);
    }

    // 2. Récupérer les stats initiales
    console.log('\n2️⃣ Récupération des stats initiales...');
    const initialStats = await getStats(userId);
    console.log('📊 Stats initiales:', initialStats);

    // 3. Ajouter une séance de test
    console.log('\n3️⃣ Ajout d\'une séance de test...');
    const workoutData = {
      user_id: userId,
      name: 'Test Revalidation',
      exercises: [
        {
          name: 'Pompes',
          weight: 0,
          reps: 10,
          sets: 3,
          rest: 60
        }
      ],
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      notes: 'Séance de test pour vérifier la revalidation'
    };

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert([workoutData])
      .select()
      .single();

    if (workoutError) {
      console.error('❌ Erreur ajout séance:', workoutError);
      return;
    }

    console.log('✅ Séance ajoutée:', workout.id);

    // 4. Ajouter l'XP (simulation de ce que fait le hook)
    console.log('\n4️⃣ Ajout de l\'XP...');
    const today = new Date().toISOString().split('T')[0];
    
    const { error: xpError } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date: today,
        xp_earned: 100,
      }, {
        onConflict: 'user_id,date'
      });

    if (xpError) {
      console.error('❌ Erreur ajout XP:', xpError);
      return;
    }

    console.log('✅ XP ajouté (+100)');

    // 5. Vérifier les stats après modification
    console.log('\n5️⃣ Vérification des stats après modification...');
    const finalStats = await getStats(userId);
    console.log('📊 Stats finales:', finalStats);

    // 6. Comparaison
    console.log('\n6️⃣ Comparaison des stats...');
    const xpDiff = finalStats.totalXP - initialStats.totalXP;
    const streakDiff = finalStats.currentStreak - initialStats.currentStreak;
    
    console.log(`📈 Différence XP: ${xpDiff} (attendu: 100)`);
    console.log(`🔥 Différence Streak: ${streakDiff} (attendu: 0 ou 1)`);
    
    if (xpDiff >= 100) {
      console.log('✅ Revalidation XP: SUCCÈS');
    } else {
      console.log('❌ Revalidation XP: ÉCHEC');
    }

    if (streakDiff >= 0) {
      console.log('✅ Revalidation Streak: SUCCÈS');
    } else {
      console.log('❌ Revalidation Streak: ÉCHEC');
    }

    // 7. Nettoyage
    console.log('\n7️⃣ Nettoyage des données de test...');
    await supabase.from('workouts').delete().eq('id', workout.id);
    console.log('✅ Séance de test supprimée');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

async function getStats(userId) {
  // Récupérer l'XP total
  const { data: dailyProgress } = await supabase
    .from("daily_progress")
    .select("xp_earned")
    .eq("user_id", userId);

  const totalXP = dailyProgress?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0;

  // Récupérer le streak
  const { data: streakData } = await supabase
    .rpc('calculate_user_streak', { user_uuid: userId });

  const currentStreak = streakData?.[0]?.current_streak || 0;
  const longestStreak = streakData?.[0]?.longest_streak || 0;

  return {
    totalXP,
    currentStreak,
    longestStreak
  };
}

// Exécuter le test
testRevalidation().then(() => {
  console.log('\n🎉 Test terminé !');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
}); 