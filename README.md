# 🏥 ONG MADE - Application de Gestion Humanitaire

**Madagascar Assistance & Development Emergency**

Application web complète de gestion humanitaire avec système de pointage par scanner laser et génération de badges code-barres.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg)

---

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Documentation](#documentation)
- [Déploiement](#déploiement)
- [Support](#support)
- [Licence](#licence)

---

## 🎯 Aperçu

L'application ONG MADE est un système complet de gestion humanitaire conçu spécifiquement pour les ONG opérant dans des environnements à ressources limitées (connexion internet faible, matériel basique).

### Problèmes résolus

✅ **Gestion manuelle inefficace** → Base de données centralisée avec recherche instantanée  
✅ **Pointages papier perdus** → Historique numérique complet avec traçabilité  
✅ **Badges artisanaux** → Génération automatique de badges professionnels avec codes-barres  
✅ **Rapports chronophages** → Exports automatiques (Excel, PDF) en un clic  
✅ **Fraude (double passage)** → Détection automatique et alertes  
✅ **Connexion internet faible** → Optimistic UI et feedback immédiat  

### Cas d'usage

- 👥 Gestion de bénéficiaires (mères, enfants, personnel)
- 🔄 Pointage entrée/sortie automatique via scanner laser
- 🍽️ Gestion de la cantine et des services médicaux
- 📊 Statistiques et rapports pour donateurs
- 🔒 Traçabilité totale avec journal d'audit

---

## ✨ Fonctionnalités

### 🎫 Gestion des bénéficiaires

- Profils complets avec photos
- Catégories : Mère, Enfant, Personnel, Individu, Visiteur
- Codes-barres uniques Code 128
- Recherche instantanée et filtres avancés
- Archivage (soft delete) sans perte de données

### 🔄 Pointage automatique

- **Scanner laser USB** : Détection automatique (émulation clavier HID)
- Logique intelligente : ENTREE ↔ SORTIE automatique
- Anti-rebond (1 seconde entre scans)
- Feedback visuel (toast) + sonore (bip)
- Historique complet avec timestamps précis

### 🎨 Génération de badges

- Design professionnel avec logo ONG
- Code-barres Code 128 haute résolution (300 DPI)
- Photo, nom, prénom, catégorie
- Export PNG, PDF, Word
- Impression directe ou planche (10 badges/page A4)

### 🍽️ Gestion des services

- **Cantine** : Validation des repas
- **Gargote** : Collations/snacks
- **Cabinet médical** : Suivi des soins
- Détection des doubles passages (même jour)
- Statistiques par service

### 📊 Dashboard et statistiques

- Présences en temps réel
- Enfants présents
- Repas servis
- Alertes (présence prolongée >12h)
- Graphiques de fréquentation

### 📤 Exports et rapports

- **Excel** : Base de données complète (bénéficiaires, pointages, services)
- **PDF** : Rapport d'impact pour donateurs (FR/IT)
- **JSON** : Backup système complet
- Filtres par période et catégorie

### 🔒 Sécurité et audit

- Authentification sécurisée (identifiants hardcodés)
- Row Level Security (RLS) sur toutes les tables
- Journal d'audit automatique (triggers PostgreSQL)
- Traçabilité totale (qui, quoi, quand)

---

## 🛠️ Technologies

### Frontend

- **React 18** : Framework UI
- **TypeScript** : Typage statique
- **Vite 5** : Build tool ultra-rapide
- **Tailwind CSS v4** : Styling utility-first
- **shadcn/ui** : Composants UI professionnels
- **Framer Motion** : Animations fluides
- **React Router** : Navigation
- **React Query** : Gestion du state serveur
- **Zustand** : State management local

### Backend

- **Supabase** : Backend-as-a-Service
  - PostgreSQL : Base de données relationnelle
  - Storage : Stockage de photos
  - Auth : Authentification
  - Row Level Security : Sécurité au niveau des lignes

### Bibliothèques spécialisées

- **bwip-js** : Génération de codes-barres Code 128
- **xlsx** : Export Excel
- **jspdf** : Export PDF
- **html2canvas** : Capture d'écran pour PDF
- **sonner** : Notifications toast

---

## 🚀 Installation

### Prérequis

- Node.js 18+ ([télécharger](https://nodejs.org))
- npm ou yarn
- Compte Supabase ([créer gratuitement](https://supabase.com))

### Étapes

1. **Cloner le projet**

```bash
git clone https://github.com/votre-org/made-ong-humanitarian.git
cd made-ong-humanitarian
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Configurer Supabase**

Voir la section [Configuration](#configuration) ci-dessous.

5. **Lancer le serveur de développement**

```bash
npm run dev
```

6. **Ouvrir l'application**

```
http://localhost:5173
```

---

## ⚙️ Configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet :
   - **Nom** : made-ong-humanitarian
   - **Région** : Europe ou Afrique du Sud (plus proche de Madagascar)
   - **Mot de passe** : Choisissez un mot de passe fort

### 2. Exécuter le script SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `supabase/migrations/init_database_structure_2026_04_13.sql`
3. Copiez tout le contenu
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run**

✅ Ce script créera :
- Toutes les tables (beneficiaires, pointages, services, audit)
- Les index pour performance
- Les triggers pour audit automatique
- Les politiques RLS
- Le bucket de storage pour photos

### 3. Créer l'utilisateur admin

1. Dans Supabase, allez dans **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Créez l'utilisateur :
   - **Email** : `Made711@gmail.com`
   - **Password** : `made@711`
   - Cochez **Auto Confirm User**

### 4. Récupérer les clés API

1. Dans Supabase, allez dans **Settings** → **API**
2. Copiez :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Collez-les dans votre fichier `.env`

---

## 📖 Utilisation

### Connexion

1. Ouvrez l'application
2. Connectez-vous avec :
   - **Email** : `Made711@gmail.com`
   - **Password** : `made@711`

### Ajouter un bénéficiaire

1. Allez dans **Bénéficiaires**
2. Cliquez sur **Ajouter**
3. Remplissez le formulaire :
   - Photo (upload ou webcam)
   - Nom, prénom
   - Catégorie
   - Date de naissance
   - Notes (optionnel)
4. Cliquez sur **Enregistrer**

✅ Un code-barres unique est généré automatiquement.

### Générer un badge

1. Allez dans **Badges**
2. Recherchez le bénéficiaire
3. Cliquez sur **Générer badge**
4. Téléchargez ou imprimez

### Utiliser le scanner

1. Branchez votre scanner laser USB
2. Allez dans **Pointage**
3. Scannez un badge
4. ✅ L'entrée/sortie est enregistrée automatiquement

### Exporter des données

1. Allez dans **Rapports**
2. Sélectionnez la période
3. Cliquez sur **Export Excel** ou **Export PDF**
4. Le fichier est téléchargé automatiquement

---

## 📚 Documentation

### Guides complets

- **[Guide d'utilisation](GUIDE_UTILISATION.md)** : Documentation utilisateur complète (60 pages)
- **[Guide technique](GUIDE_TECHNIQUE.md)** : Documentation développeur (architecture, API, maintenance)

### Structure du projet

```
made_ong_humanitarian/
├── src/
│   ├── components/       # Composants React
│   ├── pages/            # Pages de l'application
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et types
│   └── assets/           # Images et assets
├── supabase/
│   └── migrations/       # Scripts SQL
├── GUIDE_UTILISATION.md  # Guide utilisateur
├── GUIDE_TECHNIQUE.md    # Guide développeur
└── README.md             # Ce fichier
```

### API Supabase

**Exemple : Récupérer les bénéficiaires**

```typescript
const { data, error } = await supabase
  .from('profiles_beneficiaires')
  .select('*')
  .eq('is_archived', false)
  .order('created_at', { ascending: false })
```

**Exemple : Enregistrer un pointage**

```typescript
const { data, error } = await supabase
  .from('historique_pointages')
  .insert({
    beneficiaire_id: beneficiaireId,
    type: 'ENTREE',
    methode: 'AUTO',
  })
```

---

## 🌐 Déploiement

### Déploiement actuel

L'application est déployée sur : **https://23bsra2hqe.skywork.website**

### Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans le dashboard Vercel
# Settings → Environment Variables
# Ajouter VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# Déployer en production
vercel --prod
```

### Déployer sur Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Déployer
netlify deploy --prod --dir=dist

# Configurer les variables d'environnement dans le dashboard Netlify
# Site settings → Environment variables
```

---

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev              # Lancer le serveur de développement

# Build
npm run build            # Build de production
npm run preview          # Aperçu du build

# Linting
npm run lint             # Vérifier le code

# Tests (à ajouter)
npm run test             # Lancer les tests
```

---

## 🐛 Dépannage

### Problèmes courants

**"Email ou mot de passe incorrect"**
- Vérifiez : `Made711@gmail.com` (avec majuscule M)
- Mot de passe : `made@711`
- Vérifiez que l'utilisateur existe dans Supabase Auth

**"Erreur de connexion au serveur"**
- Vérifiez votre connexion internet
- Vérifiez les clés API dans `.env`
- Vérifiez que Supabase est accessible

**Scanner ne fonctionne pas**
- Vérifiez que le scanner est branché
- Testez dans un éditeur de texte (Notepad)
- Vérifiez que le scanner est en mode "USB HID Keyboard"

**Voir la documentation complète** : [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)

---

## 📞 Support

### Contact

**Email** : Made711@gmail.com

### Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)
- [Documentation Tailwind CSS](https://tailwindcss.com)

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- **ONG MADE** : Pour la confiance et les spécifications détaillées
- **Supabase** : Pour la plateforme backend exceptionnelle
- **shadcn/ui** : Pour les composants UI de qualité
- **Communauté open source** : Pour tous les outils utilisés

---

## 📊 Statistiques du projet

- **Lignes de code** : ~5000
- **Composants React** : 15+
- **Pages** : 9
- **Tables base de données** : 4
- **Triggers automatiques** : 4
- **Politiques RLS** : 8
- **Temps de développement** : 1 jour

---

## 🗺️ Roadmap

### Version 1.1 (Q2 2026)

- [ ] Application mobile (React Native)
- [ ] Mode hors ligne avec synchronisation
- [ ] Notifications push
- [ ] Reconnaissance faciale (alternative au scanner)

### Version 1.2 (Q3 2026)

- [ ] Multi-langue (Français, Malgache, Italien, Anglais)
- [ ] Rapports avancés avec IA
- [ ] Intégration SMS pour alertes
- [ ] API publique pour intégrations tierces

### Version 2.0 (Q4 2026)

- [ ] Multi-ONG (plusieurs organisations sur la même plateforme)
- [ ] Gestion des stocks (nourriture, médicaments)
- [ ] Module de comptabilité
- [ ] Tableau de bord donateurs en temps réel

---

## 📸 Captures d'écran

### Page de connexion
![Login](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Gestion des bénéficiaires
![Beneficiaires](docs/screenshots/beneficiaires.png)

### Interface de pointage
![Pointage](docs/screenshots/pointage.png)

### Génération de badges
![Badges](docs/screenshots/badges.png)

---

## 🌟 Fonctionnalités avancées

### Optimistic UI

L'application utilise Optimistic UI pour compenser la connexion internet faible à Madagascar :

```typescript
// L'action s'affiche immédiatement
toast.success('Pointage enregistré')

// La synchronisation se fait en arrière-plan
await supabase.from('historique_pointages').insert(...)
```

### Anti-rebond

Empêche les doubles scans accidentels :

```typescript
const lastScanTime = new Date(dernierPointage.timestamp).getTime()
const now = Date.now()
if (now - lastScanTime < 1000) {
  toast.warning('Scan trop rapide, veuillez patienter')
  return
}
```

### Feedback audio

Sons générés dynamiquement sans fichiers externes :

```typescript
// Bip de succès (440 Hz)
playSuccessBeep()

// Buzzer d'erreur (200 Hz)
playErrorBuzz()
```

---

## 💡 Conseils d'utilisation

### Pour les administrateurs

1. **Backup régulier** : Exportez les données chaque semaine
2. **Archivage** : Archivez les anciens bénéficiaires au lieu de les supprimer
3. **Audit** : Consultez le journal d'audit régulièrement
4. **Photos** : Optimisez les photos (max 500 KB) pour économiser l'espace

### Pour les développeurs

1. **Code quality** : Utilisez ESLint et TypeScript strict
2. **Performance** : Utilisez React Query pour le cache
3. **Sécurité** : Ne modifiez jamais les politiques RLS
4. **Tests** : Ajoutez des tests pour les fonctionnalités critiques

---

## 🎓 Apprentissage

Ce projet est un excellent exemple pour apprendre :

- ✅ Architecture React moderne (hooks, context, query)
- ✅ TypeScript avancé (types, interfaces, generics)
- ✅ Supabase (PostgreSQL, RLS, Storage, Auth)
- ✅ Tailwind CSS v4 (design system, responsive)
- ✅ Intégration hardware (scanner USB)
- ✅ Exports (Excel, PDF, Word)
- ✅ Optimistic UI et UX pour connexion faible

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Développé avec ❤️ pour l'humanitaire*

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**
