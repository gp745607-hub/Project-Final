# 🖨️ CONFIGURATION DU SCANNER LASER USB

Guide complet pour configurer et utiliser un scanner laser USB avec l'application ONG MADE.

---

## 📋 Table des matières

1. [Compatibilité](#compatibilité)
2. [Installation matérielle](#installation-matérielle)
3. [Configuration du scanner](#configuration-du-scanner)
4. [Test du scanner](#test-du-scanner)
5. [Utilisation dans l'application](#utilisation-dans-lapplication)
6. [Dépannage](#dépannage)
7. [Recommandations](#recommandations)

---

## ✅ Compatibilité

### Scanners compatibles

L'application fonctionne avec **tous les scanners laser USB** qui utilisent l'émulation clavier (HID - Human Interface Device).

**Marques testées** :
- ✅ Honeywell (Voyager, Xenon)
- ✅ Zebra (DS2208, DS4308)
- ✅ Datalogic (QuickScan, Gryphon)
- ✅ Symbol (LS2208, DS6708)
- ✅ Scanners génériques USB (la plupart)

**Types de codes-barres supportés** :
- ✅ Code 128 (utilisé par l'application)
- ✅ Code 39
- ✅ EAN-13, EAN-8
- ✅ UPC-A, UPC-E
- ✅ QR Code (si scanner 2D)
- ✅ DataMatrix (si scanner 2D)

### Systèmes d'exploitation

- ✅ Windows 7/8/10/11
- ✅ macOS 10.14+
- ✅ Linux (Ubuntu, Debian, etc.)

**Aucun driver nécessaire** : Le scanner est reconnu automatiquement comme un clavier USB.

---

## 🔌 Installation matérielle

### Étape 1 : Déballage

1. Sortez le scanner de sa boîte
2. Vérifiez que vous avez :
   - Scanner laser
   - Câble USB
   - Support (optionnel)
   - Manuel (optionnel)

### Étape 2 : Connexion

1. **Branchez le câble USB** :
   - Connectez une extrémité au scanner
   - Connectez l'autre extrémité à un port USB de l'ordinateur

2. **Attendez la reconnaissance** :
   - Windows : "Périphérique prêt à l'emploi"
   - macOS : Aucun message (reconnaissance silencieuse)
   - Linux : Vérifiez avec `lsusb`

3. **Vérifiez le voyant** :
   - Le scanner doit s'allumer (LED rouge/verte)
   - Si pas de lumière, vérifiez le branchement

### Étape 3 : Positionnement

**Scanner à main** :
- Gardez-le à portée de main
- Utilisez le support si disponible

**Scanner fixe** :
- Montez-le sur le support
- Orientez-le vers la zone de scan
- Ajustez la hauteur (15-20 cm du badge)

---

## ⚙️ Configuration du scanner

### Mode par défaut (recommandé)

La plupart des scanners sont pré-configurés en mode "USB HID Keyboard" (émulation clavier). **Aucune configuration nécessaire** dans ce cas.

### Vérifier le mode

1. Ouvrez un éditeur de texte (Notepad, TextEdit, etc.)
2. Scannez un code-barres
3. Si le texte apparaît → ✅ Mode correct
4. Si rien ne se passe → Configuration nécessaire

### Configurer le mode (si nécessaire)

**Méthode 1 : Codes-barres de configuration**

La plupart des scanners ont des codes-barres de configuration dans leur manuel.

1. Trouvez le code-barres "USB HID Keyboard Mode"
2. Scannez-le
3. Le scanner émet un bip de confirmation
4. Testez à nouveau

**Méthode 2 : Logiciel du fabricant**

Certains fabricants fournissent un logiciel de configuration :

- **Honeywell** : EZConfig Scanning
- **Zebra** : 123Scan
- **Datalogic** : Datalogic Aladdin

Téléchargez le logiciel, connectez le scanner, et sélectionnez "USB HID Keyboard".

### Paramètres recommandés

**Suffixe** : Enter (CR) ou Tab
- Permet de valider automatiquement le scan
- Déjà configuré par défaut sur la plupart des scanners

**Préfixe** : Aucun
- Pas de caractère avant le code-barres

**Délai entre caractères** : Minimum (0-10ms)
- Pour une détection rapide par l'application

**Bip sonore** : Activé
- Feedback audio lors du scan

---

## 🧪 Test du scanner

### Test 1 : Éditeur de texte

1. Ouvrez Notepad (Windows) ou TextEdit (Mac)
2. Scannez un code-barres
3. Vérifiez que le texte apparaît instantanément
4. Vérifiez qu'il y a un retour à la ligne (Enter)

**Résultat attendu** :
```
123456789012
[curseur ici]
```

### Test 2 : Vitesse de scan

1. Scannez plusieurs codes-barres rapidement
2. Tous doivent être détectés
3. Aucun caractère manquant

**Si des caractères manquent** :
- Le scanner est trop lent
- Augmentez le délai entre caractères dans la config

### Test 3 : Codes-barres de test

Imprimez ces codes-barres de test :

**Code 128** :
```
*123456789012*
```

**EAN-13** :
```
5901234123457
```

Scannez-les pour vérifier la compatibilité.

### Test 4 : Application ONG MADE

1. Ouvrez l'application
2. Allez dans **Pointage**
3. Scannez un badge
4. Vérifiez le feedback visuel et sonore

---

## 💻 Utilisation dans l'application

### Détection automatique

L'application détecte automatiquement le scanner grâce à l'algorithme suivant :

```typescript
// Temps entre deux touches < 40ms → Scanner
// Temps entre deux touches > 40ms → Humain

if (timeDiff < 40 && timeDiff > 0) {
  setIsScanning(true)
}
```

**Principe** :
- Un humain tape à ~100-200ms par touche
- Un scanner tape à ~5-20ms par touche
- L'application fait la différence automatiquement

### Workflow de pointage

1. **Scanner le badge** :
   - Approchez le badge du scanner (5-15 cm)
   - Le scanner émet un bip
   - Le laser lit le code-barres

2. **Détection par l'application** :
   - L'application reçoit le code-barres
   - Recherche le bénéficiaire en base de données
   - Détermine le type (ENTREE ou SORTIE)

3. **Feedback** :
   - 🔊 Bip aigu : Succès
   - 🔊 Buzzer grave : Erreur
   - 💚 Toast vert : "Jean Rakoto - ENTREE"
   - 🔴 Toast rouge : "Bénéficiaire non trouvé"

4. **Enregistrement** :
   - Le pointage est enregistré en base de données
   - L'historique est mis à jour
   - Les statistiques sont actualisées

### Anti-rebond

L'application empêche les doubles scans accidentels :

```typescript
// Impossible de scanner deux fois en moins d'1 seconde
if (now - lastScanTime < 1000) {
  toast.warning('Scan trop rapide, veuillez patienter')
  return
}
```

**Pourquoi ?**
- Évite les tremblements de main
- Évite les scans multiples involontaires
- Garantit l'intégrité des données

---

## 🐛 Dépannage

### Problème : Scanner non détecté

**Symptômes** :
- Aucune réaction lors du scan
- Pas de feedback visuel/sonore

**Solutions** :

1. **Vérifier le branchement** :
   - Débranchez et rebranchez le scanner
   - Essayez un autre port USB
   - Vérifiez que le voyant du scanner est allumé

2. **Tester dans un éditeur de texte** :
   - Ouvrez Notepad
   - Scannez un code-barres
   - Si rien ne se passe → Problème matériel

3. **Vérifier le mode** :
   - Le scanner doit être en mode "USB HID Keyboard"
   - Consultez le manuel pour le configurer

4. **Redémarrer le navigateur** :
   - Fermez complètement le navigateur
   - Rouvrez l'application

### Problème : Scans trop lents

**Symptômes** :
- Délai de 2-3 secondes entre scan et feedback
- L'application semble "lente"

**Solutions** :

1. **Vérifier la connexion internet** :
   - L'application utilise Optimistic UI
   - Le feedback est immédiat, la synchro se fait en arrière-plan
   - Si connexion très lente, augmentez le timeout

2. **Vider le cache du navigateur** :
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)
   - Cochez "Cache" et validez

3. **Utiliser Chrome ou Edge** :
   - Meilleure performance que Firefox/Safari
   - Support optimal de Web Audio API

### Problème : Caractères manquants

**Symptômes** :
- Le code-barres scanné est incomplet
- Exemple : "12345" au lieu de "123456789012"

**Solutions** :

1. **Nettoyer la vitre du scanner** :
   - Utilisez un chiffon doux
   - Enlevez la poussière et les traces

2. **Vérifier le code-barres** :
   - Le badge est-il abîmé ?
   - Le code-barres est-il net ?
   - Réimprimez le badge si nécessaire

3. **Ajuster la distance** :
   - Trop près : Flou
   - Trop loin : Pas de lecture
   - Distance optimale : 5-15 cm

4. **Configurer le délai** :
   - Augmentez le délai entre caractères dans la config du scanner
   - Consultez le manuel

### Problème : Doubles scans

**Symptômes** :
- Un seul scan enregistre deux pointages
- Message "Scan trop rapide"

**Solutions** :

1. **Attendre 1 seconde** :
   - L'anti-rebond est de 1 seconde
   - Attendez le feedback avant de rescanner

2. **Scanner plus lentement** :
   - Ne pas "mitrailler" le scanner
   - Un scan = un bip = attendre

3. **Vérifier le badge** :
   - Si le code-barres est dupliqué sur le badge, le scanner peut lire deux fois

### Problème : Bénéficiaire non trouvé

**Symptômes** :
- Toast rouge : "Bénéficiaire non trouvé"
- Le code-barres est pourtant correct

**Solutions** :

1. **Vérifier en base de données** :
   - Allez dans **Bénéficiaires**
   - Recherchez le code-barres
   - Vérifiez qu'il existe

2. **Régénérer le code-barres** :
   - Allez dans **Badges**
   - Cliquez sur "Régénérer code-barres"
   - Imprimez le nouveau badge

3. **Vérifier l'archivage** :
   - Le bénéficiaire est peut-être archivé
   - Allez dans **Archives**
   - Restaurez-le si nécessaire

---

## 💡 Recommandations

### Choix du scanner

**Budget limité** :
- Scanner 1D générique USB (~20-50€)
- Suffit pour Code 128

**Budget moyen** :
- Honeywell Voyager 1200g (~80-120€)
- Fiable, rapide, durable

**Budget élevé** :
- Zebra DS2208 (~150-200€)
- Scanner 2D, QR Code, très rapide

### Maintenance

**Nettoyage** :
- Nettoyez la vitre chaque semaine
- Utilisez un chiffon doux et sec
- Pas de produits chimiques

**Stockage** :
- Rangez le scanner dans un endroit sec
- Évitez les chocs
- Débranchez si inutilisé longtemps

**Durée de vie** :
- Scanner de qualité : 5-10 ans
- Scanner générique : 2-5 ans

### Impression des badges

**Qualité** :
- Imprimez en haute résolution (300 DPI minimum)
- Utilisez du papier cartonné (250-300g/m²)
- Encre noire pure (pas de gris)

**Format** :
- Code-barres : 40-50mm de large
- Hauteur : 15-20mm
- Quiet Zone (marge blanche) : 5mm de chaque côté

**Plastification** :
- Recommandée pour la durabilité
- Évite l'usure et les taches
- Attention : Pas de plastification brillante (reflets)

### Ergonomie

**Position du scanner** :
- À hauteur de main (80-100 cm)
- Angle de 45° vers le haut
- Distance de scan : 10-15 cm

**Éclairage** :
- Évitez la lumière directe du soleil
- Éclairage indirect recommandé
- Pas d'ombre sur le code-barres

**Formation du personnel** :
- Montrez comment tenir le badge
- Expliquez la distance optimale
- Insistez sur l'attente du bip

---

## 📊 Statistiques de performance

### Temps de scan

- **Scanner générique** : 100-200ms
- **Scanner professionnel** : 50-100ms
- **Détection application** : <40ms
- **Feedback utilisateur** : Immédiat (Optimistic UI)
- **Enregistrement DB** : 100-500ms (arrière-plan)

### Taux de réussite

- **Code-barres neuf** : 99.9%
- **Code-barres usé** : 95-98%
- **Code-barres abîmé** : 70-90%
- **Code-barres illisible** : 0%

### Durabilité

- **Scanner professionnel** : 100,000+ scans
- **Badge plastifié** : 1000+ scans
- **Badge papier** : 100-200 scans

---

## 🎓 Formation du personnel

### Checklist de formation

- [ ] Brancher le scanner
- [ ] Tester dans un éditeur de texte
- [ ] Scanner un badge dans l'application
- [ ] Comprendre le feedback (bip, toast)
- [ ] Gérer les erreurs (bénéficiaire non trouvé)
- [ ] Nettoyer le scanner
- [ ] Signaler les problèmes

### Exercices pratiques

1. **Scan basique** :
   - Scanner 10 badges différents
   - Vérifier que tous sont enregistrés

2. **Gestion d'erreur** :
   - Scanner un badge inexistant
   - Comprendre le message d'erreur
   - Savoir quoi faire

3. **Maintenance** :
   - Nettoyer la vitre du scanner
   - Vérifier l'état des badges
   - Signaler les badges abîmés

---

## 📞 Support

### Contact

**Email** : Made711@gmail.com

### Ressources

- [Manuel du scanner](docs/scanner-manual.pdf)
- [Guide d'utilisation](GUIDE_UTILISATION.md)
- [Guide technique](GUIDE_TECHNIQUE.md)

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Guide scanner v1.0.0*
