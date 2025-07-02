import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les challenges
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
    const featured = searchParams.get('featured') === 'true';
    const active = searchParams.get('active') !== 'false'; // Par défaut, seulement les actifs

    // Construire la requête
    let query = supabase
      .from('community_challenges')
      .select(`
        *,
        created_by_user:user_profiles!community_challenges_created_by_fkey (
          username,
          avatar_url
        ),
        participants:challenge_participants (
          user_id,
          current_progress,
          is_completed,
          joined_at
        )
      `);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (active) {
      query = query.eq('is_active', true);
    }

    const { data: challenges, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des challenges:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Enrichir avec les informations de participation de l'utilisateur
    const enrichedChallenges = challenges?.map(challenge => {
      const userParticipation = challenge.participants?.find(
        (p: any) => p.user_id === user.id
      );
      
      return {
        ...challenge,
        user_participation: userParticipation || null,
        participants_count: challenge.participants?.length || 0,
        is_joined: !!userParticipation
      };
    });

    return NextResponse.json({ challenges: enrichedChallenges });

  } catch (error) {
    console.error('Erreur API challenges:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau challenge
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
    const { 
      title, 
      description, 
      challenge_type, 
      target_value, 
      duration_days,
      is_featured = false 
    } = body;

    // Validation
    if (!title || !challenge_type || !target_value || !duration_days) {
      return NextResponse.json({ 
        error: 'title, challenge_type, target_value et duration_days sont requis' 
      }, { status: 400 });
    }

    if (!['workouts', 'streak', 'xp', 'distance'].includes(challenge_type)) {
      return NextResponse.json({ 
        error: 'challenge_type doit être workouts, streak, xp ou distance' 
      }, { status: 400 });
    }

    if (target_value <= 0 || duration_days <= 0) {
      return NextResponse.json({ 
        error: 'target_value et duration_days doivent être positifs' 
      }, { status: 400 });
    }

    // Calculer la date de fin
    const end_date = new Date();
    end_date.setDate(end_date.getDate() + duration_days);

    // Créer le challenge
    const { data: challenge, error } = await supabase
      .from('community_challenges')
      .insert({
        title,
        description,
        challenge_type,
        target_value,
        duration_days,
        end_date,
        is_featured,
        created_by: user.id
      })
      .select(`
        *,
        created_by_user:user_profiles!community_challenges_created_by_fkey (
          username,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la création du challenge:', error);
      return NextResponse.json({ error: 'Erreur lors de la création du challenge' }, { status: 500 });
    }

    return NextResponse.json({ challenge }, { status: 201 });

  } catch (error) {
    console.error('Erreur API création challenge:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 