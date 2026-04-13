# 🚀 GUIDE DE DÉPLOIEMENT ET MISE EN PRODUCTION

Guide complet pour déployer l'application ONG MADE en production.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Déploiement](#déploiement)
4. [Configuration DNS](#configuration-dns)
5. [Tests de production](#tests-de-production)
6. [Monitoring](#monitoring)
7. [Maintenance](#maintenance)
8. [Checklist finale](#checklist-finale)

---

## ✅ Prérequis

### Comptes nécessaires

- [ ] Compte Supabase (gratuit ou payant)
- [ ] Compte Vercel/Netlify (gratuit ou payant)
- [ ] Compte GitHub (pour le code source)
- [ ] Nom de domaine (optionnel)

### Outils nécessaires

- [ ] Node.js 18+ installé
- [ ] Git installé
- [ ] Éditeur de code (VS Code recommandé)
- [ ] Navigateur moderne (Chrome/Edge)

---

## 🗄️ Configuration Supabase

### Étape 1 : Créer le projet

1. **Allez sur** : https://supabase.com
2. **Cliquez sur** : "New Project"
3. **Remplissez** :
   - **Name** : `made-ong-humanitarian`
   - **Database Password** : Générez un mot de passe fort (notez-le !)
   - **Region** : `Europe (Frankfurt)` ou `Africa (Cape Town)`
   - **Pricing Plan** : 
     - Free : 500 MB DB, 1 GB Storage, 2 GB Bandwidth
     - Pro : 8 GB DB, 100 GB Storage, 250 GB Bandwidth (~25$/mois)

4. **Cliquez sur** : "Create new project"
5. **Attendez** : 2-3 minutes (création de l'infrastructure)

### Étape 2 : Exécuter le script SQL

1. **Dans Supabase** : Allez dans **SQL Editor**
2. **Ouvrez le fichier** : `supabase/migrations/init_database_structure_2026_04_13.sql`
3. **Copiez tout le contenu** (Ctrl+A, Ctrl+C)
4. **Collez dans l'éditeur SQL** (Ctrl+V)
5. **Cliquez sur** : "Run" (en bas à droite)
6. **Vérifiez** : "Success. No rows returned" (c'est normal)

✅ **Vérification** :
- Allez dans **Table Editor**
- Vous devez voir : `profiles_beneficiaires`, `historique_pointages`, `services_ong`, `audit_logs`

### Étape 3 : Configurer le Storage

1. **Dans Supabase** : Allez dans **Storage**
2. **Vérifiez** : Le bucket `beneficiaire-photos` existe
3. **Si absent** : Cliquez sur "New bucket"
   - **Name** : `beneficiaire-photos`
   - **Public** : ✅ Coché
   - **File size limit** : 5 MB
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### Étape 4 : Créer l'utilisateur admin

1. **Dans Supabase** : Allez dans **Authentication** → **Users**
2. **Cliquez sur** : "Add user" → "Create new user"
3. **Remplissez** :
   - **Email** : `Made711@gmail.com` (EXACTEMENT comme ça, avec majuscule)
   - **Password** : `made@711`
   - **Auto Confirm User** : ✅ Coché
4. **Cliquez sur** : "Create user"

✅ **Vérification** :
- L'utilisateur apparaît dans la liste
- Status : "Confirmed"

### Étape 5 : Récupérer les clés API

1. **Dans Supabase** : Allez dans **Settings** → **API**
2. **Notez ces informations** :

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODAwMDAwMDAsImV4cCI6MTk5NTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANT** : Ne partagez JAMAIS la `service_role` key (elle donne un accès total).

---

## 🚀 Déploiement

### Option 1 : Déploiement sur Vercel (Recommandé)

**Avantages** :
- ✅ Gratuit pour projets personnels
- ✅ HTTPS automatique
- ✅ CDN global
- ✅ Déploiement automatique depuis GitHub
- ✅ Domaine personnalisé gratuit

**Étapes** :

1. **Créer un compte Vercel** :
   - Allez sur https://vercel.com
   - Cliquez sur "Sign Up"
   - Connectez-vous avec GitHub

2. **Importer le projet** :
   - Cliquez sur "New Project"
   - Sélectionnez votre repository GitHub
   - Cliquez sur "Import"

3. **Configurer les variables d'environnement** :
   - Dans "Environment Variables", ajoutez :
   
   ```
   VITE_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Déployer** :
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes
   - ✅ Votre application est en ligne !

5. **Récupérer l'URL** :
   - Exemple : `https://made-ong-humanitarian.vercel.app`
   - Testez l'URL dans votre navigateur

**Déploiement automatique** :
- Chaque push sur GitHub déclenche un nouveau déploiement
- Branches : `main` = production, `dev` = preview

### Option 2 : Déploiement sur Netlify

**Avantages** :
- ✅ Gratuit pour projets personnels
- ✅ HTTPS automatique
- ✅ CDN global
- ✅ Formulaires intégrés
- ✅ Fonctions serverless

**Étapes** :

1. **Créer un compte Netlify** :
   - Allez sur https://netlify.com
   - Cliquez sur "Sign Up"
   - Connectez-vous avec GitHub

2. **Importer le projet** :
   - Cliquez sur "New site from Git"
   - Sélectionnez GitHub
   - Choisissez votre repository

3. **Configurer le build** :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`

4. **Configurer les variables d'environnement** :
   - Allez dans "Site settings" → "Environment variables"
   - Ajoutez :
   
   ```
   VITE_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. **Déployer** :
   - Cliquez sur "Deploy site"
   - Attendez 2-3 minutes
   - ✅ Votre application est en ligne !

6. **Récupérer l'URL** :
   - Exemple : `https://made-ong-humanitarian.netlify.app`

### Option 3 : Déploiement manuel

**Pour serveur VPS (Ubuntu/Debian)** :

1. **Installer Node.js** :
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Cloner le projet** :
```bash
git clone https://github.com/votre-org/made-ong-humanitarian.git
cd made-ong-humanitarian
```

3. **Installer les dépendances** :
```bash
npm install
```

4. **Configurer les variables d'environnement** :
```bash
nano .env
```

Ajoutez :
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. **Build** :
```bash
npm run build
```

6. **Installer un serveur web (Nginx)** :
```bash
sudo apt-get install nginx
```

7. **Configurer Nginx** :
```bash
sudo nano /etc/nginx/sites-available/made-ong
```

Ajoutez :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /home/user/made-ong-humanitarian/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

8. **Activer le site** :
```bash
sudo ln -s /etc/nginx/sites-available/made-ong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Installer SSL (Let's Encrypt)** :
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 🌐 Configuration DNS

### Si vous avez un nom de domaine

**Exemple** : `made-ong.org`

1. **Allez chez votre registrar** (OVH, Namecheap, GoDaddy, etc.)
2. **Accédez à la gestion DNS**
3. **Ajoutez un enregistrement CNAME** :

**Pour Vercel** :
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 3600
```

**Pour Netlify** :
```
Type: CNAME
Name: @
Value: votre-site.netlify.app
TTL: 3600
```

4. **Ajoutez un enregistrement CNAME pour www** :
```
Type: CNAME
Name: www
Value: votre-site.vercel.app (ou netlify.app)
TTL: 3600
```

5. **Attendez la propagation DNS** : 1-24 heures

6. **Configurez le domaine dans Vercel/Netlify** :
   - Allez dans "Domains"
   - Ajoutez votre domaine
   - Suivez les instructions

---

## 🧪 Tests de production

### Checklist de tests

- [ ] **Page de connexion** :
  - [ ] Affichage correct
  - [ ] Connexion avec Made711@gmail.com / made@711
  - [ ] Redirection vers dashboard

- [ ] **Dashboard** :
  - [ ] Statistiques affichées (0 au départ)
  - [ ] Pas d'erreur console
  - [ ] Navigation fonctionnelle

- [ ] **Bénéficiaires** :
  - [ ] Ajouter un bénéficiaire
  - [ ] Upload de photo
  - [ ] Génération du code-barres
  - [ ] Recherche
  - [ ] Modification
  - [ ] Archivage

- [ ] **Pointage** :
  - [ ] Scanner détecté (si branché)
  - [ ] Pointage manuel fonctionne
  - [ ] Feedback visuel et sonore
  - [ ] Historique mis à jour

- [ ] **Badges** :
  - [ ] Génération de badge
  - [ ] Téléchargement PNG
  - [ ] Code-barres lisible

- [ ] **Services** :
  - [ ] Validation cantine
  - [ ] Détection double passage
  - [ ] Historique

- [ ] **Rapports** :
  - [ ] Export Excel
  - [ ] Export PDF
  - [ ] Backup JSON

- [ ] **Audit** :
  - [ ] Journal d'audit rempli
  - [ ] Toutes les actions enregistrées

- [ ] **Performance** :
  - [ ] Temps de chargement < 3s
  - [ ] Pas de lag lors des actions
  - [ ] Optimistic UI fonctionne

### Tests de charge

**Simuler 100 bénéficiaires** :

```typescript
// Script de test (à exécuter dans la console)
for (let i = 0; i < 100; i++) {
  await supabase.from('profiles_beneficiaires').insert({
    nom: `Nom${i}`,
    prenom: `Prenom${i}`,
    categorie: ['Mère', 'Enfant', 'Personnel'][i % 3],
    code_barre_unique: `TEST${i.toString().padStart(8, '0')}`,
  })
}
```

**Vérifier** :
- Recherche rapide (< 1s)
- Pagination fonctionne
- Pas de ralentissement

---

## 📊 Monitoring

### Supabase Dashboard

**Métriques à surveiller** :

1. **Database** :
   - Taille de la DB (limite : 500 MB gratuit)
   - Nombre de connexions
   - Requêtes lentes

2. **Storage** :
   - Taille du storage (limite : 1 GB gratuit)
   - Nombre de fichiers
   - Bande passante

3. **Auth** :
   - Nombre d'utilisateurs (1 seul normalement)
   - Tentatives de connexion échouées

4. **API** :
   - Nombre de requêtes par jour
   - Temps de réponse moyen
   - Erreurs 500

**Alertes** :
- Configurez des alertes email si :
  - DB > 80% de la limite
  - Storage > 80% de la limite
  - Erreurs 500 > 10 par heure

### Vercel/Netlify Analytics

**Métriques à surveiller** :

1. **Performance** :
   - Temps de chargement
   - Core Web Vitals
   - Taux de rebond

2. **Trafic** :
   - Nombre de visiteurs
   - Pages vues
   - Durée de session

3. **Erreurs** :
   - Erreurs JavaScript
   - Erreurs 404
   - Erreurs 500

### Logs

**Supabase Logs** :
- Allez dans "Logs" → "Database"
- Filtrez par niveau : Error, Warning
- Surveillez les erreurs RLS

**Vercel Logs** :
- Allez dans "Deployments" → "Functions"
- Vérifiez les erreurs de build

---

## 🔧 Maintenance

### Backup quotidien

**Script automatique** :

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/made-ong"

# Créer le dossier si inexistant
mkdir -p $BACKUP_DIR

# Backup Supabase (via API)
curl -X GET "https://xxxxx.supabase.co/rest/v1/profiles_beneficiaires?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  > $BACKUP_DIR/beneficiaires_$DATE.json

curl -X GET "https://xxxxx.supabase.co/rest/v1/historique_pointages?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  > $BACKUP_DIR/pointages_$DATE.json

# Compresser
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE.json

# Supprimer les fichiers JSON
rm $BACKUP_DIR/*_$DATE.json

# Garder seulement les 30 derniers backups
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +31 | xargs rm -f

echo "Backup completed: backup_$DATE.tar.gz"
```

**Automatiser avec cron** :

```bash
# Éditer crontab
crontab -e

# Ajouter (backup tous les jours à 2h du matin)
0 2 * * * /path/to/backup.sh
```

### Mises à jour

**Dépendances** :

```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour (patch et minor)
npm update

# Mettre à jour (major - avec précaution)
npm install react@latest react-dom@latest
```

**Supabase** :
- Les mises à jour sont automatiques
- Vérifiez les breaking changes : https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects

**Vercel/Netlify** :
- Mises à jour automatiques
- Aucune action nécessaire

### Nettoyage

**Storage (photos)** :

```typescript
// Supprimer les photos orphelines (sans bénéficiaire)
const { data: photos } = await supabase.storage
  .from('beneficiaire-photos')
  .list()

const { data: beneficiaires } = await supabase
  .from('profiles_beneficiaires')
  .select('photo_url')

const usedPhotos = beneficiaires.map(b => b.photo_url?.split('/').pop())
const orphanPhotos = photos.filter(p => !usedPhotos.includes(p.name))

for (const photo of orphanPhotos) {
  await supabase.storage
    .from('beneficiaire-photos')
    .remove([photo.name])
}

console.log(`${orphanPhotos.length} photos supprimées`)
```

**Base de données** :

```sql
-- Archiver les pointages de plus d'1 an
CREATE TABLE historique_pointages_archive AS
SELECT * FROM historique_pointages
WHERE timestamp < NOW() - INTERVAL '1 year';

DELETE FROM historique_pointages
WHERE timestamp < NOW() - INTERVAL '1 year';

-- Vacuum pour récupérer l'espace
VACUUM FULL historique_pointages;
```

---

## ✅ Checklist finale

### Avant la mise en production

- [ ] Script SQL exécuté dans Supabase
- [ ] Utilisateur admin créé (Made711@gmail.com)
- [ ] Bucket storage créé et configuré
- [ ] Variables d'environnement configurées
- [ ] Application déployée sur Vercel/Netlify
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Tests de connexion réussis
- [ ] Tests CRUD réussis
- [ ] Tests de pointage réussis
- [ ] Tests d'export réussis
- [ ] Scanner laser testé (si disponible)
- [ ] Backup automatique configuré
- [ ] Monitoring activé
- [ ] Documentation lue par l'équipe

### Après la mise en production

- [ ] Former l'équipe (2-3 heures)
- [ ] Ajouter les premiers bénéficiaires
- [ ] Générer et imprimer les premiers badges
- [ ] Tester le scanner en conditions réelles
- [ ] Surveiller les logs pendant 1 semaine
- [ ] Collecter les retours utilisateurs
- [ ] Ajuster si nécessaire

### Maintenance régulière

**Quotidien** :
- [ ] Vérifier les logs d'erreur
- [ ] Vérifier les statistiques de trafic

**Hebdomadaire** :
- [ ] Exporter les données (backup manuel)
- [ ] Vérifier l'espace disque (DB + Storage)
- [ ] Nettoyer les photos orphelines

**Mensuel** :
- [ ] Mettre à jour les dépendances npm
- [ ] Vérifier les factures Supabase/Vercel
- [ ] Analyser les métriques de performance
- [ ] Former les nouveaux utilisateurs

**Annuel** :
- [ ] Archiver les anciennes données (>1 an)
- [ ] Renouveler le nom de domaine
- [ ] Audit de sécurité complet
- [ ] Mise à jour majeure si nécessaire

---

## 📞 Support

### En cas de problème

1. **Vérifier les logs** :
   - Supabase : Dashboard → Logs
   - Vercel : Deployments → Functions
   - Navigateur : Console (F12)

2. **Consulter la documentation** :
   - [Guide d'utilisation](GUIDE_UTILISATION.md)
   - [Guide technique](GUIDE_TECHNIQUE.md)
   - [Configuration scanner](CONFIGURATION_SCANNER.md)

3. **Contacter le support** :
   - Email : Made711@gmail.com
   - Supabase : https://supabase.com/support
   - Vercel : https://vercel.com/support

---

## 🎉 Félicitations !

Votre application ONG MADE est maintenant en production et prête à être utilisée !

**Prochaines étapes** :
1. Former votre équipe
2. Ajouter les bénéficiaires
3. Imprimer les badges
4. Commencer à utiliser le système

**Ressources** :
- URL de l'application : `https://votre-domaine.com`
- Dashboard Supabase : `https://app.supabase.com`
- Dashboard Vercel : `https://vercel.com/dashboard`

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Guide de déploiement v1.0.0*
