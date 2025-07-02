import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les posts d'activité
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Récupérer les posts avec les statistiques
    const { data: posts, error } = await supabase
      .from('activity_posts_with_stats')
      .select(`
        *,
        user_profiles!activity_posts_user_id_fkey (
          username,
          avatar_url
        ),
        workouts!activity_posts_workout_id_fkey (
          id,
          name,
          duration,
          exercises
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des posts:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Récupérer le nombre total de posts pour la pagination
    const { count } = await supabase
      .from('activity_posts')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API posts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau post d'activité
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { workout_id, message, is_public = true } = body;

    // Validation
    if (!workout_id) {
      return NextResponse.json({ error: 'workout_id est requis' }, { status: 400 });
    }

    // Vérifier que le workout appartient à l'utilisateur
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', workout_id)
      .eq('user_id', user.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: 'Workout non trouvé ou non autorisé' }, { status: 404 });
    }

    // Créer le post
    const { data: post, error } = await supabase
      .from('activity_posts')
      .insert({
        user_id: user.id,
        workout_id,
        message,
        is_public
      })
      .select(`
        *,
        user_profiles!activity_posts_user_id_fkey (
          username,
          avatar_url
        ),
        workouts!activity_posts_workout_id_fkey (
          id,
          name,
          duration,
          exercises
        )
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la création du post:', error);
      return NextResponse.json({ error: 'Erreur lors de la création du post' }, { status: 500 });
    }

    return NextResponse.json({ post }, { status: 201 });

  } catch (error) {
    console.error('Erreur API création post:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 