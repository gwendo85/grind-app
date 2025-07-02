import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Récupérer les notifications de l'utilisateur
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
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';
    const offset = (page - 1) * limit;

    // Construire la requête
    let query = supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }

    // Récupérer le nombre total de notifications
    let countQuery = supabase
      .from('user_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (unreadOnly) {
      countQuery = countQuery.eq('is_read', false);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Marquer les notifications comme lues
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_ids, mark_all = false } = body;

    // Validation
    if (!mark_all && (!notification_ids || !Array.isArray(notification_ids))) {
      return NextResponse.json({ error: 'notification_ids doit être un tableau ou mark_all doit être true' }, { status: 400 });
    }

    let updateQuery = supabase
      .from('user_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id);

    if (!mark_all) {
      updateQuery = updateQuery.in('id', notification_ids);
    }

    const { error } = await updateQuery;

    if (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour des notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: mark_all ? 'Toutes les notifications marquées comme lues' : 'Notifications marquées comme lues'
    });

  } catch (error) {
    console.error('Erreur API marquer notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer des notifications
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
    const notification_id = searchParams.get('id');
    const delete_all = searchParams.get('all') === 'true';

    if (!delete_all && !notification_id) {
      return NextResponse.json({ error: 'id ou all=true est requis' }, { status: 400 });
    }

    let deleteQuery = supabase
      .from('user_notifications')
      .delete()
      .eq('user_id', user.id);

    if (!delete_all) {
      deleteQuery = deleteQuery.eq('id', notification_id);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
      return NextResponse.json({ error: 'Erreur lors de la suppression des notifications' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: delete_all ? 'Toutes les notifications supprimées' : 'Notification supprimée'
    });

  } catch (error) {
    console.error('Erreur API suppression notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 