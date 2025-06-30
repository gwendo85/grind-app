'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useSupabase'
import SupabaseAuth from '@/components/SupabaseAuth'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [view, setView] = useState<'sign_in' | 'sign_up'>('sign_in')

  // Rediriger si l'utilisateur est déjà connecté
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 GRIND
          </h1>
          <p className="text-xl text-gray-600">
            {view === 'sign_in' ? 'Connexion à votre compte' : 'Créer votre compte'}
          </p>
        </div>

        {/* Toggle entre connexion et inscription */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex">
            <button
              onClick={() => setView('sign_in')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-l-lg transition-colors ${
                view === 'sign_in'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔐 Connexion
            </button>
            <button
              onClick={() => setView('sign_up')}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-r-lg transition-colors ${
                view === 'sign_up'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✨ Inscription
            </button>
          </div>
        </div>

        {/* Composant d'authentification Supabase */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <SupabaseAuth />
        </div>

        {/* Informations supplémentaires */}
        <div className="text-center text-sm text-gray-500">
          <p>En continuant, vous acceptez nos conditions d&apos;utilisation</p>
          <p className="mt-1">et notre politique de confidentialité</p>
        </div>
      </div>
    </div>
  )
} 