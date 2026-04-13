# 🗄️ SUPABASE - BASE DE DONNÉES

Ce dossier contient tous les fichiers liés à la configuration de la base de données Supabase.

---

## 📁 Structure

```
supabase/
├── migrations/
│   └── init_database_structure_2026_04_13.sql
└── edge_function/
    ├── deno.json
    ├── deps.ts
    └── tests/
```

---

## 📄 Fichiers

### migrations/init_database_structure_2026_04_13.sql

**Description** : Script SQL complet pour initialiser la base de données.

**Contenu** :
- Création des 4 tables principales
- Index pour performance optimale
- Triggers pour audit automatique
- Politiques RLS (Row Level Security)
- Bucket storage pour photos
- Vues SQL pour statistiques
- Commentaires de documentation

**Tables créées** :
1. `profiles_beneficiaires` : Bénéficiaires avec photos et codes-barres
2. `historique_pointages` : Historique des pointages entrée/sortie
3. `services_ong` : Services fournis (cantine, médical, gargote)
4. `audit_logs` : Journal d'audit complet

**Utilisation** :
1. Allez dans votre projet Supabase
2. Ouvrez **SQL Editor**
3. Copiez le contenu du fichier
4. Collez dans l'éditeur
5. Cliquez sur **Run**

---

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables sont protégées par RLS. Seul l'email `Made711@gmail.com` peut accéder aux données.

**Politiques** :
- `profiles_beneficiaires` : Accès total pour Made711@gmail.com
- `historique_pointages` : Accès total pour Made711@gmail.com
- `services_ong` : Accès total pour Made711@gmail.com
- `audit_logs` : Accès total pour Made711@gmail.com

### Storage

Le bucket `beneficiaire-photos` est configuré avec :
- Upload : Réservé à Made711@gmail.com
- Lecture : Publique
- Suppression : Réservée à Made711@gmail.com

---

## 📊 Schéma de la base de données

### profiles_beneficiaires

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| photo_url | TEXT | URL de la photo (Supabase Storage) |
| nom | VARCHAR(100) | Nom du bénéficiaire |
| prenom | VARCHAR(100) | Prénom du bénéficiaire |
| categorie | VARCHAR(50) | Catégorie (Mère, Enfant, Personnel, Individu, Visiteur) |
| date_naissance | DATE | Date de naissance |
| code_barre_unique | VARCHAR(50) | Code-barres unique (indexé) |
| is_archived | BOOLEAN | Soft delete (true = archivé) |
| notes | TEXT | Notes libres |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de dernière modification |

**Index** :
- `idx_code_barre` : Sur `code_barre_unique` (recherche rapide par scanner)
- `idx_categorie` : Sur `categorie` (filtres)
- `idx_archived` : Sur `is_archived` (filtres)
- `idx_nom_prenom` : Sur `nom, prenom` (recherche)

### historique_pointages

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| beneficiaire_id | UUID | Foreign key vers profiles_beneficiaires |
| type | VARCHAR(10) | ENTREE ou SORTIE |
| methode | VARCHAR(10) | AUTO (scanner) ou MANUEL |
| timestamp | TIMESTAMPTZ | Horodatage précis |
| created_by | VARCHAR(255) | Email de l'admin (optionnel) |

**Index** :
- `idx_pointages_beneficiaire` : Sur `beneficiaire_id`
- `idx_pointages_timestamp` : Sur `timestamp DESC`
- `idx_pointages_type` : Sur `type`

### services_ong

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| beneficiaire_id | UUID | Foreign key vers profiles_beneficiaires |
| type_service | VARCHAR(20) | CANTINE, GARGOTE ou MEDICAL |
| date_service | DATE | Date du service |
| notes | TEXT | Notes (ex: diagnostic médical) |
| created_at | TIMESTAMPTZ | Date de création |
| created_by | VARCHAR(255) | Email de l'admin |

**Index** :
- `idx_services_beneficiaire` : Sur `beneficiaire_id`
- `idx_services_date` : Sur `date_service DESC`
- `idx_services_type` : Sur `type_service`

**Contrainte** : Un seul service par type par jour par bénéficiaire.

### audit_logs

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique |
| admin_email | VARCHAR(255) | Email de l'admin |
| action | VARCHAR(100) | Type d'action (INSERT_table, UPDATE_table, DELETE_table) |
| target_id | UUID | ID de l'enregistrement modifié |
| target_type | VARCHAR(50) | Nom de la table |
| details_json | JSONB | Détails complets en JSON |
| created_at | TIMESTAMPTZ | Date de l'action |

**Index** :
- `idx_audit_email` : Sur `admin_email`
- `idx_audit_action` : Sur `action`
- `idx_audit_timestamp` : Sur `created_at DESC`
- `idx_audit_target` : Sur `target_id`

---

## 🔄 Triggers

### update_updated_at_column()

**Fonction** : Met à jour automatiquement `updated_at` à chaque modification.

**Appliqué sur** : `profiles_beneficiaires`

### log_audit_trail()

**Fonction** : Enregistre automatiquement toutes les actions (INSERT, UPDATE, DELETE) dans `audit_logs`.

**Appliqué sur** :
- `profiles_beneficiaires`
- `historique_pointages`
- `services_ong`

**Détails enregistrés** :
- Email de l'admin (via JWT)
- Type d'action
- ID de l'enregistrement
- Nom de la table
- Détails JSON (avant/après pour UPDATE)

---

## 📈 Vues

### v_dernier_pointage

**Description** : Récupère le dernier pointage de chaque bénéficiaire.

**Usage** : Savoir si un bénéficiaire est actuellement présent (dernier type = ENTREE) ou absent (dernier type = SORTIE).

### v_stats_jour

**Description** : Statistiques du jour en temps réel.

**Colonnes** :
- `total_entrees` : Nombre total d'entrées aujourd'hui
- `enfants_presents` : Nombre d'enfants actuellement présents
- `repas_servis` : Nombre de repas servis aujourd'hui

**Usage** : Afficher les statistiques sur le dashboard.

---

## 🚀 Déploiement

### Étape 1 : Créer le projet Supabase

1. Allez sur https://supabase.com
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet
4. Notez le **Project URL** et l'**anon key**

### Étape 2 : Exécuter le script SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Ouvrez `migrations/init_database_structure_2026_04_13.sql`
3. Copiez tout le contenu
4. Collez dans l'éditeur SQL
5. Cliquez sur **Run**

✅ Toutes les tables, index, triggers et politiques sont créés automatiquement.

### Étape 3 : Créer l'utilisateur admin

1. Dans Supabase, allez dans **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Email : `Made711@gmail.com`
4. Password : `made@711`
5. Cochez **Auto Confirm User**
6. Cliquez sur **Create user**

### Étape 4 : Vérifier

1. Allez dans **Table Editor**
2. Vérifiez que les 4 tables existent
3. Allez dans **Storage**
4. Vérifiez que le bucket `beneficiaire-photos` existe

---

## 🔧 Maintenance

### Backup

**Automatique** : Supabase effectue des backups quotidiens (rétention : 7 jours gratuit, 30 jours payant).

**Manuel** :
```bash
# Via API
curl -X GET "https://xxxxx.supabase.co/rest/v1/profiles_beneficiaires?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  > backup_beneficiaires.json
```

### Nettoyage

**Photos orphelines** :
```sql
-- Lister les photos sans bénéficiaire
SELECT * FROM storage.objects
WHERE bucket_id = 'beneficiaire-photos'
AND name NOT IN (
  SELECT SUBSTRING(photo_url FROM '[^/]+$')
  FROM profiles_beneficiaires
  WHERE photo_url IS NOT NULL
);
```

**Archivage des anciennes données** :
```sql
-- Archiver les pointages de plus d'1 an
CREATE TABLE historique_pointages_archive AS
SELECT * FROM historique_pointages
WHERE timestamp < NOW() - INTERVAL '1 year';

DELETE FROM historique_pointages
WHERE timestamp < NOW() - INTERVAL '1 year';
```

### Monitoring

**Métriques à surveiller** :
- Taille de la DB (limite : 500 MB gratuit)
- Taille du storage (limite : 1 GB gratuit)
- Nombre de requêtes par jour
- Temps de réponse moyen

**Alertes** :
- DB > 80% de la limite
- Storage > 80% de la limite
- Erreurs 500 > 10 par heure

---

## 📚 Documentation

### Guides

- [Guide d'utilisation](../GUIDE_UTILISATION.md) - Guide utilisateur complet
- [Guide technique](../GUIDE_TECHNIQUE.md) - Documentation développeur
- [Déploiement](../DEPLOIEMENT.md) - Guide de déploiement

### Ressources externes

- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 📞 Support

**Email** : Made711@gmail.com  
**Supabase Support** : https://supabase.com/support

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**
