"use client";
import React from "react";
import UserBadgeMiniList from "@/components/UserBadgeMiniList";
import { useRouter } from "next/navigation";

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
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return `☀️ Commence ta journée avec une séance, ${firstName} !`;
              if (hour < 18) return `🚀 Une pause GRIND cet après-midi ?`;
              return `🌙 Finis ta journée en force, ${firstName} !`;
            })()}
          </span>
        </div>
      </div>
      <div className="flex-1 flex justify-center sm:justify-end w-full">
        <UserBadgeMiniList badges={recentBadges} />
      </div>
      <div className="mt-4 sm:mt-0">
        {hasPlanned ? (
          <button
            onClick={() => router.push(`/session/${plannedId}`)}
            className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:scale-105 transition-transform text-base animate-bounce"
          >
            ⚡ Démarrer ma séance planifiée
          </button>
        ) : (
          <button
            onClick={() => router.push('/new-workout')}
            className="inline-block bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white font-bold py-2 px-5 rounded-full shadow-lg hover:scale-105 transition-transform text-base animate-bounce"
          >
            🚀 Démarrer une séance
          </button>
        )}
      </div>
    </div>
  );
} 