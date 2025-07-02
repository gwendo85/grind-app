"use client";
import React from "react";
import UserBadgeMiniList from "@/components/UserBadgeMiniList";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderDashboardClientProps {
  firstName: string;
  avatarUrl: string;
  recentBadges: any[];
  plannedWorkouts: any[];
}

export default function HeaderDashboardClient({ firstName, avatarUrl, recentBadges, plannedWorkouts }: HeaderDashboardClientProps) {
  const router = useRouter();
  const hasPlanned = plannedWorkouts && plannedWorkouts.length > 0;
  const plannedId = hasPlanned ? plannedWorkouts[0].id : null;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 animate-fade-in">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <img
          src={avatarUrl}
          alt="Avatar utilisateur"
          className="rounded-full w-10 h-10 object-cover border-2 border-indigo-400 shadow"
          width={40}
          height={40}
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-gray-900">Bienvenue {firstName} !</span>
          <span className="text-sm text-indigo-600 font-medium">
            💪 Hey {firstName}, c'est le moment de briller ! Ta séance t'attend !
          </span>
        </div>
      </div>
      <div className="flex-1 flex justify-center sm:justify-end w-full">
        <UserBadgeMiniList badges={recentBadges} />
      </div>
      <div className="mt-4 sm:mt-0">
        {hasPlanned && plannedId ? (
          <Link
            href={`/session/${plannedId}`}
            className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:scale-105 transition-transform text-base animate-bounce text-center"
          >
            ⚡ Démarrer ma séance planifiée
          </Link>
        ) : (
          <button
            className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold py-2 px-5 rounded-full shadow-lg text-base opacity-50 cursor-not-allowed"
            disabled
          >
            ⚡ Démarrer ma séance planifiée
          </button>
        )}
        {/* Debug temporaire : afficher l'id de la séance planifiée */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="mt-2 text-xs text-gray-500">plannedId: {String(plannedId)}</div>
        )}
      </div>
    </div>
  );
} 