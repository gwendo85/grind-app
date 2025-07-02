'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useSupabase'

export default function SupabaseTest() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (error) {
        setMessage(`Erreur: ${error.message}`)
      } else {
        setMessage(isSignUp ? 'Inscription réussie ! Vérifiez votre email.' : 'Connexion réussie !')
        setEmail('')
        setPassword('')
      }
    } catch (error) {
      setMessage(`Erreur: ${error}`)
    }
  }

  if (loading) {
    return <div className="text-center p-4">Chargement...</div>
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {user ? 'Profil Utilisateur' : 'Authentification Supabase'}
      </h2>

      {user ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Dernière connexion:</strong> {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full max-w-xs h-9 px-3 py-1 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full max-w-xs h-9 px-3 py-1 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {message && (
            <div className={`p-3 rounded ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
          >
            {isSignUp ? 'S\'inscrire' : 'Se connecter'}
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-blue-500 hover:text-blue-600 text-sm"
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </form>
      )}
    </div>
  )
} 