import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import Navigation from "@/components/Navigation";
import BadgeSystem from "@/components/BadgeSystem";
import { calculateStreaks } from "@/lib/streakCalculator";

export default async function BadgesPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  const { data: workouts } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: xpLogs } = await supabase
    .from("xp_logs")
    .select("xp_points")
    .eq("user_id", user.id);

  const totalXP = xpLogs?.reduce((sum: number, log: { xp_points: number | null }) => sum + (log.xp_points || 0), 0) || 0;

  // Calcul des streaks
  const streakData = calculateStreaks(workouts || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-white">
      <Navigation />
      <div className="flex flex-col items-center justify-center px-2 py-8 sm:py-12">
        <div className="w-full max-w-2xl mx-auto mt-6 sm:mt-10 px-2 py-6 sm:px-6 sm:py-8 rounded-3xl shadow-2xl backdrop-blur-md bg-white/70 border border-white/30" style={{boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.18)'}}>
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏅 Badges & Réalisations</h1>
            <p className="text-gray-600">Découvre tous les badges disponibles et tes progrès</p>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalXP}</div>
              <div className="text-sm text-gray-600">XP Total</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{workouts?.length || 0}</div>
              <div className="text-sm text-gray-600">Séances</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{streakData.currentStreak}</div>
              <div className="text-sm text-gray-600">Streak Actuel</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{streakData.longestStreak}</div>
              <div className="text-sm text-gray-600">Record Streak</div>
            </div>
          </div>

          {/* Système de badges complet */}
          <BadgeSystem userId={user.id} />

          {/* Informations sur les badges */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Comment débloquer des badges</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🌱</span>
                  <div>
                    <strong>Badges XP :</strong> Gagne des points d&apos;expérience en complétant des séances
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <strong>Badges Séances :</strong> Complète un certain nombre de séances d&apos;entraînement
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🔥</span>
                  <div>
                    <strong>Badges Streak :</strong> Entraîne-toi plusieurs jours consécutifs
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">🏆</span>
                  <div>
                    <strong>Badges Records :</strong> Atteins des records personnels
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Rareté des badges</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <div>
                    <strong>Commun :</strong> Badges faciles à obtenir
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <div>
                    <strong>Rare :</strong> Badges nécessitant de la persévérance
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <div>
                    <strong>Épique :</strong> Badges pour les utilisateurs dédiés
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <div>
                    <strong>Légendaire :</strong> Badges pour les vrais champions
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conseils pour débloquer plus de badges */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">💡 Conseils pour débloquer plus de badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-800">
              <ul className="space-y-2">
                <li>• Entraîne-toi régulièrement pour maintenir ton streak</li>
                <li>• Varie tes exercices pour rester motivé</li>
                <li>• Fixe-toi des objectifs hebdomadaires</li>
                <li>• Suis tes progrès avec attention</li>
              </ul>
              <ul className="space-y-2">
                <li>• Complète les missions hebdomadaires</li>
                <li>• Essaie de nouveaux types d&apos;exercices</li>
                <li>• Partage tes succès avec la communauté</li>
                <li>• Ne te décourage pas, la progression prend du temps</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 