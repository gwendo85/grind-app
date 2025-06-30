"use client";

import { useEffect, useState, useRef } from "react";

interface XPProgressProps {
  totalXP: number | undefined | null;
}

export default function XPProgress({ totalXP }: XPProgressProps) {
  // Loader si la donnée n'est pas prête
  if (totalXP === undefined || totalXP === null) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white animate-pulse">
        <div className="h-8 w-1/3 bg-white bg-opacity-20 rounded mb-4"></div>
        <div className="h-4 w-2/3 bg-white bg-opacity-10 rounded mb-2"></div>
        <div className="h-3 w-full bg-white bg-opacity-10 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-white bg-opacity-10 rounded"></div>
      </div>
    );
  }

  // Initialisation intelligente
  const [animatedXP, setAnimatedXP] = useState(totalXP);
  const [isAnimating, setIsAnimating] = useState(false);
  const [barProgress, setBarProgress] = useState(0);
  const firstRender = useRef(true);
  const barRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Animation fluide de l'XP (sauf au premier mount)
  useEffect(() => {
    if (firstRender.current) {
      setAnimatedXP(totalXP);
      setBarProgress(calculateLevel(totalXP).progress);
      firstRender.current = false;
      return;
    }
    if (totalXP !== animatedXP) {
      setIsAnimating(true);
      if (barRef.current) {
        barRef.current.classList.add('animate-xp');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          barRef.current && barRef.current.classList.remove('animate-xp');
        }, 500);
      }
      const startXP = animatedXP;
      const endXP = totalXP;
      const duration = 1000; // 1 seconde
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fonction d'easing pour une animation plus naturelle
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentXP = Math.floor(startXP + (endXP - startXP) * easeOutQuart);
        
        setAnimatedXP(currentXP);
        setBarProgress(calculateLevel(currentXP).progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedXP(endXP);
          setBarProgress(calculateLevel(endXP).progress);
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [totalXP]);

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-bounce">⭐</div>
          <div>
            <div className="gradient-card-text-overlay">
              <h2 className="text-2xl font-bold text-on-gradient">Niveau {levelData.level}</h2>
              <p className="text-on-gradient text-sm mt-1">{animatedXP.toLocaleString()} XP total</p>
            </div>
          </div>
        </div>
        
        {/* Badge de niveau avec animation */}
        <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
          <div className="bg-white bg-opacity-20 rounded-full p-3">
            <div className="text-2xl font-bold text-center text-on-gradient">
              {levelData.level}
            </div>
          </div>
          {isAnimating && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          )}
        </div>
      </div>

      {/* Barre de progression avec animation */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-on-gradient">Progression vers le niveau {levelData.level + 1}</span>
          <span className="font-medium text-on-gradient">
            {Math.floor(barProgress)}%
          </span>
        </div>
        
        <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div 
            ref={barRef}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${barProgress}%` }}
          >
            {/* Effet de brillance */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
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

      {/* Indicateur de progression récente */}
      {isAnimating && (
        <div className="mt-3 p-2 bg-white bg-opacity-10 rounded-lg text-center animate-fade-in">
          <p className="text-sm text-yellow-300">
            🚀 +{(totalXP - animatedXP).toLocaleString('fr-FR')} XP gagné !
          </p>
        </div>
      )}
    </div>
  );
} 