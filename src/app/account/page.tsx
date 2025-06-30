'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👤 Mon Compte</h1>
          <p className="mt-2 text-gray-600">Gérez vos informations personnelles et paramètres</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations du profil */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations du profil</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Utilisateur</label>
                  <p className="mt-1 text-sm text-gray-500 font-mono">
                    {user.id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de création</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Non disponible'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
              
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full text-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  🏠 Tableau de bord
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  🚪 Se déconnecter
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut du compte</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email vérifié</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.email_confirmed_at 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.email_confirmed_at ? '✅ Vérifié' : '⏳ En attente'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    ✅ Actif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 