import { createClient } from '@/lib/supabase-server';
import SessionFlow from '@/components/SessionFlow';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (!workout || error) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Séance introuvable</h2>
        <p className="text-gray-600">La séance demandée n'existe pas ou a été supprimée.</p>
        <Link href="/dashboard" className="mt-6 inline-block bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transition-all">Retour au dashboard</Link>
      </div>
    );
  }

  // Si la séance est planifiée, afficher le résumé + bouton démarrer
  if (workout.status === 'planned') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-white px-2 py-4">
        <div className="w-full max-w-xl mx-auto px-4 py-8 rounded-3xl shadow-xl backdrop-blur-md bg-white/60 border border-white/30" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-lg">Séance planifiée</h1>
          <div className="mb-4 text-gray-700">
            <span className="font-bold">{workout.name || 'Séance sans nom'}</span> <span className="ml-2 text-sm">({workout.date ? new Date(workout.date).toLocaleDateString('fr-FR') : ''})</span>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Exercices</h2>
            <ul className="space-y-2">
              {Array.isArray(workout.exercises) && workout.exercises.length > 0 ? (
                workout.exercises.map((ex: any, i: number) => (
                  <li key={i} className="bg-white/80 rounded-lg p-3 border border-white/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between">
                    <span className="font-medium text-gray-800">{ex.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{ex.weight}kg, {ex.reps} reps, {ex.sets} séries</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">Aucun exercice renseigné</li>
              )}
            </ul>
          </div>
          {workout.notes && (
            <div className="mb-4 text-sm text-gray-600 italic">"{workout.notes}"</div>
          )}
          <form method="POST" action={`/api/session/start/${workout.id}`}> {/* endpoint à créer */}
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold py-3 rounded-xl text-lg shadow-lg hover:scale-105 transition-all">Démarrer la séance</button>
          </form>
        </div>
      </div>
    );
  }

  // Sinon, afficher le suivi classique
  const savedExerciseIndex = workout.current_exercise_index || 0;
  const savedSetIndex = workout.current_set_index || 0;

  return (
    <div className="max-w-xl mx-auto py-8">
      <SessionFlow 
        workout={workout} 
        savedExerciseIndex={savedExerciseIndex}
        savedSetIndex={savedSetIndex}
      />
    </div>
  );
} 