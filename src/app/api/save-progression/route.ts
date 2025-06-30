import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { workout_id, exercise_index, set_index, save_progress } = await request.json();

    if (!workout_id) {
      return NextResponse.json({ error: 'workout_id requis' }, { status: 400 });
    }

    if (save_progress) {
      // Sauvegarder la progression
      const { error } = await supabase.rpc('save_workout_progression', {
        p_workout_id: workout_id,
        p_exercise_index: exercise_index || 0,
        p_set_index: set_index || 0,
        p_save_progress: true
      });

      if (error) {
        console.error('Erreur sauvegarde progression:', error);
        return NextResponse.json({ error: 'Erreur sauvegarde progression' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Progression sauvegardée',
        exercise_index,
        set_index
      });
    } else {
      // Supprimer la séance en cours
      const { error } = await supabase.rpc('save_workout_progression', {
        p_workout_id: workout_id,
        p_exercise_index: 0,
        p_set_index: 0,
        p_save_progress: false
      });

      if (error) {
        console.error('Erreur suppression séance:', error);
        return NextResponse.json({ error: 'Erreur suppression séance' }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Séance supprimée'
      });
    }

  } catch (error) {
    console.error('Erreur API save-progression:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 