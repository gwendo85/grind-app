import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST - Rejoindre un challenge
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
    const { challenge_id } = body;

    // Validation
    if (!challenge_id) {
      return NextResponse.json({ error: 'challenge_id est requis' }, { status: 400 });
    }

    // Vérifier que le challenge existe et est actif
    const { data: challenge, error: challengeError } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('id', challenge_id)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge non trouvé ou inactif' }, { status: 404 });
    }

    // Vérifier si l'utilisateur participe déjà
    const { data: existingParticipation } = await supabase
      .from('challenge_participants')
      .select('id')
      .eq('challenge_id', challenge_id)
      .eq('user_id', user.id)
      .single();

    if (existingParticipation) {
      return NextResponse.json({ error: 'Vous participez déjà à ce challenge' }, { status: 400 });
    }

    // Calculer le progrès initial basé sur le type de challenge
    let initialProgress = 0;

    if (challenge.challenge_type === 'workouts') {
      // Compter les workouts récents
      const { count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - challenge.duration_days * 24 * 60 * 60 * 1000).toISOString());
      
      initialProgress = count || 0;
    } else if (challenge.challenge_type === 'xp') {
      // Récupérer l'XP actuel de l'utilisateur
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('total_xp')
        .eq('user_id', user.id)
        .single();
      
      initialProgress = userStats?.total_xp || 0;
    } else if (challenge.challenge_type === 'streak') {
      // Récupérer le streak actuel
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('current_streak')
        .eq('user_id', user.id)
        .single();
      
      initialProgress = userStats?.current_streak || 0;
    }

    // Rejoindre le challenge
    const { data: participation, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id,
        user_id: user.id,
        current_progress: initialProgress,
        is_completed: initialProgress >= challenge.target_value
      })
      .select(`
        *,
        challenge:community_challenges (
          title,
          description,
          challenge_type,
          target_value
        )
      `)
      .single();

    if (error) {
      console.error('Erreur lors de la participation au challenge:', error);
      return NextResponse.json({ error: 'Erreur lors de la participation au challenge' }, { status: 500 });
    }

    // Créer une notification si le challenge est complété immédiatement
    if (participation.is_completed) {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type: 'challenge_complete',
          title: 'Challenge complété ! 🎉',
          message: `Félicitations ! Vous avez complété le challenge "${challenge.title}"`,
          data: {
            challenge_id,
            challenge_title: challenge.title
          }
        });
    }

    return NextResponse.json({ participation }, { status: 201 });

  } catch (error) {
    console.error('Erreur API join challenge:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 