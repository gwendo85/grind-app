import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST - Répondre à une demande d'ami (accepter/refuser)
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
    const { friendship_id, action } = body; // action: 'accept' ou 'decline'

    // Validation
    if (!friendship_id || !action) {
      return NextResponse.json({ error: 'friendship_id et action sont requis' }, { status: 400 });
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'action doit être accept ou decline' }, { status: 400 });
    }

    // Vérifier que la demande d'ami existe et appartient à l'utilisateur
    const { data: friendship, error: friendshipError } = await supabase
      .from('user_friends')
      .select('*')
      .eq('id', friendship_id)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .single();

    if (friendshipError || !friendship) {
      return NextResponse.json({ error: 'Demande d\'ami non trouvée ou non autorisée' }, { status: 404 });
    }

    // Mettre à jour le statut de la relation
    const newStatus = action === 'accept' ? 'accepted' : 'blocked';
    
    const { data: updatedFriendship, error: updateError } = await supabase
      .from('user_friends')
      .update({ status: newStatus })
      .eq('id', friendship_id)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la relation:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour de la relation' }, { status: 500 });
    }

    // Récupérer les informations de l'utilisateur qui a envoyé la demande
    const { data: requester } = await supabase
      .from('user_profiles')
      .select('username, email')
      .eq('id', friendship.user_id)
      .single();

    // Créer une notification pour l'utilisateur qui a envoyé la demande
    if (action === 'accept') {
      await supabase
        .from('user_notifications')
        .insert({
          user_id: friendship.user_id,
          type: 'friend_request',
          title: 'Demande d\'ami acceptée ! 🎉',
          message: `${user.email?.split('@')[0] || 'Quelqu\'un'} a accepté votre demande d'ami`,
          data: {
            responder_id: user.id,
            responder_name: user.email?.split('@')[0] || 'Utilisateur',
            friendship_id: friendship.id
          }
        });
    }

    return NextResponse.json({ 
      friendship: updatedFriendship,
      action,
      message: action === 'accept' ? 'Demande d\'ami acceptée' : 'Demande d\'ami refusée'
    });

  } catch (error) {
    console.error('Erreur API réponse demande ami:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 