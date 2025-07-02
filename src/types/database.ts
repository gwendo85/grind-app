// Types pour la structure JSONB des exercices
export interface Exercise {
  name: string
  sets?: number
  weight?: number
  reps?: number
  notes?: string
  rest?: number // durée de repos personnalisée (en secondes)
}

export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          exercises: Exercise[] // JSONB array d'exercices
          date: string // Date de la séance (peut être future)
          status: 'planned' | 'completed' | 'cancelled' // Status de la séance
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          exercises: Exercise[] // JSONB array d'exercices
          date?: string // Date de la séance (défaut: aujourd'hui)
          status?: 'planned' | 'completed' | 'cancelled' // Status (défaut: 'completed')
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          exercises?: Exercise[] // JSONB array d'exercices
          date?: string // Date de la séance
          status?: 'planned' | 'completed' | 'cancelled' // Status de la séance
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          xp_earned: number
          sessions_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          xp_earned?: number
          sessions_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          xp_earned?: number
          sessions_completed?: number
          created_at?: string
          updated_at?: string
        }
      }
      xp_logs: {
        Row: {
          id: string
          user_id: string
          workout_id: string | null
          xp_points: number
          activity_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id?: string | null
          xp_points?: number
          activity_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string | null
          xp_points?: number
          activity_type?: string
          description?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          bio: string | null
          weight: number | null
          height: number | null
          fitness_level: 'beginner' | 'intermediate' | 'advanced' | null
          goals: string[] | null
          total_xp: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          weight?: number | null
          height?: number | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null
          goals?: string[] | null
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          bio?: string | null
          weight?: number | null
          height?: number | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced' | null
          goals?: string[] | null
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      planned_workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          exercises: Exercise[]
          notes: string | null
          status: string
          created_at: string
          display_date: string
          date_category: 'overdue' | 'today' | 'upcoming' | 'future'
        }
      }
    }
    Functions: {
      calculate_user_total_xp: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
      calculate_user_streak: {
        Args: {
          user_uuid: string
        }
        Returns: {
          current_streak: number
          longest_streak: number
          last_workout_date: string | null
        }[]
      }
      get_weekly_progress: {
        Args: {
          user_uuid: string
          week_start: string
        }
        Returns: {
          workouts_this_week: number
          xp_this_week: number
          consecutive_days: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Types utilitaires pour l'application
export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

export type DailyProgress = Database['public']['Tables']['daily_progress']['Row']
export type DailyProgressInsert = Database['public']['Tables']['daily_progress']['Insert']
export type DailyProgressUpdate = Database['public']['Tables']['daily_progress']['Update']

export type XpLog = Database['public']['Tables']['xp_logs']['Row']
export type XpLogInsert = Database['public']['Tables']['xp_logs']['Insert']
export type XpLogUpdate = Database['public']['Tables']['xp_logs']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type PlannedWorkout = Database['public']['Views']['planned_workouts']['Row']

// Types pour les formulaires
export interface WorkoutFormData {
  name: string
  exercises: Exercise[]
  date: string // Format YYYY-MM-DD
  status: 'planned' | 'completed'
  notes?: string
  duration_minutes?: number
}

export interface UserProfileFormData {
  username?: string
  display_name?: string
  bio?: string
  weight?: number
  height?: number
  fitness_level?: 'beginner' | 'intermediate' | 'advanced'
  goals?: string[]
}

// Types pour les utilitaires
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastWorkoutDate: string | null
}

export interface WeeklyProgress {
  workoutsThisWeek: number
  xpThisWeek: number
  consecutiveDays: number
} 