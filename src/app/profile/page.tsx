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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <div className="flex flex-col items-center justify-center px-2 py-8 sm:py-12">
        <div className="w-full max-w-2xl mx-auto mt-6 sm:mt-10 px-2 py-6 sm:px-6 sm:py-8">
          <ProfileClient 
            userId={user.id}
            profile={profile}
            user={user}
          />
        </div>
      </div>
    </div>
  );
} 