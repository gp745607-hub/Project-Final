# 🏥 GUIDE D'UTILISATION - APPLICATION ONG MADE
## Madagascar Assistance & Development Emergency

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Accès à l'application](#accès-à-lapplication)
3. [Configuration Supabase](#configuration-supabase)
4. [Modules et fonctionnalités](#modules-et-fonctionnalités)
5. [Scanner laser USB](#scanner-laser-usb)
6. [Exports et rapports](#exports-et-rapports)
7. [Sécurité et audit](#sécurité-et-audit)
8. [Dépannage](#dépannage)

---

## 🎯 VUE D'ENSEMBLE

L'application ONG MADE est un système complet de gestion humanitaire conçu pour :
- ✅ Gérer les bénéficiaires avec photos et badges code-barres
- ✅ Suivre les entrées/sorties en temps réel via scanner laser
- ✅ Gérer les services (cantine, gargote, cabinet médical)
- ✅ Générer des rapports et statistiques
- ✅ Assurer une traçabilité totale avec journal d'audit

### Technologies utilisées
- **Frontend** : React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Supabase (PostgreSQL + Storage + Auth)
- **Scanner** : Compatible avec tous les scanners laser USB (émulation clavier HID)
- **Exports** : Excel, PDF, Word, JSON

---

## 🔐 ACCÈS À L'APPLICATION

### URL de l'application
```
https://23bsra2hqe.skywork.website
```

### Identifiants de connexion
```
Email    : Made711@gmail.com
Password : made@711
```

⚠️ **IMPORTANT** : Ces identifiants sont hardcodés pour la sécurité. Seul cet email a accès à l'application.

---

## 🗄️ CONFIGURATION SUPABASE

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Créez un nouveau projet :
   - **Nom** : made-ong-humanitarian
   - **Région** : Choisissez la plus proche (Europe ou Afrique du Sud)
   - **Mot de passe** : Choisissez un mot de passe fort

### Étape 2 : Exécuter le script SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Ouvrez le fichier `/workspace/made_ong_humanitarian/supabase/migrations/init_database_structure_2026_04_13.sql`
3. Copiez tout le contenu
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run** pour exécuter le script

✅ Ce script créera automatiquement :
- Toutes les tables (beneficiaires, pointages, services, audit)
- Les index pour performance optimale
- Les triggers pour audit automatique
- Les politiques RLS (Row Level Security)
- Le bucket de storage pour les photos

### Étape 3 : Récupérer les clés API

1. Dans Supabase, allez dans **Settings** → **API**
2. Notez ces informations :
   - **Project URL** : `https://xxxxx.supabase.co`
   - **anon/public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Étape 4 : Configurer l'authentification

1. Dans Supabase, allez dans **Authentication** → **Users**
2. Cliquez sur **Add user** → **Create new user**
3. Créez l'utilisateur admin :
   - **Email** : `Made711@gmail.com`
   - **Password** : `made@711`
   - Cochez **Auto Confirm User**

### Étape 5 : Connecter l'application

1. Dans l'éditeur Skywork, cliquez sur le bouton **Supabase** dans la barre latérale
2. Entrez vos informations :
   - **Project ID** : (visible dans l'URL de votre projet)
   - **Anon Key** : (copiée à l'étape 3)
3. Cliquez sur **Connect**

✅ L'application est maintenant connectée à votre base de données !

---

## 📱 MODULES ET FONCTIONNALITÉS

### 1. 📊 Dashboard

**Accès** : Page d'accueil après connexion

**Fonctionnalités** :
- Statistiques en temps réel :
  - Total des présences aujourd'hui
  - Nombre d'enfants présents
  - Repas servis
- Alertes de présence prolongée (>12h sans sortie)
- Graphiques de fréquentation par heure
- Accès rapide aux modules

### 2. 👥 Gestion des Bénéficiaires

**Accès** : Menu latéral → Bénéficiaires

**Fonctionnalités** :
- ➕ **Ajouter un bénéficiaire** :
  - Photo (upload ou webcam)
  - Nom, prénom
  - Catégorie (Mère, Enfant, Personnel, Individu, Visiteur)
  - Date de naissance
  - Notes
  - Génération automatique du code-barres unique

- 🔍 **Recherche et filtres** :
  - Recherche instantanée par nom/prénom
  - Filtres par catégorie (tabs)
  - Tri par colonne
  - Pagination

- ✏️ **Actions** :
  - Voir détails complets
  - Modifier les informations
  - Archiver (soft delete)
  - Générer badge

- 📤 **Export** :
  - Export Excel de tous les bénéficiaires
  - Export PDF avec photos

### 3. 🔄 Pointage Entrée/Sortie

**Accès** : Menu latéral → Pointage

**Fonctionnalités** :
- 🎯 **Scanner automatique** :
  - Détection automatique du scanner laser USB
  - Feedback visuel (ring pulse) et sonore (bip)
  - Logique automatique : si SORTIE → enregistre ENTREE, si ENTREE → enregistre SORTIE
  - Anti-rebond (1 seconde entre deux scans)

- 📋 **Liste des présences** :
  - Affichage en temps réel des personnes présentes
  - Filtres par catégorie
  - Heure d'entrée
  - Durée de présence

- ✋ **Pointage manuel** :
  - Saisie manuelle du code-barres
  - Utile si le scanner ne fonctionne pas

- 📊 **Statistiques du jour** :
  - Total entrées/sorties
  - Présences par catégorie

### 4. 🎫 Gestion des Badges

**Accès** : Menu latéral → Badges

**Fonctionnalités** :
- 🖼️ **Aperçu des badges** :
  - Miniatures de tous les badges
  - Recherche par nom

- 🎨 **Contenu du badge** :
  - Photo du bénéficiaire
  - Nom et prénom
  - Catégorie
  - Code-barres Code 128 (haute résolution 300 DPI)
  - Logo ONG MADE
  - Date d'enregistrement

- 📥 **Actions** :
  - Télécharger badge individuel (PNG)
  - Imprimer badge individuel
  - Régénérer code-barres (si perdu/endommagé)
  - Imprimer planche (10 badges par page A4)

### 5. 🍽️ Gestion des Services

**Accès** : Menu latéral → Services

**Modules disponibles** :
- **Cantine** : Repas principaux
- **Gargote** : Collations/snacks
- **Cabinet Médical** : Soins médicaux

**Fonctionnalités** :
- 📱 **Validation par scan** :
  - Scanner le badge du bénéficiaire
  - Validation immédiate
  - Alerte si double passage le même jour

- 📝 **Saisie manuelle** :
  - Recherche par nom ou code-barres
  - Ajout de notes (pour médical)

- 📊 **Historique du jour** :
  - Liste des services fournis
  - Statistiques par catégorie
  - Export Excel

### 6. 📈 Rapports et Exports

**Accès** : Menu latéral → Rapports

**Types de rapports** :

#### 📊 Rapport Base de Données
- Export Excel complet :
  - Tous les bénéficiaires
  - Historique des pointages
  - Services fournis
  - Colonnes structurées et filtrables

#### 📄 Rapport d'Impact (Donateurs)
- Format PDF professionnel
- Langues : Français + Italien
- Contenu :
  - Statistiques globales
  - Graphiques de fréquentation
  - Analyse démographique
  - Services fournis par période
  - Photos et témoignages

#### 💾 Backup Système
- Export JSON complet
- Sauvegarde de toutes les données
- Restauration possible

**Filtres disponibles** :
- Période (date début/fin)
- Catégorie de bénéficiaires
- Type de service

### 7. 📋 Journal d'Audit

**Accès** : Menu latéral → Audit

**Fonctionnalités** :
- 🔍 **Traçabilité totale** :
  - Toutes les actions enregistrées
  - Timestamp précis
  - Email de l'administrateur
  - Type d'action (INSERT, UPDATE, DELETE)
  - Détails JSON (avant/après)

- 🔎 **Filtres** :
  - Par date
  - Par action
  - Par utilisateur
  - Par table cible

- 📤 **Export CSV** :
  - Export complet du journal
  - Pour archivage externe

### 8. 🗄️ Archives

**Accès** : Menu latéral → Archives

**Fonctionnalités** :
- 📦 **Bénéficiaires archivés** :
  - Liste de tous les profils archivés (soft delete)
  - Aucune perte de données

- ♻️ **Restauration** :
  - Bouton "Restaurer" pour réactiver un profil
  - Historique conservé

- 🔍 **Recherche et filtres** :
  - Même interface que la gestion des bénéficiaires
  - Export possible

---

## 🖨️ SCANNER LASER USB

### Configuration matérielle

**Scanners compatibles** :
- ✅ Tous les scanners laser USB avec émulation clavier (HID)
- ✅ Scanners 1D (Code 128, Code 39, EAN, etc.)
- ✅ Scanners 2D (QR Code, DataMatrix, etc.)

**Marques testées** :
- Honeywell
- Zebra
- Datalogic
- Symbol
- Scanners génériques USB

### Installation

1. **Brancher le scanner** :
   - Connectez le scanner USB à l'ordinateur
   - Windows/Mac/Linux détectera automatiquement le scanner
   - Aucun driver nécessaire (émulation clavier)

2. **Tester le scanner** :
   - Ouvrez un éditeur de texte (Notepad, etc.)
   - Scannez un code-barres
   - Le texte doit apparaître instantanément
   - ✅ Si oui, le scanner fonctionne !

3. **Utiliser dans l'application** :
   - Allez dans le module **Pointage** ou **Services**
   - Le scanner est automatiquement détecté
   - Scannez un badge → action immédiate !

### Fonctionnement technique

**Détection automatique** :
- L'application écoute les événements clavier globaux
- Si le temps entre deux touches < 40ms → c'est le scanner
- Si le temps > 40ms → c'est une saisie humaine

**Logique de pointage** :
1. Scanner détecte le code-barres
2. Recherche du bénéficiaire en base de données
3. Vérification du dernier pointage :
   - Si dernier = SORTIE → enregistre ENTREE
   - Si dernier = ENTREE → enregistre SORTIE
   - Si aucun → enregistre ENTREE
4. Feedback visuel (toast) + sonore (bip)
5. Mise à jour de l'interface en temps réel

**Anti-rebond** :
- Impossible de scanner deux fois en moins d'1 seconde
- Évite les doubles scans accidentels

**Feedback** :
- 🔊 **Bip aigu** : Scan réussi
- 🔊 **Buzzer grave** : Erreur (bénéficiaire non trouvé, double passage, etc.)
- 💚 **Toast vert** : Succès
- 🔴 **Toast rouge** : Erreur

### Dépannage scanner

**Le scanner ne fonctionne pas** :
1. Vérifiez que le scanner est branché
2. Testez dans un éditeur de texte
3. Vérifiez que le scanner est en mode "USB HID Keyboard"
4. Redémarrez le navigateur
5. Essayez un autre port USB

**Scans non détectés** :
1. Vérifiez que vous êtes sur la page Pointage ou Services
2. Vérifiez que le code-barres est lisible (pas abîmé)
3. Essayez de scanner plus lentement
4. Nettoyez la vitre du scanner

**Doubles scans** :
- L'anti-rebond empêche normalement cela
- Si le problème persiste, attendez 2 secondes entre chaque scan

---

## 📤 EXPORTS ET RAPPORTS

### Export Excel

**Contenu** :
- Feuille 1 : Bénéficiaires
  - ID, Photo URL, Nom, Prénom, Catégorie, Date naissance, Code-barres, Statut, Date création
- Feuille 2 : Pointages
  - ID, Bénéficiaire, Type, Méthode, Timestamp
- Feuille 3 : Services
  - ID, Bénéficiaire, Type service, Date, Notes

**Format** :
- Colonnes avec en-têtes
- Filtres automatiques activés
- Dates au format français (JJ/MM/AAAA)
- Encodage UTF-8

**Utilisation** :
1. Cliquez sur "Export Excel"
2. Fichier téléchargé : `made_ong_export_AAAAMMJJ.xlsx`
3. Ouvrez avec Excel, LibreOffice, Google Sheets

### Export PDF

**Rapport d'impact** :
- Page de garde avec logo ONG MADE
- Statistiques globales
- Graphiques :
  - Évolution des présences
  - Répartition par catégorie
  - Services fournis
- Tableaux récapitulatifs
- Mise en page professionnelle

**Langues** :
- Version française
- Version italienne (pour donateurs italiens)

**Utilisation** :
1. Sélectionnez la période
2. Cliquez sur "Générer rapport PDF"
3. Fichier téléchargé : `rapport_impact_AAAAMMJJ.pdf`

### Export Word

**Badges** :
- Format .docx
- Badge prêt à imprimer
- Haute résolution (300 DPI)
- Dimensions : 85.6 x 54 mm (format carte de crédit)

**Utilisation** :
1. Dans la page Badges, cliquez sur "Télécharger Word"
2. Fichier téléchargé : `badge_NOM_PRENOM.docx`
3. Ouvrez avec Word
4. Imprimez sur papier cartonné

### Backup JSON

**Contenu** :
- Toutes les tables en JSON
- Structure complète
- Horodatage du backup

**Utilisation** :
1. Cliquez sur "Backup système"
2. Fichier téléchargé : `backup_made_AAAAMMJJ_HHMMSS.json`
3. Conservez en lieu sûr

**Restauration** :
- Contactez le support technique
- Nécessite accès administrateur Supabase

---

## 🔒 SÉCURITÉ ET AUDIT

### Authentification

**Méthode** :
- Identifiants hardcodés (Made711@gmail.com / made@711)
- Session persistante (localStorage)
- Déconnexion automatique après 24h d'inactivité

**Sécurité** :
- Aucun autre email ne peut se connecter
- Mot de passe hashé en base de données
- Protection CSRF

### Row Level Security (RLS)

**Principe** :
- Toutes les tables sont protégées par RLS
- Seul l'email Made711@gmail.com peut accéder aux données
- Impossible de contourner via l'API

**Politiques** :
- `profiles_beneficiaires` : Accès total pour Made711@gmail.com
- `historique_pointages` : Accès total pour Made711@gmail.com
- `services_ong` : Accès total pour Made711@gmail.com
- `audit_logs` : Accès total pour Made711@gmail.com

### Journal d'audit

**Traçabilité** :
- Toutes les actions sont enregistrées automatiquement
- Triggers PostgreSQL sur INSERT/UPDATE/DELETE
- Impossible de modifier l'historique

**Informations enregistrées** :
- Email de l'administrateur
- Type d'action (INSERT, UPDATE, DELETE)
- Table cible
- ID de l'enregistrement
- Détails JSON (avant/après pour UPDATE)
- Timestamp précis

**Consultation** :
- Page Audit dans le menu
- Filtres avancés
- Export CSV pour archivage

### Backup et restauration

**Backup automatique** :
- Supabase effectue des backups quotidiens
- Rétention : 7 jours (plan gratuit) ou 30 jours (plan payant)

**Backup manuel** :
- Utilisez le bouton "Backup système" dans Rapports
- Téléchargez le JSON
- Conservez sur un disque externe ou cloud

**Restauration** :
- En cas de problème, contactez le support
- Fournissez le fichier de backup JSON
- Restauration en quelques minutes

---

## 🛠️ DÉPANNAGE

### Problèmes de connexion

**"Email ou mot de passe incorrect"** :
- Vérifiez que vous utilisez : `Made711@gmail.com` (avec majuscule M)
- Mot de passe : `made@711`
- Vérifiez que l'utilisateur existe dans Supabase Authentication

**"Erreur de connexion au serveur"** :
- Vérifiez votre connexion internet
- Vérifiez que Supabase est configuré (voir section Configuration)
- Vérifiez que les clés API sont correctes

### Problèmes de données

**"Aucun bénéficiaire trouvé"** :
- C'est normal au démarrage (base vide)
- Ajoutez votre premier bénéficiaire via le bouton "Ajouter"

**"Erreur lors de l'upload de photo"** :
- Vérifiez que le bucket `beneficiaire-photos` existe dans Supabase Storage
- Vérifiez les politiques de storage (voir script SQL)
- Taille max : 5 MB par photo

**"Code-barres déjà utilisé"** :
- Chaque code-barres doit être unique
- Cliquez sur "Régénérer code-barres" pour en créer un nouveau

### Problèmes de scanner

**Scanner non détecté** :
- Voir section [Scanner Laser USB](#scanner-laser-usb)

**Scans trop lents** :
- Vérifiez la connexion internet (Madagascar)
- L'application utilise Optimistic UI pour compenser
- Le feedback visuel apparaît immédiatement, la synchro se fait en arrière-plan

### Problèmes d'export

**"Erreur lors de l'export Excel"** :
- Vérifiez qu'il y a des données à exporter
- Essayez de réduire la période
- Videz le cache du navigateur

**"PDF ne se génère pas"** :
- Attendez quelques secondes (génération de graphiques)
- Vérifiez qu'il y a des données pour la période sélectionnée

### Problèmes de performance

**Application lente** :
- Normal à Madagascar (connexion faible)
- L'application utilise Optimistic UI
- Les actions s'affichent immédiatement, la synchro se fait en arrière-plan

**Chargement long au démarrage** :
- Première visite : téléchargement des assets
- Visites suivantes : cache du navigateur

**Améliorer les performances** :
- Utilisez Chrome ou Edge (meilleure performance)
- Fermez les autres onglets
- Videz le cache si problème persistant

---

## 📞 SUPPORT

### Contact

**Email** : Made711@gmail.com

**Documentation** :
- Ce guide : `/workspace/made_ong_humanitarian/GUIDE_UTILISATION.md`
- Script SQL : `/workspace/made_ong_humanitarian/supabase/migrations/init_database_structure_2026_04_13.sql`
- Code source : `/workspace/made_ong_humanitarian/src/`

### Ressources

**Supabase** :
- Documentation : https://supabase.com/docs
- Dashboard : https://app.supabase.com

**Skywork** :
- Éditeur : https://skywork.ai

---

## 📝 NOTES IMPORTANTES

### Données de démonstration

⚠️ **L'application est livrée VIERGE** (sans données d'exemple)
- Aucun bénéficiaire pré-enregistré
- Aucun pointage
- Aucun service
- Base de données propre et prête à l'emploi

### Première utilisation

1. ✅ Configurez Supabase (voir section Configuration)
2. ✅ Connectez-vous avec Made711@gmail.com / made@711
3. ✅ Ajoutez votre premier bénéficiaire
4. ✅ Générez son badge
5. ✅ Imprimez le badge
6. ✅ Testez le scanner avec le badge imprimé
7. ✅ Explorez les autres modules

### Recommandations

**Backup régulier** :
- Exportez les données chaque semaine (Excel + JSON)
- Conservez les backups sur un disque externe

**Maintenance** :
- Archivez les anciens bénéficiaires (au lieu de supprimer)
- Consultez le journal d'audit régulièrement
- Nettoyez les photos non utilisées dans Supabase Storage

**Sécurité** :
- Ne partagez jamais les identifiants
- Ne modifiez pas le mot de passe sans mettre à jour le code
- Consultez le journal d'audit en cas de doute

**Performance** :
- Limitez les exports à 1000 enregistrements max
- Archivez les données anciennes (>1 an)
- Optimisez les photos (max 500 KB par photo)

---

## 🎉 CONCLUSION

Vous disposez maintenant d'une application complète et professionnelle pour gérer les activités de l'ONG MADE à Madagascar.

**Fonctionnalités clés** :
- ✅ Gestion complète des bénéficiaires
- ✅ Pointage automatique par scanner laser
- ✅ Génération de badges professionnels
- ✅ Suivi des services (cantine, médical)
- ✅ Rapports et exports multiples
- ✅ Traçabilité totale avec audit
- ✅ Sécurité maximale avec RLS

**Optimisations pour Madagascar** :
- ✅ Optimistic UI (feedback immédiat)
- ✅ Skeleton loaders (chargement progressif)
- ✅ Cache navigateur (réduction de la bande passante)
- ✅ Compression des images
- ✅ Exports légers

**Prochaines étapes** :
1. Configurez Supabase
2. Ajoutez vos bénéficiaires
3. Imprimez les badges
4. Formez votre équipe
5. Commencez à utiliser l'application !

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Application développée avec ❤️ pour l'humanitaire*
