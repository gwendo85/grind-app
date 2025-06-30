"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Auth
        supabaseClient={supabase}
        view="sign_up"
        appearance={{ theme: ThemeSupa }}
        providers={["google"]}
        redirectTo="/dashboard"
      />
    </div>
  );
} 