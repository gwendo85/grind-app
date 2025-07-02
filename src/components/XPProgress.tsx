"use client";

import { useEffect, useState, useRef } from "react";
import { useUserStats } from "../hooks/useUserStats";

interface XPProgressProps {
  userId: string;
}

export default function XPProgress({ userId }: XPProgressProps) {
  const { totalXP, loading } = useUserStats(userId);

  // ✅ VERSION FIGÉE - AUCUNE ANIMATION
  const [animatedXP, setAnimatedXP] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const firstRender = useRef(true);

  // Calculer le niveau et la progression
  const calculateLevel = (xp: number) => {
    const baseXP = 1000; // XP nécessaire pour le niveau 1
    const level = Math.floor(Math.sqrt(xp / baseXP)) + 1;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * baseXP;
    const xpForNextLevel = Math.pow(level, 2) * baseXP;
    const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    
    return {
      level,
      progress: Math.min(progress, 100),
      xpForCurrentLevel,
      xpForNextLevel,
      xpNeeded: xpForNextLevel - xp
    };
  };

  const levelData = calculateLevel(animatedXP);

  // ✅ MISE À JOUR SIMPLE SANS ANIMATION
  useEffect(() => {
    if (firstRender.current) {
      setAnimatedXP(totalXP || 0);
      setBarProgress(calculateLevel(totalXP || 0).progress);
      firstRender.current = false;
      return;
    }
    
    // Mise à jour directe sans animation
    setAnimatedXP(totalXP || 0);
    setBarProgress(calculateLevel(totalXP || 0).progress);
  }, [totalXP]);

  // ✅ SKELETON LOADER STATIQUE
  if (loading || totalXP === undefined || totalXP === null) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white" style={{ minHeight: '160px' }}>
        {/* Header avec étoile et niveau */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⭐</div>
            <div>
              <div className="h-8 w-24 bg-white bg-opacity-20 rounded mb-1"></div>
              <div className="h-4 w-20 bg-white bg-opacity-10 rounded"></div>
            </div>
          </div>
          
          {/* Badge de niveau skeleton */}
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
          </div>
        </div>

        {/* Barre de progression skeleton */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <div className="h-4 w-32 bg-white bg-opacity-20 rounded"></div>
            <div className="h-4 w-8 bg-white bg-opacity-20 rounded"></div>
          </div>
          
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <div className="bg-white bg-opacity-30 h-3 rounded-full w-1/3"></div>
          </div>
          
          <div className="flex justify-between text-xs mt-1">
            <div className="h-3 w-12 bg-white bg-opacity-10 rounded"></div>
            <div className="h-3 w-12 bg-white bg-opacity-10 rounded"></div>
          </div>
        </div>

        {/* Message skeleton */}
        <div className="text-center">
          <div className="h-4 w-48 bg-white bg-opacity-10 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white" style={{ minHeight: '160px' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">⭐</div>
          <div>
            <div className="gradient-card-text-overlay">
              <h2 className="text-2xl font-bold text-on-gradient">Niveau {levelData.level}</h2>
              <p className="text-on-gradient text-sm mt-1">{animatedXP.toLocaleString()} XP total</p>
            </div>
          </div>
        </div>
        
        {/* Badge de niveau statique */}
        <div className="relative">
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <div className="text-2xl font-bold text-center text-on-gradient">
              {levelData.level}
            </div>
          </div>
        </div>
      </div>

      {/* Barre de progression statique */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-on-gradient">Progression vers le niveau {levelData.level + 1}</span>
          <span className="font-medium text-on-gradient">
            {Math.floor(barProgress)}%
          </span>
        </div>
        
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full relative"
            style={{ width: `${barProgress}%` }}
          >
          </div>
        </div>
        
        <div className="flex justify-between text-xs mt-1 text-blue-100">
          <span> {levelData.xpForCurrentLevel.toLocaleString('fr-FR')} XP</span>
          <span> {levelData.xpForNextLevel.toLocaleString('fr-FR')} XP</span>
        </div>
      </div>

      {/* Message de motivation */}
      <div className="text-center">
        <p className="text-on-gradient text-sm">
          {levelData.xpNeeded > 0 
            ? `Plus que ${levelData.xpNeeded.toLocaleString('fr-FR')} XP pour le niveau ${levelData.level + 1} ! 💪`
            : `Niveau ${levelData.level} atteint ! 🎉`
          }
        </p>
      </div>
    </div>
  );
} 