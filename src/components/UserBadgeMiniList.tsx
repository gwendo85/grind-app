import React from "react";

interface BadgeMini {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string; // date ISO
}

interface UserBadgeMiniListProps {
  badges: BadgeMini[];
}

export default function UserBadgeMiniList({ badges }: UserBadgeMiniListProps) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="flex gap-3 items-center mt-2 mb-4">
      {badges.slice(0, 3).map((badge) => (
        <div key={badge.id} className="flex flex-col items-center text-xs">
          <span className="text-2xl mb-1" title={badge.name}>{badge.icon}</span>
          <span className="font-medium text-gray-800 truncate max-w-[60px]">{badge.name}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            {new Date(badge.unlockedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  );
} 