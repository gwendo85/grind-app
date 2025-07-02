import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SocialFeed from '@/components/SocialFeed';

export default async function SocialPage() {
  const cookieStore = cookies();
  const supabase = await createClient();
  
  // Vérifier l'authentification
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Communauté GRIND
          </h1>
          <p className="text-gray-600">
            Connecte-toi avec tes amis et motive-toi ensemble
          </p>
        </div>

        {/* Navigation des onglets */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <a
                href="#"
                className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Feed d'activité
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Mes amis
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Défis
              </a>
              <a
                href="#"
                className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
              >
                Statistiques
              </a>
            </nav>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed principal */}
          <div className="lg:col-span-2">
            <SocialFeed userId={user.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggestions d'amis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Suggestions d'amis
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Emma", avatar: "/default-avatar.png", mutualFriends: 3 },
                  { name: "Thomas", avatar: "/default-avatar.png", mutualFriends: 5 },
                  { name: "Lisa", avatar: "/default-avatar.png", mutualFriends: 2 }
                ].map((friend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={friend.avatar} 
                        alt={friend.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{friend.name}</div>
                        <div className="text-sm text-gray-500">{friend.mutualFriends} amis en commun</div>
                      </div>
                    </div>
                    <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Défis populaires */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Défis populaires
              </h3>
              <div className="space-y-3">
                {[
                  { title: "Défi 100 jours", participants: 234, type: "workouts" },
                  { title: "Streak de 30 jours", participants: 156, type: "streak" },
                  { title: "10k XP en 1 mois", participants: 89, type: "xp" }
                ].map((challenge, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                      <span className="text-sm text-gray-500">{challenge.participants} participants</span>
                    </div>
                    <button className="w-full text-sm bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors">
                      Voir le défi
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques personnelles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mes statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Séances cette semaine</span>
                  <span className="font-semibold text-gray-900">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Streak actuel</span>
                  <span className="font-semibold text-gray-900">7 jours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP gagné</span>
                  <span className="font-semibold text-gray-900">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kudos reçus</span>
                  <span className="font-semibold text-gray-900">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 