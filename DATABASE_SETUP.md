# 🗄️ Configuration de la Base de Données GRIND

## 📋 Prérequis

1. **Projet Supabase créé** sur [supabase.com](https://supabase.com)
2. **Variables d'environnement configurées** dans `.env.local`

## 🚀 Étapes de Configuration

### 1. Configuration des Variables d'Environnement

Crée ou modifie le fichier `.env.local` dans le dossier `grind-app` :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Où trouver ces valeurs :**
- Va dans ton projet Supabase
- Settings > API
- Copie les URLs et clés

### 2. Création des Tables dans Supabase

#### Option A : Via SQL Editor (Recommandé)

1. **Connecte-toi à ton projet Supabase**
2. **Va dans SQL Editor**
3. **Copie tout le contenu du fichier `supabase-schema.sql`**
4. **Colle et exécute le script**

#### Option B : Via Table Editor

Si tu préfères créer les tables manuellement :

##### Table `workouts`
```
Column          Type        Default             Notes
id              uuid        uuid_generate_v4()  Primary Key
user_id         uuid                            Foreign Key vers auth.users
date            date        now()               Date de la séance
exercise        text                            Nom de l'exercice
weight          numeric                          Poids utilisé (kg)
reps            integer                          Nombre de répétitions
sets            integer                          Nombre de séries
duration_minutes integer                         Durée en minutes (cardio)
notes           text                            Notes facultatives
created_at      timestamp   now()
updated_at      timestamp   now()
```

##### Table `xp_logs`
```
Column          Type        Default             Notes
id              uuid        uuid_generate_v4()  Primary Key
user_id         uuid                            Foreign Key vers auth.users
workout_id      uuid                            Foreign Key vers workouts
xp_points       integer     0                   Points d'expérience
activity_type   text                            Type d'activité
description     text                            Description
created_at      timestamp   now()
```

##### Table `user_profiles`
```
Column          Type        Default             Notes
id              uuid                            Primary Key, FK vers auth.users
username        text        UNIQUE              Nom d'utilisateur unique
display_name    text                            Nom d'affichage
bio             text                            Biographie
weight          numeric                          Poids actuel (kg)
height          integer                          Taille (cm)
fitness_level   text                            Niveau (beginner/intermediate/advanced)
goals           text[]                          Array des objectifs
total_xp        integer     0                   Total XP
current_streak  integer     0                   Série actuelle
longest_streak  integer     0                   Plus longue série
created_at      timestamp   now()
updated_at      timestamp   now()
```

### 3. Configuration des Politiques RLS

**Important :** Active Row Level Security (RLS) sur toutes les tables et configure les politiques.

#### Politiques pour `workouts`
```sql
-- Lecture
CREATE POLICY "Allow user to read their workouts" ON workouts
FOR SELECT USING (auth.uid() = user_id);

-- Insertion
CREATE POLICY "Allow user to insert their workouts" ON workouts
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour
CREATE POLICY "Allow user to update their workouts" ON workouts
FOR UPDATE USING (auth.uid() = user_id);

-- Suppression
CREATE POLICY "Allow user to delete their workouts" ON workouts
FOR DELETE USING (auth.uid() = user_id);
```

#### Politiques pour `xp_logs`
```sql
-- Lecture
CREATE POLICY "Allow user to read their xp logs" ON xp_logs
FOR SELECT USING (auth.uid() = user_id);

-- Insertion
CREATE POLICY "Allow user to insert their xp logs" ON xp_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mise à jour
CREATE POLICY "Allow user to update their xp logs" ON xp_logs
FOR UPDATE USING (auth.uid() = user_id);

-- Suppression
CREATE POLICY "Allow user to delete their xp logs" ON xp_logs
FOR DELETE USING (auth.uid() = user_id);
```

#### Politiques pour `user_profiles`
```sql
-- Lecture
CREATE POLICY "Allow user to read their profile" ON user_profiles
FOR SELECT USING (auth.uid() = id);

-- Insertion
CREATE POLICY "Allow user to insert their profile" ON user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Mise à jour
CREATE POLICY "Allow user to update their profile" ON user_profiles
FOR UPDATE USING (auth.uid() = id);

-- Suppression
CREATE POLICY "Allow user to delete their profile" ON user_profiles
FOR DELETE USING (auth.uid() = id);
```

## ✅ Vérification

Après avoir exécuté le script SQL :

1. **Vérifie dans Table Editor** que les 3 tables sont créées
2. **Vérifie dans Authentication > Policies** que les politiques RLS sont actives
3. **Teste l'application** en créant un compte et en ajoutant un workout

## 🔧 Utilisation dans l'Application

Les types TypeScript sont déjà configurés dans `src/types/database.ts`.

Exemple d'utilisation :

```typescript
import { supabase } from '@/lib/supabase'
import type { WorkoutInsert } from '@/types/database'

// Ajouter un workout
const addWorkout = async (workout: WorkoutInsert) => {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workout)
    .select()
  
  if (error) throw error
  return data
}

// Récupérer les workouts de l'utilisateur
const getWorkouts = async () => {
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('date', { ascending: false })
  
  if (error) throw error
  return data
}
```

## 🚨 Dépannage

### Erreur "relation does not exist"
- Vérifie que le script SQL a été exécuté complètement
- Vérifie que tu es dans le bon projet Supabase

### Erreur "permission denied"
- Vérifie que RLS est activé sur les tables
- Vérifie que les politiques sont correctement configurées
- Vérifie que l'utilisateur est authentifié

### Erreur de connexion
- Vérifie les variables d'environnement dans `.env.local`
- Vérifie que les clés Supabase sont correctes

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Types TypeScript](https://supabase.com/docs/guides/api/typescript-support) 