'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function SupabaseAuth() {
  return (
    <div className="max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#6366f1',
                brandAccent: '#4f46e5',
                brandButtonText: 'white',
                defaultButtonBackground: '#ffffff',
                defaultButtonBackgroundHover: '#f9fafb',
                defaultButtonBorder: '#d1d5db',
                defaultButtonText: '#374151',
                dividerBackground: '#e5e7eb',
                inputBackground: '#ffffff',
                inputBorder: '#d1d5db',
                inputBorderHover: '#9ca3af',
                inputBorderFocus: '#6366f1',
                inputText: '#374151',
                inputLabelText: '#6b7280',
                inputPlaceholder: '#9ca3af',
                messageText: '#374151',
                messageTextDanger: '#dc2626',
                anchorTextColor: '#6366f1',
                anchorTextHoverColor: '#4f46e5',
              },
              space: {
                inputPadding: '12px',
                buttonPadding: '12px 16px',
              },
              fontSizes: {
                baseBodySize: '14px',
                baseInputSize: '14px',
                baseLabelSize: '14px',
                baseButtonSize: '14px',
              },
              fonts: {
                bodyFontFamily: 'Inter, system-ui, sans-serif',
                buttonFontFamily: 'Inter, system-ui, sans-serif',
                inputFontFamily: 'Inter, system-ui, sans-serif',
                labelFontFamily: 'Inter, system-ui, sans-serif',
              },
              borderWidths: {
                buttonBorderWidth: '1px',
                inputBorderWidth: '1px',
              },
              radii: {
                borderRadiusButton: '6px',
                buttonBorderRadius: '6px',
                inputBorderRadius: '6px',
              },
            },
          },
        }}
        providers={['google', 'github']}
        redirectTo={`${window.location.origin}/dashboard`}
        showLinks={true}
        view="sign_in"
        localization={{
          variables: {
            sign_in: {
              email_label: 'Adresse email',
              password_label: 'Mot de passe',
              button_label: 'Se connecter',
              loading_button_label: 'Connexion...',
              social_provider_text: 'Se connecter avec {{provider}}',
              link_text: 'Déjà un compte ? Se connecter',
            },
            sign_up: {
              email_label: 'Adresse email',
              password_label: 'Mot de passe',
              button_label: 'S\'inscrire',
              loading_button_label: 'Inscription...',
              social_provider_text: 'S\'inscrire avec {{provider}}',
              link_text: 'Pas de compte ? S\'inscrire',
            },
            forgotten_password: {
              email_label: 'Adresse email',
              button_label: 'Envoyer les instructions de réinitialisation',
              loading_button_label: 'Envoi...',
              link_text: 'Mot de passe oublié ?',
            },
            update_password: {
              password_label: 'Nouveau mot de passe',
              button_label: 'Mettre à jour le mot de passe',
              loading_button_label: 'Mise à jour...',
            },
          },
        }}
      />
    </div>
  )
} 