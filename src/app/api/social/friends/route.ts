import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les amis et demandes d'amis
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
    const status = searchParams.get('status'); // 'accepted', 'pending', 'sent'

    // Construire la requête selon le statut demandé
    let query;
    
    if (status === 'pending') {
      // Demandes reçues en attente
      query = supabase
        .from('user_friends')
        .select(`
          *,
          requester:user_profiles!user_friends_user_id_fkey (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending');
    } else if (status === 'sent') {
      // Demandes envoyées en attente
      query = supabase
        .from('user_friends')
        .select(`
          *,
          recipient:user_profiles!user_friends_friend_id_fkey (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');
    } else {
      // Amis acceptés (par défaut)
      query = supabase
        .from('user_friends')
        .select(`
          *,
          friend:user_profiles!user_friends_friend_id_fkey (
            id,
            username,
            avatar_url,
            email
          ),
          user_profile:user_profiles!user_friends_user_id_fkey (
            id,
            username,
            avatar_url,
            email
          )
        `)
        .eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    }

    const { data: friendships, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des amis:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Formater les données pour une utilisation plus facile
    const formattedFriendships = friendships?.map(friendship => {
      if (status === 'pending') {
        return {
          id: friendship.id,
          status: friendship.status,
          created_at: friendship.created_at,
          user: friendship.requester
        };
      } else if (status === 'sent') {
        return {
          id: friendship.id,
          status: friendship.status,
          created_at: friendship.created_at,
          user: friendship.recipient
        };
      } else {
        // Amis acceptés
        const isUserRequester = friendship.user_id === user.id;
        return {
          id: friendship.id,
          status: friendship.status,
          created_at: friendship.created_at,
          user: isUserRequester ? friendship.friend : friendship.user_profile
        };
      }
    });

    return NextResponse.json({ friendships: formattedFriendships });

  } catch (error) {
    console.error('Erreur API friends:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Envoyer une demande d'ami
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
    const { friend_id } = body;

    // Validation
    if (!friend_id) {
      return NextResponse.json({ error: 'friend_id est requis' }, { status: 400 });
    }

    if (friend_id === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous ajouter vous-même' }, { status: 400 });
    }

    // Vérifier que l'utilisateur cible existe
    const { data: targetUser, error: userError } = await supabase
      .from('user_profiles')
      .select('id, username')
      .eq('id', friend_id)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier si une relation existe déjà
    const { data: existingFriendship } = await supabase
      .from('user_friends')
      .select('*')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user.id})`)
      .single();

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return NextResponse.json({ error: 'Vous êtes déjà amis' }, { status: 400 });
      } else if (existingFriendship.status === 'pending') {
        return NextResponse.json({ error: 'Une demande d\'ami est déjà en attente' }, { status: 400 });
      } else if (existingFriendship.status === 'blocked') {
        return NextResponse.json({ error: 'Cette relation est bloquée' }, { status: 400 });
      }
    }

    // Créer la demande d'ami
    const { data: friendship, error } = await supabase
      .from('user_friends')
      .insert({
        user_id: user.id,
        friend_id,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la demande d\'ami:', error);
      return NextResponse.json({ error: 'Erreur lors de la création de la demande d\'ami' }, { status: 500 });
    }

    // Créer une notification pour l'utilisateur cible
    await supabase
      .from('user_notifications')
      .insert({
        user_id: friend_id,
        type: 'friend_request',
        title: 'Nouvelle demande d\'ami 👋',
        message: `${user.email?.split('@')[0] || 'Quelqu\'un'} souhaite devenir votre ami sur GRIND`,
        data: {
          requester_id: user.id,
          requester_name: user.email?.split('@')[0] || 'Utilisateur',
          friendship_id: friendship.id
        }
      });

    return NextResponse.json({ friendship }, { status: 201 });

  } catch (error) {
    console.error('Erreur API demande ami:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 