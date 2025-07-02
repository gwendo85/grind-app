'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type SessionStatus = 'idle' | 'started' | 'paused' | 'ended'

interface Session {
  id: string
  user_id: string
  start_time: string
  end_time?: string
  status: SessionStatus
  duration?: number
  workout_id?: string
}

export function useSessionManager() {
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Timer pour calculer la durée en temps réel
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (status === 'started' && currentSession?.start_time) {
      interval = setInterval(() => {
        const startTime = new Date(currentSession.start_time).getTime()
        const now = new Date().getTime()
        const elapsed = Math.floor((now - startTime) / 1000)
        setDuration(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status, currentSession?.start_time])

  async function startSession(workoutId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Utilisateur non connecté.')
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        start_time: new Date().toISOString(),
        status: 'started',
        workout_id: workoutId
      })
      .select()
      .single()

    if (error) throw error

    setSessionId(data.id)
    setCurrentSession(data)
    setStatus('started')
    setDuration(0)

    return data
  }

  async function pauseSession() {
    if (!sessionId) throw new Error('Aucune session active.')

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'paused' })
      .eq('id', sessionId)

    if (error) throw error

    setStatus('paused')
  }

  async function resumeSession() {
    if (!sessionId) throw new Error('Aucune session active.')

    const { error } = await supabase
      .from('sessions')
      .update({ status: 'started' })
      .eq('id', sessionId)

    if (error) throw error

    setStatus('started')
  }

  async function endSession() {
    if (!sessionId) throw new Error('Aucune session active.')

    const { data, error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        status: 'ended'
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    // Calcul automatique de la durée finale
    if (data.start_time && data.end_time) {
      const finalDuration = Math.floor(
        (new Date(data.end_time).getTime() - new Date(data.start_time).getTime()) / 1000
      )

      await supabase
        .from('sessions')
        .update({ duration: finalDuration })
        .eq('id', sessionId)

      setDuration(finalDuration)
    }

    setStatus('ended')
    setSessionId(null)
    setCurrentSession(null)

    return data
  }

  // Récupérer une session existante
  async function loadSession(sessionId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) throw error

    setSessionId(data.id)
    setCurrentSession(data)
    setStatus(data.status)

    // Calculer la durée si la session est en cours
    if (data.status === 'started' && data.start_time) {
      const startTime = new Date(data.start_time).getTime()
      const now = new Date().getTime()
      const elapsed = Math.floor((now - startTime) / 1000)
      setDuration(elapsed)
    } else if (data.duration) {
      setDuration(data.duration)
    }

    return data
  }

  // Formater la durée en format lisible
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return {
    // États
    status,
    sessionId,
    currentSession,
    duration,
    
    // Actions
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    loadSession,
    
    // Utilitaires
    formatDuration,
    
    // Getters
    isActive: status === 'started',
    isPaused: status === 'paused',
    isEnded: status === 'ended',
    isIdle: status === 'idle'
  }
} 