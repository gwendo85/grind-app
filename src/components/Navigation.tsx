"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await fetchProfile(user.id);
      }
    };

    getUser();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <span className="text-xl font-bold text-gray-900">GRIND</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              🏠 Dashboard
            </Link>
            
            <Link
              href="/social"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/social")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              👥 Communauté
            </Link>
            
            <Link
              href="/badges"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/badges")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              🏅 Badges
            </Link>

            {/* Profile Icon */}
            <Link
              href="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/profile")
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
              title={profile?.display_name || user?.email || 'Profil'}
            >
              <div className="w-8 h-8 rounded-full border border-white/70 shadow bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name ? `Avatar de ${profile.display_name}` : 'Avatar'}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <span className="hidden sm:inline text-gray-700 text-xs font-medium max-w-[80px] truncate">{profile?.display_name || user?.email}</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
