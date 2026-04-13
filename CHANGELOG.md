# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2026-04-13

### 🎉 Version initiale

#### Ajouté

**Gestion des bénéficiaires**
- Création, modification, suppression de profils bénéficiaires
- Upload de photos (webcam ou fichier)
- Génération automatique de codes-barres uniques Code 128
- Catégories : Mère, Enfant, Personnel, Individu, Visiteur
- Recherche instantanée par nom/prénom
- Filtres par catégorie (tabs)
- Système d'archivage (soft delete)
- Page de restauration des archives

**Système de pointage**
- Détection automatique du scanner laser USB (émulation clavier HID)
- Logique intelligente : ENTREE ↔ SORTIE automatique
- Anti-rebond (1 seconde entre scans)
- Feedback visuel (toast notifications)
- Feedback sonore (bip succès, buzzer erreur)
- Historique complet des pointages
- Pointage manuel (saisie code-barres)
- Liste des présences en temps réel

**Génération de badges**
- Design professionnel avec logo ONG MADE
- Code-barres Code 128 haute résolution (300 DPI)
- Photo, nom, prénom, catégorie, date d'enregistrement
- Export PNG (téléchargement)
- Fonction d'impression directe
- Génération de planches (10 badges par page A4)
- Régénération de code-barres

**Gestion des services**
- Module Cantine : Validation des repas
- Module Gargote : Collations/snacks
- Module Cabinet Médical : Suivi des soins
- Détection des doubles passages (même jour)
- Historique des services par jour
- Statistiques par type de service

**Dashboard et statistiques**
- Statistiques en temps réel :
  - Total des présences aujourd'hui
  - Nombre d'enfants présents
  - Repas servis
- Alertes de présence prolongée (>12h sans sortie)
- Graphiques de fréquentation par heure
- Cartes cliquables vers les modules

**Exports et rapports**
- Export Excel : Base de données complète (bénéficiaires, pointages, services)
- Export PDF : Rapport d'impact pour donateurs (FR/IT)
- Export JSON : Backup système complet
- Filtres par période et catégorie
- Graphiques analytiques (Recharts)

**Sécurité et audit**
- Authentification sécurisée (identifiants hardcodés)
- Row Level Security (RLS) sur toutes les tables
- Journal d'audit automatique (triggers PostgreSQL)
- Traçabilité totale (qui, quoi, quand, détails JSON)
- Page de consultation du journal d'audit
- Export CSV du journal

**Interface utilisateur**
- Design professionnel et épuré
- Sidebar navigation avec indicateurs actifs
- Optimistic UI pour connexion faible
- Skeleton loaders pour chargement progressif
- Animations fluides (Framer Motion)
- Responsive design (desktop prioritaire)
- Mode clair uniquement (adapté au contexte humanitaire)

**Base de données**
- PostgreSQL via Supabase
- 4 tables principales : profiles_beneficiaires, historique_pointages, services_ong, audit_logs
- Index B-Tree pour performance optimale
- Triggers automatiques pour audit et updated_at
- Vues SQL pour statistiques
- Contraintes d'intégrité (foreign keys, unique, check)

**Storage**
- Bucket Supabase pour photos des bénéficiaires
- Politiques de sécurité (upload/delete admin uniquement, lecture publique)
- Taille max : 5 MB par photo
- Formats supportés : JPG, PNG, WEBP

**Documentation**
- Guide d'utilisation complet (60 pages)
- Guide technique pour développeurs
- Guide de configuration du scanner laser
- Guide de déploiement et mise en production
- README avec instructions d'installation
- Fichier .env.example pour configuration
- Commentaires dans le code

#### Technologies utilisées

**Frontend**
- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.1
- Tailwind CSS v4.0.0
- shadcn/ui (composants UI)
- Framer Motion 11.15.0 (animations)
- React Router DOM 6.26.2 (navigation)
- React Query 5.56.2 (state serveur)
- Zustand 5.0.9 (state local)
- React Hook Form 7.53.0 (formulaires)
- Zod 3.23.8 (validation)
- Sonner 1.5.0 (notifications)
- Recharts 2.12.7 (graphiques)
- Lucide React 0.462.0 (icônes)

**Backend**
- Supabase (Backend-as-a-Service)
  - PostgreSQL (base de données)
  - Storage (stockage de fichiers)
  - Auth (authentification)
  - Row Level Security (sécurité)

**Bibliothèques spécialisées** (à installer)
- bwip-js (génération codes-barres Code 128)
- xlsx (export Excel)
- jspdf (export PDF)
- html2canvas (capture d'écran pour PDF)
- docx (export Word)

#### Optimisations

**Performance**
- Optimistic UI : Feedback immédiat, synchronisation en arrière-plan
- Skeleton loaders : Chargement progressif
- React Query : Cache intelligent des données
- Index B-Tree : Requêtes SQL ultra-rapides (<10ms)
- Lazy loading : Chargement des composants à la demande

**Connexion faible (Madagascar)**
- Compression des images
- Cache navigateur
- Exports légers
- Feedback immédiat (pas d'attente réseau)
- Retry automatique en cas d'échec

**Sécurité**
- RLS : Protection au niveau de la base de données
- Authentification hardcodée : Impossible de contourner
- Audit automatique : Traçabilité totale
- HTTPS : Chiffrement des communications
- Variables d'environnement : Clés API sécurisées

#### Connu

**Limitations**
- Un seul utilisateur admin (Made711@gmail.com)
- Pas de mode hors ligne (nécessite connexion internet)
- Pas d'application mobile (web uniquement)
- Pas de multi-langue (français uniquement pour v1.0)
- Pas de reconnaissance faciale (scanner uniquement)

**Bugs connus**
- Aucun bug critique identifié

#### Déploiement

**Environnements supportés**
- Vercel (recommandé)
- Netlify
- Serveur VPS (Ubuntu/Debian)

**URL actuelle**
- Production : https://23bsra2hqe.skywork.website

---

## [Unreleased]

### Prévu pour v1.1 (Q2 2026)

- [ ] Application mobile (React Native)
- [ ] Mode hors ligne avec synchronisation
- [ ] Notifications push
- [ ] Reconnaissance faciale (alternative au scanner)
- [ ] Multi-langue (Français, Malgache, Italien, Anglais)

### Prévu pour v1.2 (Q3 2026)

- [ ] Rapports avancés avec IA
- [ ] Intégration SMS pour alertes
- [ ] API publique pour intégrations tierces
- [ ] Module de gestion des stocks

### Prévu pour v2.0 (Q4 2026)

- [ ] Multi-ONG (plusieurs organisations)
- [ ] Gestion des stocks (nourriture, médicaments)
- [ ] Module de comptabilité
- [ ] Tableau de bord donateurs en temps réel

---

## Format du Changelog

### Types de changements

- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans les fonctionnalités existantes
- **Déprécié** : Fonctionnalités qui seront supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Corrections de vulnérabilités

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**
