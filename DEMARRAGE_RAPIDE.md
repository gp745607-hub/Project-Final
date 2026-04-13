# ⚡ DÉMARRAGE RAPIDE - 15 MINUTES

Guide ultra-rapide pour démarrer avec l'application ONG MADE en 15 minutes.

---

## ⏱️ TEMPS ESTIMÉ : 15 MINUTES

- ⏰ Configuration Supabase : 5 minutes
- ⏰ Premier test : 5 minutes
- ⏰ Premier bénéficiaire : 5 minutes

---

## 🚀 ÉTAPE 1 : CONFIGURATION SUPABASE (5 minutes)

### 1.1 Créer le projet (2 min)

1. Allez sur https://supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez :
   - **Name** : `made-ong`
   - **Database Password** : Générez un mot de passe fort
   - **Region** : `Europe (Frankfurt)`
4. Cliquez sur **"Create new project"**
5. ⏳ Attendez 2 minutes (création de l'infrastructure)

### 1.2 Exécuter le script SQL (2 min)

1. Dans Supabase, cliquez sur **"SQL Editor"** (menu gauche)
2. Ouvrez le fichier : `supabase/migrations/init_database_structure_2026_04_13.sql`
3. Copiez TOUT le contenu (Ctrl+A, Ctrl+C)
4. Collez dans l'éditeur SQL (Ctrl+V)
5. Cliquez sur **"Run"** (en bas à droite)
6. ✅ Vous devez voir : "Success. No rows returned"

### 1.3 Créer l'utilisateur admin (1 min)

1. Cliquez sur **"Authentication"** → **"Users"** (menu gauche)
2. Cliquez sur **"Add user"** → **"Create new user"**
3. Remplissez :
   - **Email** : `Made711@gmail.com` (EXACTEMENT comme ça)
   - **Password** : `made@711`
   - ✅ Cochez **"Auto Confirm User"**
4. Cliquez sur **"Create user"**

✅ **Configuration Supabase terminée !**

---

## 🧪 ÉTAPE 2 : PREMIER TEST (5 minutes)

### 2.1 Ouvrir l'application (1 min)

1. Ouvrez votre navigateur (Chrome recommandé)
2. Allez sur : https://23bsra2hqe.skywork.website
3. Vous devez voir la page de connexion

### 2.2 Se connecter (1 min)

1. Entrez :
   - **Email** : `Made711@gmail.com`
   - **Password** : `made@711`
2. Cliquez sur **"Se connecter"**
3. ✅ Vous devez arriver sur le Dashboard

### 2.3 Explorer l'interface (3 min)

1. **Dashboard** : Vous voyez les statistiques (toutes à 0 pour l'instant)
2. **Menu latéral** : Cliquez sur chaque module pour explorer
   - Bénéficiaires
   - Pointage
   - Badges
   - Services
   - Rapports
   - Audit
   - Archives

✅ **Premier test réussi !**

---

## 👤 ÉTAPE 3 : PREMIER BÉNÉFICIAIRE (5 minutes)

### 3.1 Ajouter un bénéficiaire (3 min)

1. Cliquez sur **"Bénéficiaires"** (menu gauche)
2. Cliquez sur **"Ajouter"** (bouton en haut à droite)
3. Remplissez le formulaire :
   - **Nom** : `Rakoto`
   - **Prénom** : `Jean`
   - **Catégorie** : Sélectionnez `Individu`
   - **Date de naissance** : `01/01/1990`
   - **Photo** : Cliquez sur "Upload" et choisissez une photo (optionnel)
   - **Notes** : `Premier bénéficiaire de test`
4. Cliquez sur **"Enregistrer"**
5. ✅ Le bénéficiaire apparaît dans la liste avec un code-barres unique

### 3.2 Générer le badge (1 min)

1. Dans la liste des bénéficiaires, trouvez "Jean Rakoto"
2. Cliquez sur **"Générer badge"**
3. Le badge s'affiche avec :
   - Photo (si uploadée)
   - Nom et prénom
   - Catégorie
   - Code-barres Code 128
4. Cliquez sur **"Télécharger"** pour sauvegarder le badge

### 3.3 Tester le pointage (1 min)

1. Cliquez sur **"Pointage"** (menu gauche)
2. Dans "Pointage manuel", entrez le code-barres du bénéficiaire
   - (Le code-barres est visible sur le badge ou dans la liste des bénéficiaires)
3. Cliquez sur **"Valider"**
4. ✅ Vous devez voir :
   - Un toast vert : "Jean Rakoto - ENTREE"
   - Un bip sonore (si audio activé)
   - Le pointage apparaît dans l'historique

✅ **Premier bénéficiaire créé et testé !**

---

## 🎉 FÉLICITATIONS !

Vous avez terminé le démarrage rapide en 15 minutes !

### Ce que vous avez fait :

- ✅ Configuré Supabase (base de données)
- ✅ Créé l'utilisateur admin
- ✅ Testé la connexion
- ✅ Exploré l'interface
- ✅ Ajouté votre premier bénéficiaire
- ✅ Généré votre premier badge
- ✅ Effectué votre premier pointage

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat (aujourd'hui)

1. **Ajouter plus de bénéficiaires**
   - Allez dans Bénéficiaires → Ajouter
   - Créez 5-10 bénéficiaires de test

2. **Tester les exports**
   - Allez dans Rapports
   - Cliquez sur "Export Excel"
   - Ouvrez le fichier téléchargé

3. **Explorer les services**
   - Allez dans Services
   - Testez la validation cantine

### Court terme (cette semaine)

1. **Acheter le matériel**
   - Scanner laser USB (50-200€)
   - Imprimante pour badges (100-300€)
   - Papier cartonné

2. **Imprimer les badges**
   - Générez tous les badges
   - Imprimez-les sur papier cartonné
   - Plastifiez-les (recommandé)

3. **Tester le scanner**
   - Branchez le scanner USB
   - Allez dans Pointage
   - Scannez un badge imprimé
   - ✅ Le pointage doit être automatique

### Moyen terme (ce mois-ci)

1. **Former l'équipe**
   - 2-3 heures de formation
   - Exercices pratiques
   - Distribution de la documentation

2. **Migrer les données existantes**
   - Si vous avez des données papier/Excel
   - Importez-les dans l'application

3. **Déployer en production**
   - Utilisez l'application au quotidien
   - Collectez les retours
   - Ajustez si nécessaire

---

## 📚 DOCUMENTATION COMPLÈTE

Pour aller plus loin, consultez :

### Guides utilisateur

- **[README.md](README.md)** - Vue d'ensemble (10 pages)
- **[GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)** - Guide complet (60 pages)
- **[RECAPITULATIF.md](RECAPITULATIF.md)** - Référence rapide (10 pages)

### Guides technique

- **[GUIDE_TECHNIQUE.md](GUIDE_TECHNIQUE.md)** - Documentation développeur (50 pages)
- **[DEPLOIEMENT.md](DEPLOIEMENT.md)** - Guide de déploiement (40 pages)
- **[CONFIGURATION_SCANNER.md](CONFIGURATION_SCANNER.md)** - Guide scanner (30 pages)

### Autres

- **[COMMANDES.md](COMMANDES.md)** - Référence des commandes (15 pages)
- **[CONTACT.md](CONTACT.md)** - Contact et support (10 pages)
- **[INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md)** - Index complet

**Total** : ~256 pages de documentation

---

## 🆘 BESOIN D'AIDE ?

### Problèmes courants

**"Email ou mot de passe incorrect"**
- Vérifiez : `Made711@gmail.com` (avec majuscule M)
- Mot de passe : `made@711`

**"Erreur de connexion au serveur"**
- Vérifiez votre connexion internet
- Vérifiez que Supabase est configuré

**"Aucun bénéficiaire trouvé"**
- C'est normal au départ (base vide)
- Ajoutez votre premier bénéficiaire

### Support

**Email** : Made711@gmail.com

**Documentation** :
- [Guide d'utilisation](GUIDE_UTILISATION.md)
- [Contact et support](CONTACT.md)

---

## ✅ CHECKLIST DE DÉMARRAGE

- [ ] Projet Supabase créé
- [ ] Script SQL exécuté
- [ ] Utilisateur admin créé
- [ ] Connexion réussie
- [ ] Interface explorée
- [ ] Premier bénéficiaire ajouté
- [ ] Premier badge généré
- [ ] Premier pointage effectué
- [ ] Export Excel testé
- [ ] Documentation consultée

---

## 🎓 FORMATION

Pour une formation complète de votre équipe :

**Durée** : 2-3 heures

**Programme** :
1. Introduction (30 min)
2. Gestion des bénéficiaires (30 min)
3. Pointage (30 min)
4. Badges (20 min)
5. Services (20 min)
6. Rapports (20 min)
7. Pratique (30 min)

**Contact** : Made711@gmail.com

---

## 💡 CONSEILS

### Pour bien démarrer

1. **Commencez petit** : Ajoutez 5-10 bénéficiaires de test
2. **Testez tout** : Explorez tous les modules
3. **Lisez la documentation** : Au moins le README et le RECAPITULATIF
4. **Formez-vous** : Prenez le temps de comprendre
5. **Demandez de l'aide** : N'hésitez pas à contacter le support

### Pour réussir

1. **Planifiez** : Définissez un plan de déploiement
2. **Formez** : Assurez-vous que toute l'équipe est formée
3. **Testez** : Testez en conditions réelles avant le déploiement
4. **Sauvegardez** : Configurez les backups automatiques
5. **Suivez** : Surveillez les statistiques et les logs

---

## 🚀 VOUS ÊTES PRÊT !

Vous avez maintenant toutes les bases pour utiliser l'application ONG MADE.

**Prochaine étape** : Ajoutez vos vrais bénéficiaires et commencez à utiliser l'application au quotidien !

**Bonne chance ! 🎉**

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Démarrage rapide v1.0.0 - 13 avril 2026*
