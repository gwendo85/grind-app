# 🚀 Guide de Migration GRIND - Structure JSONB

## 📋 Résumé des Changements

**Problème identifié :** La base de données attend un champ `exercises` (JSONB) mais le code envoyait `exercise` (TEXT).

**Solution :** Migration vers une structure JSONB permettant plusieurs exercices par séance.

## 🔄 Changements Effectués

### 1. Structure de Données
- **Avant :** `exercise: string, weight: number, reps: number, sets: number`
- **Après :** `exercises: [{ name: string, weight: number, reps: number, notes: string }]`

### 2. Avantages de la Nouvelle Structure
- ✅ Plusieurs exercices par séance
- ✅ Notes spécifiques par exercice
- ✅ Flexibilité pour ajouter de nouveaux champs
- ✅ Meilleure organisation des données

## 🛠️ Étapes de Migration

### Étape 1 : Mettre à Jour la Base de Données

1. **Connecte-toi à Supabase**
   - Va sur [supabase.com](https://supabase.com)
   - Ouvre ton projet GRIND
   - Va dans **SQL Editor**

2. **Exécute le Script de Migration**
   - Copie le contenu du fichier `update-schema.sql`
   - Colle-le dans l'éditeur SQL
   - Clique sur **Run**

3. **Vérifie les Résultats**
   - Le script affichera des statistiques de migration
   - Vérifie qu'il n'y a pas d'erreurs

### Étape 2 : Redémarrer le Serveur

```bash
# Arrêter le serveur actuel
pkill -f "next dev"

# Redémarrer dans le bon dossier
cd grind-app
pnpm dev
```

### Étape 3 : Tester l'Application

1. **Test de Connexion**
   - Va sur `http://localhost:3000`
   - Connecte-toi avec ton compte

2. **Test d'Ajout de Séance**
   - Va sur le dashboard
   - Ajoute une nouvelle séance
   - Vérifie qu'elle s'affiche correctement

3. **Test d'Affichage**
   - Vérifie que les anciennes séances s'affichent
   - Vérifie que les nouvelles séances s'affichent

## 📁 Fichiers Modifiés

### Code TypeScript
- ✅ `src/components/NewWorkoutForm.tsx` - Structure JSONB
- ✅ `src/components/WorkoutList.tsx` - Affichage JSONB
- ✅ `src/components/WorkoutStats.tsx` - Statistiques JSONB
- ✅ `src/types/database.ts` - Types TypeScript

### Base de Données
- ✅ `supabase-schema.sql` - Nouveau schéma
- ✅ `update-schema.sql` - Script de migration

## 🔍 Vérification Post-Migration

### Dans Supabase
```sql
-- Vérifier la structure de la table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workouts';

-- Vérifier les données
SELECT id, exercises, notes, created_at 
FROM workouts 
LIMIT 5;
```

### Dans l'Application
- ✅ Formulaire d'ajout fonctionne
- ✅ Liste des séances s'affiche
- ✅ Statistiques calculées correctement
- ✅ Pas d'erreurs dans la console

## 🚨 Problèmes Courants

### Erreur "Column does not exist"
- **Cause :** Migration non effectuée
- **Solution :** Exécuter le script `update-schema.sql`

### Erreur "Type mismatch"
- **Cause :** Types TypeScript non mis à jour
- **Solution :** Redémarrer le serveur après mise à jour des types

### Données manquantes
- **Cause :** Migration partielle
- **Solution :** Vérifier la table de sauvegarde `workouts_backup`

## 📞 Support

Si tu rencontres des problèmes :

1. **Vérifie les logs** dans la console du navigateur
2. **Vérifie les logs** dans le terminal du serveur
3. **Vérifie la base de données** dans Supabase
4. **Consulte le guide de débogage** `DEBUG_GUIDE.md`

## ✅ Checklist de Validation

- [ ] Script de migration exécuté sans erreur
- [ ] Serveur redémarré
- [ ] Connexion utilisateur fonctionne
- [ ] Ajout de séance fonctionne
- [ ] Affichage des séances fonctionne
- [ ] Pas d'erreurs dans la console
- [ ] Anciennes données préservées

---

**🎉 Félicitations !** Ton application GRIND utilise maintenant la structure JSONB moderne et flexible ! 