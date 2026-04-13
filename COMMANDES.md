# 🚀 COMMANDES UTILES - ONG MADE

Référence rapide de toutes les commandes utiles pour le projet.

---

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/votre-org/made-ong-humanitarian.git
cd made-ong-humanitarian

# Installer les dépendances
npm install

# Installer les bibliothèques d'export (optionnel)
npm install xlsx jspdf html2canvas bwip-js docx
npm install --save-dev @types/html2canvas @types/bwip-js
```

---

## ⚙️ Configuration

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env
nano .env
# ou
code .env

# Ajouter vos clés Supabase:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🏃 Développement

```bash
# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
# http://localhost:5173

# Lancer avec logs détaillés
VITE_ENABLE_ROUTE_MESSAGING=true npm run dev
```

---

## 🔨 Build

```bash
# Build de production
npm run build

# Build avec sourcemaps (pour debug)
npm run build:map

# Build en mode développement
npm run build:dev

# Aperçu du build
npm run preview

# Build + aperçu
npm run preview:dev
```

---

## 🧹 Qualité du code

```bash
# Linter (vérifier le code)
npm run lint

# Linter avec auto-fix
npm run lint -- --fix

# Vérifier les types TypeScript
npx tsc --noEmit

# Formater le code (si Prettier installé)
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## 📊 Analyse

```bash
# Analyser la taille du bundle
npm run build
npx vite-bundle-visualizer

# Vérifier les dépendances obsolètes
npm outdated

# Vérifier les vulnérabilités
npm audit

# Corriger les vulnérabilités (automatique)
npm audit fix
```

---

## 🗄️ Supabase

### SQL

```bash
# Se connecter à Supabase (via CLI)
npx supabase login

# Initialiser Supabase localement
npx supabase init

# Démarrer Supabase local
npx supabase start

# Arrêter Supabase local
npx supabase stop

# Créer une migration
npx supabase migration new nom_de_la_migration

# Appliquer les migrations
npx supabase db push
```

### Backup

```bash
# Backup de la base de données (via API)
curl -X GET "https://xxxxx.supabase.co/rest/v1/profiles_beneficiaires?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  > backup_beneficiaires.json

# Backup de toutes les tables
for table in profiles_beneficiaires historique_pointages services_ong audit_logs; do
  curl -X GET "https://xxxxx.supabase.co/rest/v1/$table?select=*" \
    -H "apikey: YOUR_ANON_KEY" \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    > backup_$table.json
done
```

---

## 🚀 Déploiement

### Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer (preview)
vercel

# Déployer (production)
vercel --prod

# Voir les logs
vercel logs

# Lister les déploiements
vercel ls
```

### Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer (preview)
netlify deploy

# Déployer (production)
netlify deploy --prod

# Voir les logs
netlify logs

# Ouvrir le dashboard
netlify open
```

### Serveur VPS (Ubuntu/Debian)

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt-get install nginx

# Installer Certbot (SSL)
sudo apt-get install certbot python3-certbot-nginx

# Cloner le projet
git clone https://github.com/votre-org/made-ong-humanitarian.git
cd made-ong-humanitarian

# Installer les dépendances
npm install

# Build
npm run build

# Configurer Nginx
sudo nano /etc/nginx/sites-available/made-ong

# Activer le site
sudo ln -s /etc/nginx/sites-available/made-ong /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Installer SSL
sudo certbot --nginx -d votre-domaine.com
```

---

## 🔄 Mise à jour

```bash
# Mettre à jour les dépendances (patch et minor)
npm update

# Mettre à jour une dépendance spécifique
npm install react@latest react-dom@latest

# Mettre à jour toutes les dépendances (major)
npx npm-check-updates -u
npm install

# Mettre à jour npm lui-même
npm install -g npm@latest
```

---

## 🧪 Tests

```bash
# Installer Vitest (si pas déjà fait)
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Lancer les tests
npm run test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec coverage
npm run test:coverage
```

---

## 📝 Git

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Initial commit"

# Ajouter un remote
git remote add origin https://github.com/votre-org/made-ong-humanitarian.git

# Push
git push -u origin main

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Fusionner une branche
git checkout main
git merge feature/nouvelle-fonctionnalite

# Voir l'historique
git log --oneline --graph

# Annuler le dernier commit (garder les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les changements)
git reset --hard HEAD~1
```

---

## 🐳 Docker (optionnel)

```bash
# Créer un Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
EOF

# Build l'image
docker build -t made-ong-humanitarian .

# Lancer le container
docker run -p 5173:5173 made-ong-humanitarian

# Avec variables d'environnement
docker run -p 5173:5173 \
  -e VITE_SUPABASE_URL=https://xxxxx.supabase.co \
  -e VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
  made-ong-humanitarian
```

---

## 🔍 Debug

```bash
# Voir les logs du navigateur
# Ouvrir la console : F12 ou Ctrl+Shift+I

# Voir les logs Vercel
vercel logs --follow

# Voir les logs Netlify
netlify logs --follow

# Voir les logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Voir les logs système
journalctl -u nginx -f
```

---

## 📊 Performance

```bash
# Analyser les performances avec Lighthouse
npx lighthouse https://votre-site.com --view

# Analyser la taille du bundle
npm run build
npx vite-bundle-visualizer

# Analyser les dépendances
npx depcheck

# Trouver les dépendances inutilisées
npx npm-check
```

---

## 🔐 Sécurité

```bash
# Vérifier les vulnérabilités
npm audit

# Corriger automatiquement
npm audit fix

# Corriger avec force (peut casser des choses)
npm audit fix --force

# Vérifier les secrets dans le code
npx secretlint "**/*"

# Vérifier les licences
npx license-checker
```

---

## 📦 Gestion des packages

```bash
# Lister les packages installés
npm list

# Lister les packages globaux
npm list -g --depth=0

# Désinstaller un package
npm uninstall nom-du-package

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

---

## 🌐 Réseau

```bash
# Tester la connexion à Supabase
curl -I https://xxxxx.supabase.co

# Tester l'API Supabase
curl -X GET "https://xxxxx.supabase.co/rest/v1/profiles_beneficiaires?select=*&limit=1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Vérifier les DNS
nslookup votre-domaine.com

# Tester le SSL
openssl s_client -connect votre-domaine.com:443
```

---

## 📱 Scanner laser

```bash
# Lister les périphériques USB (Linux)
lsusb

# Voir les détails d'un périphérique USB
lsusb -v -d VENDOR_ID:PRODUCT_ID

# Tester le scanner (Linux)
cat /dev/input/by-id/usb-*-event-kbd

# Voir les événements clavier (Linux)
sudo evtest
```

---

## 🎨 Design

```bash
# Générer des couleurs Tailwind
npx tailwindcss-color-palette

# Optimiser les images
npx @squoosh/cli --webp auto public/images/*.jpg

# Compresser les images
npx imagemin public/images/*.jpg --out-dir=public/images/compressed
```

---

## 📚 Documentation

```bash
# Générer la documentation TypeScript
npx typedoc --out docs src

# Générer un README automatique
npx readme-md-generator

# Compter les lignes de code
npx cloc src
```

---

## 🔄 Automatisation

### Cron (Linux)

```bash
# Éditer crontab
crontab -e

# Backup quotidien à 2h du matin
0 2 * * * /path/to/backup.sh

# Nettoyage hebdomadaire le dimanche à 3h
0 3 * * 0 /path/to/cleanup.sh

# Mise à jour mensuelle le 1er à 4h
0 4 1 * * /path/to/update.sh
```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🆘 Aide

```bash
# Aide npm
npm help

# Aide d'une commande spécifique
npm help install

# Aide Vercel
vercel help

# Aide Netlify
netlify help

# Aide Supabase
npx supabase help
```

---

## 📞 Support

**Email** : Made711@gmail.com

**Documentation** :
- [Guide d'utilisation](GUIDE_UTILISATION.md)
- [Guide technique](GUIDE_TECHNIQUE.md)
- [Configuration scanner](CONFIGURATION_SCANNER.md)
- [Déploiement](DEPLOIEMENT.md)

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Commandes utiles v1.0.0*
