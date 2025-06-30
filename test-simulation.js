// Script de test pour simuler des séances et vérifier le système GRIND
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🧪 Démarrage des tests GRIND...');

// Fonction pour simuler l'ajout d'une séance
async function simulateWorkout(exercise, weight, reps, sets, notes, dateOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - dateOffset);
  
  const workoutData = {
    exercise: exercise,
    weight: weight,
    reps: reps,
    sets: sets,
    notes: notes,
    created_at: date.toISOString()
  };
  
  console.log(`💪 Ajout séance: ${exercise} - ${date.toLocaleDateString('fr-FR')}`);
  
  // Simuler l'appel API (à adapter selon ton implémentation)
  try {
    const response = await fetch('/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData)
    });
    
    if (response.ok) {
      console.log('✅ Séance ajoutée avec succès');
      return true;
    } else {
      console.log('❌ Erreur lors de l\'ajout de la séance');
      return false;
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error);
    return false;
  }
}

// Fonction pour vérifier les badges débloqués
function checkBadges(totalXP, totalWorkouts, currentStreak, longestStreak) {
  console.log('\n🏅 Vérification des badges:');
  
  const badges = {
    xp: [
      { name: 'Premier Pas', requirement: 100, unlocked: totalXP >= 100 },
      { name: 'Motivé', requirement: 500, unlocked: totalXP >= 500 },
      { name: 'Déterminé', requirement: 1000, unlocked: totalXP >= 1000 },
      { name: 'Persévérant', requirement: 2500, unlocked: totalXP >= 2500 },
      { name: 'Vétéran', requirement: 5000, unlocked: totalXP >= 5000 },
      { name: 'Légende', requirement: 10000, unlocked: totalXP >= 10000 }
    ],
    workouts: [
      { name: 'Débutant', requirement: 1, unlocked: totalWorkouts >= 1 },
      { name: 'Régulier', requirement: 10, unlocked: totalWorkouts >= 10 },
      { name: 'Consistant', requirement: 25, unlocked: totalWorkouts >= 25 },
      { name: 'Dévoué', requirement: 50, unlocked: totalWorkouts >= 50 },
      { name: 'Maître', requirement: 100, unlocked: totalWorkouts >= 100 }
    ],
    streak: [
      { name: 'En Forme', requirement: 3, unlocked: currentStreak >= 3 },
      { name: 'Semaine Parfaite', requirement: 7, unlocked: currentStreak >= 7 },
      { name: 'Discipliné', requirement: 14, unlocked: currentStreak >= 14 },
      { name: 'Machine', requirement: 30, unlocked: currentStreak >= 30 }
    ]
  };
  
  let totalUnlocked = 0;
  let totalBadges = 0;
  
  Object.entries(badges).forEach(([category, categoryBadges]) => {
    console.log(`\n${category.toUpperCase()}:`);
    categoryBadges.forEach(badge => {
      totalBadges++;
      if (badge.unlocked) {
        totalUnlocked++;
        console.log(`  ✅ ${badge.name} (${badge.requirement})`);
      } else {
        console.log(`  🔒 ${badge.name} (${badge.requirement}) - ${badge.requirement - (category === 'xp' ? totalXP : category === 'workouts' ? totalWorkouts : currentStreak)} restant`);
      }
    });
  });
  
  console.log(`\n📊 Progression: ${totalUnlocked}/${totalBadges} badges débloqués (${Math.round((totalUnlocked/totalBadges)*100)}%)`);
}

// Fonction pour vérifier les streaks
function checkStreaks(workouts) {
  console.log('\n🔥 Vérification des streaks:');
  
  if (!workouts || workouts.length === 0) {
    console.log('  Aucune séance trouvée');
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  // Trier par date (plus récentes en premier)
  const sortedWorkouts = [...workouts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Convertir les dates et supprimer les doublons
  const workoutDates = sortedWorkouts.map(workout => {
    const date = new Date(workout.created_at);
    date.setHours(0, 0, 0, 0);
    return date;
  });
  
  const uniqueDates = workoutDates.filter((date, index, self) => 
    index === self.findIndex(d => d.getTime() === date.getTime())
  );
  
  console.log(`  📅 Séances sur ${uniqueDates.length} jours différents`);
  
  // Calculer le streak actuel
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastWorkoutDate = uniqueDates[0];
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let currentStreak = 0;
  if (daysSinceLastWorkout <= 1) {
    let streakCount = 1;
    let currentDate = new Date(lastWorkoutDate);
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const previousDate = new Date(uniqueDates[i]);
      const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDifference === 1) {
        streakCount++;
        currentDate = previousDate;
      } else {
        break;
      }
    }
    
    currentStreak = streakCount;
  }
  
  // Calculer le streak le plus long
  let longestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = uniqueDates[i];
    const nextDate = uniqueDates[i + 1];
    const dayDifference = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDifference === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  
  console.log(`  🔥 Streak actuel: ${currentStreak} jours`);
  console.log(`  🏆 Record: ${longestStreak} jours`);
  
  return { currentStreak, longestStreak };
}

// Test complet
async function runCompleteTest() {
  console.log('🚀 Démarrage du test complet GRIND...\n');
  
  // Simuler des séances sur plusieurs jours
  const testWorkouts = [
    { exercise: 'Squats', weight: 80, reps: 10, sets: 3, notes: 'Test séance 1', offset: 0 },
    { exercise: 'Pompes', weight: null, reps: 20, sets: 4, notes: 'Test séance 2', offset: 1 },
    { exercise: 'Développé couché', weight: 60, reps: 8, sets: 3, notes: 'Test séance 3', offset: 2 },
    { exercise: 'Tractions', weight: null, reps: 8, sets: 3, notes: 'Test séance 4', offset: 3 },
    { exercise: 'Deadlift', weight: 100, reps: 5, sets: 3, notes: 'Test séance 5', offset: 4 },
    { exercise: 'Burpees', weight: null, reps: 15, sets: 3, notes: 'Test séance 6', offset: 5 },
    { exercise: 'Planche', weight: null, reps: null, sets: 3, notes: 'Test séance 7', offset: 6 }
  ];
  
  console.log('📝 Simulation de séances...');
  for (const workout of testWorkouts) {
    await simulateWorkout(workout.exercise, workout.weight, workout.reps, workout.sets, workout.notes, workout.offset);
    // Attendre un peu entre chaque séance
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Simuler des données pour les tests
  const totalXP = testWorkouts.length * 100; // 100 XP par séance
  const totalWorkouts = testWorkouts.length;
  
  // Vérifier les streaks
  const { currentStreak, longestStreak } = checkStreaks(testWorkouts);
  
  // Vérifier les badges
  checkBadges(totalXP, totalWorkouts, currentStreak, longestStreak);
  
  console.log('\n✅ Test terminé !');
  console.log('📱 N\'oublie pas de tester le responsive sur mobile/tablette');
  console.log('🔗 Vérifie la navigation entre Dashboard et Badges');
  console.log('🚪 Teste la déconnexion');
}

// Fonctions utilitaires pour les tests manuels
window.GRINDTest = {
  simulateWorkout,
  checkBadges,
  checkStreaks,
  runCompleteTest
};

console.log('🧪 Script de test GRIND chargé !');
console.log('Utilise GRINDTest.runCompleteTest() pour lancer le test complet');
console.log('Ou utilise les fonctions individuelles :');
console.log('- GRINDTest.simulateWorkout(exercise, weight, reps, sets, notes, dateOffset)');
console.log('- GRINDTest.checkBadges(totalXP, totalWorkouts, currentStreak, longestStreak)');
console.log('- GRINDTest.checkStreaks(workouts)'); 