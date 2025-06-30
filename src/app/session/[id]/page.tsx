import { createClient } from '@/lib/supabase-server';
import SessionFlow from '@/components/SessionFlow';
import { notFound } from 'next/navigation';

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', id)
    .single();

  if (!workout || error) {
    notFound();
  }

  // Récupérer les indices sauvegardés pour la reprise
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