"use server"

import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction({ username, bio, avatar_url }: {
  username?: string
  bio?: string
  avatar_url?: string
}) {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'Utilisateur non connecté.' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      ...(username && { username }),
      ...(bio && { bio }),
      ...(avatar_url && { avatar_url })
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: 'Profil mis à jour avec succès.' }
} 