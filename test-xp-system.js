// Script de test pour le système XP
// À exécuter dans la console navigateur sur http://localhost:3000/dashboard

window.testXPSystem = async () => {
  console.log('🧪 Test du système XP...');
  
  try {
    // 1. Test de connexion Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    const supabaseUrl = 'https://your-project.supabase.co'; // Remplacer par ton URL
    const supabaseKey = 'your-anon-key'; // Remplacer par ta clé
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 2. Vérifier l'authentification
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Erreur d\'authentification:', userError);
      return;
    }
    console.log('✅ Utilisateur connecté:', user.id);
    
    // 3. Vérifier la structure de daily_progress
    const { data: tableInfo, error: tableError } = await supabase
      .from('daily_progress')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur table daily_progress:', tableError);
      return;
    }
    console.log('✅ Table daily_progress accessible');
    
    // 4. Récupérer les données de la semaine
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi
    
    const { data: weeklyData, error: weeklyError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', weekStart.toISOString().split('T')[0])
      .order('date', { ascending: true });
    
    if (weeklyError) {
      console.error('❌ Erreur récupération données hebdo:', weeklyError);
      return;
    }
    
    console.log('📊 Données de la semaine:', weeklyData);
    
    // 5. Calculer l'XP total de la semaine
    const totalWeeklyXP = weeklyData?.reduce((sum, day) => sum + (day.xp_earned || 0), 0) || 0;
    console.log('🎯 XP total de la semaine:', totalWeeklyXP);
    
    // 6. Tester l'insertion d'une séance de test
    console.log('🔄 Test d\'insertion d\'une séance...');
    
    const testWorkout = {
      user_id: user.id,
      name: 'Test XP System',
      exercises: [{
        name: 'Test Exercise',
        weight: 50,
        reps: 10,
        notes: 'Test automatique'
      }]
    };
    
    const { data: workoutResult, error: workoutError } = await supabase
      .from('workouts')
      .insert(testWorkout)
      .select();
    
    if (workoutError) {
      console.error('❌ Erreur insertion séance:', workoutError);
      return;
    }
    console.log('✅ Séance de test ajoutée:', workoutResult);
    
    // 7. Vérifier que l'XP a été ajouté
    const { data: updatedProgress, error: progressError } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today.toISOString().split('T')[0])
      .single();
    
    if (progressError) {
      console.error('❌ Erreur vérification XP:', progressError);
    } else {
      console.log('✅ XP mis à jour:', updatedProgress);
    }
    
    // 8. Nettoyer la séance de test
    if (workoutResult && workoutResult[0]) {
      await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutResult[0].id);
      console.log('🧹 Séance de test supprimée');
    }
    
    console.log('🎉 Test XP terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

console.log('🚀 Script de test XP chargé. Exécutez: testXPSystem()'); 