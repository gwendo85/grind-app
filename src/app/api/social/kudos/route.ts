import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// POST - Ajouter un kudos à un post
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
    const { post_id } = body;

    // Validation
    if (!post_id) {
      return NextResponse.json({ error: 'post_id est requis' }, { status: 400 });
    }

    // Vérifier que le post existe et est accessible
    const { data: post, error: postError } = await supabase
      .from('activity_posts')
      .select('id, user_id, is_public')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return NextResponse.json({ error: 'Post non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions (post public ou propriétaire)
    if (!post.is_public && post.user_id !== user.id) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier si l'utilisateur a déjà donné un kudos
    const { data: existingKudos } = await supabase
      .from('activity_kudos')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single();

    if (existingKudos) {
      return NextResponse.json({ error: 'Kudos déjà donné' }, { status: 400 });
    }

    // Ajouter le kudos
    const { data: kudos, error } = await supabase
      .from('activity_kudos')
      .insert({
        post_id,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout du kudos:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'ajout du kudos' }, { status: 500 });
    }

    // Créer une notification pour l'auteur du post (sauf si c'est lui-même)
    if (post.user_id !== user.id) {
      const { data: authorProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', post.user_id)
        .single();

      await supabase
        .from('user_notifications')
        .insert({
          user_id: post.user_id,
          type: 'kudos',
          title: 'Nouveau kudos ! 💪',
          message: `${user.email?.split('@')[0] || 'Quelqu\'un'} a donné un kudos à votre séance`,
          data: {
            post_id,
            kudos_user_id: user.id,
            kudos_user_name: user.email?.split('@')[0] || 'Utilisateur'
          }
        });
    }

    return NextResponse.json({ kudos }, { status: 201 });

  } catch (error) {
    console.error('Erreur API kudos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un kudos
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');

    // Validation
    if (!post_id) {
      return NextResponse.json({ error: 'post_id est requis' }, { status: 400 });
    }

    // Supprimer le kudos
    const { error } = await supabase
      .from('activity_kudos')
      .delete()
      .eq('post_id', post_id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors de la suppression du kudos:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression du kudos' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Kudos supprimé' });

  } catch (error) {
    console.error('Erreur API suppression kudos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 