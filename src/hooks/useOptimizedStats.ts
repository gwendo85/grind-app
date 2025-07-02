import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStats } from './useUserStats';

interface CachedStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  timestamp: number;
  version: string;
}

interface UseOptimizedStatsOptions {
  cacheDuration?: number; // Durée du cache en millisecondes (défaut: 30 secondes)
  debounceDelay?: number; // Délai de debounce en millisecondes (défaut: 500ms)
  enableCache?: boolean; // Activer/désactiver le cache
  enableDebounce?: boolean; // Activer/désactiver le debounce
}

const CACHE_VERSION = '1.0.0';
const DEFAULT_CACHE_DURATION = 30 * 1000; // 30 secondes
const DEFAULT_DEBOUNCE_DELAY = 500; // 500ms

/**
 * Hook optimisé pour les statistiques utilisateur avec cache et debounce
 * 
 * Ce hook améliore les performances en :
 * - Mettant en cache les données pour éviter les requêtes répétées
 * - Utilisant un debounce pour limiter les appels lors de changements rapides
 * - Gérant intelligemment l'invalidation du cache
 * - Fournissant des métadonnées de performance
 */
export function useOptimizedStats(
  userId: string,
  options: UseOptimizedStatsOptions = {}
) {
  const {
    cacheDuration = DEFAULT_CACHE_DURATION,
    debounceDelay = DEFAULT_DEBOUNCE_DELAY,
    enableCache = true,
    enableDebounce = true,
  } = options;

  // États
  const [cachedStats, setCachedStats] = useState<CachedStats | null>(null);
  const [isCacheValid, setIsCacheValid] = useState(false);
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheMisses, setCacheMisses] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
  });

  // Refs pour le debounce et les timers
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fetchStartTimeRef = useRef<number | null>(null);

  // Hook de base pour les statistiques
  const {
    totalXP,
    currentStreak,
    longestStreak,
    totalWorkouts,
    loading,
    invalidateStats,
  } = useUserStats(userId);

  // Fonction pour vérifier si le cache est valide
  const isCacheValidFn = useCallback((cache: CachedStats): boolean => {
    if (!enableCache) return false;
    
    const now = Date.now();
    const isExpired = now - cache.timestamp > cacheDuration;
    const isVersionValid = cache.version === CACHE_VERSION;
    
    return !isExpired && isVersionValid;
  }, [enableCache, cacheDuration]);

  // Fonction pour mettre en cache les données
  const cacheStats = useCallback((stats: {
    totalXP: number;
    currentStreak: number;
    longestStreak: number;
    totalWorkouts: number;
  }) => {
    if (!enableCache) return;

    const cachedData: CachedStats = {
      ...stats,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    setCachedStats(cachedData);
    setIsCacheValid(true);
    
    // Sauvegarder dans localStorage pour persistance
    try {
      localStorage.setItem(`stats_cache_${userId}`, JSON.stringify(cachedData));
    } catch (error) {
      console.warn('Impossible de sauvegarder le cache dans localStorage:', error);
    }
  }, [enableCache, userId]);

  // Fonction pour charger le cache depuis localStorage
  const loadCacheFromStorage = useCallback(() => {
    if (!enableCache) return null;

    try {
      const cached = localStorage.getItem(`stats_cache_${userId}`);
      if (cached) {
        const parsedCache: CachedStats = JSON.parse(cached);
        if (isCacheValidFn(parsedCache)) {
          setCachedStats(parsedCache);
          setIsCacheValid(true);
          setCacheHits(prev => prev + 1);
          return parsedCache;
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
    }
    
    setCacheMisses(prev => prev + 1);
    return null;
  }, [enableCache, userId, isCacheValidFn]);

  // Fonction pour invalider le cache
  const invalidateCache = useCallback(() => {
    setCachedStats(null);
    setIsCacheValid(false);
    
    try {
      localStorage.removeItem(`stats_cache_${userId}`);
    } catch (error) {
      console.warn('Impossible de supprimer le cache:', error);
    }
  }, [userId]);

  // Fonction pour forcer le rafraîchissement
  const forceRefresh = useCallback(() => {
    invalidateCache();
    invalidateStats();
  }, [invalidateCache, invalidateStats]);

  // Fonction debounced pour mettre à jour les statistiques
  const debouncedUpdateStats = useCallback(() => {
    if (!enableDebounce) {
      cacheStats({ totalXP, currentStreak, longestStreak, totalWorkouts });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      cacheStats({ totalXP, currentStreak, longestStreak, totalWorkouts });
      debounceTimerRef.current = null;
    }, debounceDelay);
  }, [enableDebounce, debounceDelay, cacheStats, totalXP, currentStreak, longestStreak, totalWorkouts]);

  // Effet pour charger le cache au montage
  useEffect(() => {
    const cached = loadCacheFromStorage();
    if (cached) {
      setCacheHits(prev => prev + 1);
    } else {
      setCacheMisses(prev => prev + 1);
    }
  }, [loadCacheFromStorage]);

  // Effet pour mettre à jour les statistiques quand elles changent
  useEffect(() => {
    if (!loading) {
      debouncedUpdateStats();
    }
  }, [loading, debouncedUpdateStats]);

  // Effet pour mesurer les performances
  useEffect(() => {
    if (loading && !fetchStartTimeRef.current) {
      fetchStartTimeRef.current = Date.now();
    } else if (!loading && fetchStartTimeRef.current) {
      const responseTime = Date.now() - fetchStartTimeRef.current;
      fetchStartTimeRef.current = null;
      
      setPerformanceMetrics(prev => {
        const totalRequests = prev.totalRequests + 1;
        const averageResponseTime = (prev.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
        const cacheHitRate = cacheHits / (cacheHits + cacheMisses);
        
        return {
          totalRequests,
          averageResponseTime,
          cacheHitRate,
        };
      });
    }
  }, [loading, cacheHits, cacheMisses]);

  // Nettoyage du timer de debounce
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Déterminer quelles données utiliser
  const effectiveStats = isCacheValid && cachedStats ? cachedStats : {
    totalXP,
    currentStreak,
    longestStreak,
    totalWorkouts,
  };

  return {
    // Données principales
    ...effectiveStats,
    loading,
    
    // Métadonnées de cache
    isFromCache: isCacheValid && cachedStats !== null,
    cacheValid: isCacheValid,
    cacheHits,
    cacheMisses,
    
    // Métadonnées de performance
    performanceMetrics,
    lastFetchTime,
    
    // Actions
    invalidateCache,
    forceRefresh,
    invalidateStats,
  };
} 