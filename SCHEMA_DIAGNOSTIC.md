# 🔍 Guide de Diagnostic - Problème de Schéma

## 🎯 Problème Identifié
Erreur : **"Could not find the 'exercise' column of 'workouts' in the schema cache"**

## 🚀 Diagnostic Automatisé

### **Étape 1: Test Rapide**
```bash
# 1. Ouvrir http://localhost:3000
# 2. Console (F12) > quickTest.runQuickTest()
```

### **Étape 2: Diagnostic de Schéma**
```bash
# 1. Console (F12) > schemaDiagnostic.runSchemaDiagnostic()
# 2. Observer les colonnes disponibles
```

## 🔍 Analyse des Résultats

### **Résultat Attendu - Colonnes Correctes**
```
✅ Colonne 'id': Existe
✅ Colonne 'user_id': Existe
✅ Colonne 'date': Existe
✅ Colonne 'exercise': Existe
✅ Colonne 'weight': Existe
✅ Colonne 'reps': Existe
✅ Colonne 'sets': Existe
✅ Colonne 'duration_minutes': Existe
✅ Colonne 'notes': Existe
✅ Colonne 'created_at': Existe
✅ Colonne 'updated_at': Existe
❌ Colonne 'exercises': [Erreur]
```

### **Résultat Problématique - Colonnes Manquantes**
```
❌ Colonne 'exercise': [Erreur]
❌ Colonne 'weight': [Erreur]
❌ Colonne 'reps': [Erreur]
```

## 🛠️ Solutions par Scénario

### **Scénario 1: Table workouts n'existe pas**
**Symptômes :**
- Toutes les colonnes retournent des erreurs
- Erreur "relation does not exist"

**Solution :**
```sql
-- Dans Supabase > SQL Editor
-- Exécuter le schéma complet depuis supabase-schema.sql
```

### **Scénario 2: Colonnes manquantes**
**Symptômes :**
- Certaines colonnes existent, d'autres non
- Erreur sur des colonnes spécifiques

**Solution :**
```sql
-- Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workouts';

-- Ajouter les colonnes manquantes
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS exercise TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS reps INTEGER;
```

### **Scénario 3: Types de données incorrects**
**Symptômes :**
- Colonnes existent mais erreurs de type
- Erreur "invalid input syntax"

**Solution :**
```sql
-- Corriger les types
ALTER TABLE workouts 
ALTER COLUMN weight TYPE NUMERIC(5,2) USING weight::NUMERIC(5,2),
ALTER COLUMN reps TYPE INTEGER USING reps::INTEGER;
```

### **Scénario 4: RLS Policies manquantes**
**Symptômes :**
- Structure OK mais erreur d'insertion
- Erreur "new row violates row-level security policy"

**Solution :**
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'workouts';

-- Créer les policies manquantes
CREATE POLICY "Allow insert for authenticated users"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select for authenticated users"
ON workouts
FOR SELECT
USING (auth.uid() = user_id);
```

## 📊 Tests de Validation

### **Test 1: Structure de Base**
```javascript
// Dans la console
schemaDiagnostic.checkTableStructure()
```

### **Test 2: Colonnes Disponibles**
```javascript
// Dans la console
schemaDiagnostic.checkColumns()
```

### **Test 3: Insertion de Test**
```javascript
// Dans la console
const { data: { user } } = await supabase.auth.getUser();
schemaDiagnostic.testInsertion(user);
```

## 🔧 Corrections Automatiques

### **Script SQL de Correction Complète**
```sql
-- 1. Vérifier si la table existe
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    exercise TEXT NOT NULL,
    weight NUMERIC(5,2),
    reps INTEGER,
    sets INTEGER,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ajouter les colonnes manquantes (si nécessaire)
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS exercise TEXT;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2);
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS reps INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS sets INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Activer RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- 4. Créer les policies
CREATE POLICY IF NOT EXISTS "Allow insert for authenticated users"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow select for authenticated users"
ON workouts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow update for authenticated users"
ON workouts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Allow delete for authenticated users"
ON workouts
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Créer les index
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
```

## ✅ Checklist de Validation

- [ ] **Table workouts existe**
- [ ] **Colonne exercise (TEXT) existe**
- [ ] **Colonne weight (NUMERIC) existe**
- [ ] **Colonne reps (INTEGER) existe**
- [ ] **Colonne notes (TEXT) existe**
- [ ] **RLS activé**
- [ ] **Policies INSERT/SELECT créées**
- [ ] **Index créés**
- [ ] **Test d'insertion réussi**

## 🎯 Résolution Finale

Une fois le diagnostic effectué :

1. **Identifier le problème** via les tests automatisés
2. **Appliquer la correction** SQL appropriée
3. **Valider** avec les tests de validation
4. **Tester** le formulaire d'ajout de séance

## 📞 Support

Si le problème persiste :
1. Copier les résultats du diagnostic
2. Vérifier la structure dans Supabase > Table Editor
3. Comparer avec le schéma dans `supabase-schema.sql`
4. Appliquer les corrections SQL manquantes 