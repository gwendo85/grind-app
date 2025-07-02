import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/ProfileClient';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = await createClient();
  
  // Vérifier l'authentification
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Récupérer les données du profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileClient 
        userId={user.id}
        profile={profile}
        user={user}
      />
    </div>
  );
} 