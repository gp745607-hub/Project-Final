# 🔧 GUIDE TECHNIQUE - APPLICATION ONG MADE
## Documentation Développeur

---

## 📋 TABLE DES MATIÈRES

1. [Architecture](#architecture)
2. [Structure du projet](#structure-du-projet)
3. [Base de données](#base-de-données)
4. [API et intégrations](#api-et-intégrations)
5. [Scanner laser](#scanner-laser)
6. [Exports](#exports)
7. [Déploiement](#déploiement)
8. [Maintenance](#maintenance)

---

## 🏗️ ARCHITECTURE

### Stack technique

```
┌─────────────────────────────────────────┐
│           FRONTEND (React)              │
│  React 18 + TypeScript + Vite           │
│  Tailwind CSS v4 + shadcn/ui            │
│  React Router + Zustand + React Query   │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         BACKEND (Supabase)              │
│  PostgreSQL + Row Level Security        │
│  Storage (Photos)                       │
│  Authentication                         │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│         HARDWARE (Scanner USB)          │
│  Émulation clavier HID                  │
│  Détection automatique                  │
└─────────────────────────────────────────┘
```

### Flux de données

```
Scanner USB → Événement clavier → Hook useScanner → 
Recherche DB → Logique pointage → Update DB → 
Feedback UI + Audio → Mise à jour temps réel
```

---

## 📁 STRUCTURE DU PROJET

```
made_ong_humanitarian/
├── public/
│   └── (assets statiques)
├── src/
│   ├── assets/
│   │   └── images.ts              # Images importées
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── Layout.tsx             # Layout principal
│   │   ├── Stats.tsx              # Cartes statistiques
│   │   ├── BeneficiaireTable.tsx  # Tableau bénéficiaires
│   │   ├── BeneficiaireForm.tsx   # Formulaire CRUD
│   │   ├── ScannerInterface.tsx   # Interface scanner
│   │   ├── BadgeGenerator.tsx     # Génération badges
│   │   ├── ExportButtons.tsx      # Boutons export
│   │   ├── ServiceModule.tsx      # Module services
│   │   └── AuditTable.tsx         # Tableau audit
│   ├── hooks/
│   │   └── useAuth.ts             # Hook authentification
│   ├── lib/
│   │   ├── index.ts               # Types, constantes, utils
│   │   ├── scanner.ts             # Hook scanner USB
│   │   ├── audio.ts               # Feedback audio
│   │   └── motion.ts              # Animations Framer Motion
│   ├── pages/
│   │   ├── Login.tsx              # Page connexion
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Beneficiaires.tsx      # Gestion bénéficiaires
│   │   ├── Pointage.tsx           # Pointage entrée/sortie
│   │   ├── Badges.tsx             # Gestion badges
│   │   ├── Services.tsx           # Gestion services
│   │   ├── Rapports.tsx           # Rapports et exports
│   │   ├── Audit.tsx              # Journal d'audit
│   │   └── Archives.tsx           # Bénéficiaires archivés
│   ├── App.tsx                    # Router principal
│   ├── main.tsx                   # Point d'entrée
│   └── index.css                  # Styles globaux + Design System
├── supabase/
│   └── migrations/
│       └── init_database_structure_2026_04_13.sql
├── GUIDE_UTILISATION.md           # Guide utilisateur
├── GUIDE_TECHNIQUE.md             # Ce fichier
└── package.json
```

---

## 🗄️ BASE DE DONNÉES

### Schéma complet

#### Table : `profiles_beneficiaires`

```sql
CREATE TABLE public.profiles_beneficiaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_url TEXT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('Mère', 'Enfant', 'Personnel', 'Individu', 'Visiteur')),
    date_naissance DATE,
    code_barre_unique VARCHAR(50) UNIQUE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_code_barre ON profiles_beneficiaires(code_barre_unique);
CREATE INDEX idx_categorie ON profiles_beneficiaires(categorie);
CREATE INDEX idx_archived ON profiles_beneficiaires(is_archived);
CREATE INDEX idx_nom_prenom ON profiles_beneficiaires(nom, prenom);
```

**Champs** :
- `id` : UUID unique
- `photo_url` : URL Supabase Storage
- `nom`, `prenom` : Identité
- `categorie` : Type de bénéficiaire (enum)
- `date_naissance` : Date de naissance
- `code_barre_unique` : Code-barres Code 128 (unique, indexé)
- `is_archived` : Soft delete (true = archivé)
- `notes` : Notes libres
- `created_at`, `updated_at` : Timestamps

#### Table : `historique_pointages`

```sql
CREATE TABLE public.historique_pointages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES profiles_beneficiaires(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('ENTREE', 'SORTIE')),
    methode VARCHAR(10) NOT NULL CHECK (methode IN ('AUTO', 'MANUEL')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Index pour requêtes rapides
CREATE INDEX idx_pointages_beneficiaire ON historique_pointages(beneficiaire_id);
CREATE INDEX idx_pointages_timestamp ON historique_pointages(timestamp DESC);
CREATE INDEX idx_pointages_type ON historique_pointages(type);
```

**Champs** :
- `id` : UUID unique
- `beneficiaire_id` : Foreign key vers profiles_beneficiaires
- `type` : ENTREE ou SORTIE
- `methode` : AUTO (scanner) ou MANUEL
- `timestamp` : Horodatage précis
- `created_by` : Email de l'admin (optionnel)

#### Table : `services_ong`

```sql
CREATE TABLE public.services_ong (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiaire_id UUID NOT NULL REFERENCES profiles_beneficiaires(id) ON DELETE CASCADE,
    type_service VARCHAR(20) NOT NULL CHECK (type_service IN ('CANTINE', 'GARGOTE', 'MEDICAL')),
    date_service DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255)
);

-- Index
CREATE INDEX idx_services_beneficiaire ON services_ong(beneficiaire_id);
CREATE INDEX idx_services_date ON services_ong(date_service DESC);
CREATE INDEX idx_services_type ON services_ong(type_service);

-- Contrainte : un seul service par type par jour
CREATE UNIQUE INDEX idx_unique_service_per_day 
ON services_ong(beneficiaire_id, type_service, date_service);
```

**Champs** :
- `id` : UUID unique
- `beneficiaire_id` : Foreign key
- `type_service` : CANTINE, GARGOTE ou MEDICAL
- `date_service` : Date du service
- `notes` : Notes (ex: diagnostic médical)
- `created_at` : Timestamp
- `created_by` : Email de l'admin

**Contrainte importante** : Un bénéficiaire ne peut recevoir qu'un seul service du même type par jour (évite les doubles passages).

#### Table : `audit_logs`

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id UUID,
    target_type VARCHAR(50),
    details_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_audit_email ON audit_logs(admin_email);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_timestamp ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_target ON audit_logs(target_id);
```

**Champs** :
- `id` : UUID unique
- `admin_email` : Email de l'admin qui a effectué l'action
- `action` : Type d'action (INSERT_profiles_beneficiaires, UPDATE_historique_pointages, etc.)
- `target_id` : ID de l'enregistrement modifié
- `target_type` : Nom de la table
- `details_json` : Détails complets en JSON (avant/après pour UPDATE)
- `created_at` : Timestamp

### Triggers automatiques

#### Trigger : Mise à jour `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_beneficiaires_updated_at
    BEFORE UPDATE ON profiles_beneficiaires
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Fonction** : Met à jour automatiquement `updated_at` à chaque modification.

#### Trigger : Audit automatique

```sql
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            NEW.id,
            TG_TABLE_NAME,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            NEW.id,
            TG_TABLE_NAME,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (admin_email, action, target_id, target_type, details_json)
        VALUES (
            COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'system'),
            TG_OP || '_' || TG_TABLE_NAME,
            OLD.id,
            TG_TABLE_NAME,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur toutes les tables
CREATE TRIGGER audit_beneficiaires
    AFTER INSERT OR UPDATE OR DELETE ON profiles_beneficiaires
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_pointages
    AFTER INSERT OR UPDATE OR DELETE ON historique_pointages
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_services
    AFTER INSERT OR UPDATE OR DELETE ON services_ong
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
```

**Fonction** : Enregistre automatiquement toutes les actions (INSERT, UPDATE, DELETE) dans `audit_logs`.

### Row Level Security (RLS)

```sql
-- Activer RLS
ALTER TABLE profiles_beneficiaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_pointages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_ong ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Politique : Accès total pour Made711@gmail.com uniquement
CREATE POLICY "Admin full access beneficiaires" ON profiles_beneficiaires
    FOR ALL
    USING (auth.jwt()->>'email' = 'Made711@gmail.com')
    WITH CHECK (auth.jwt()->>'email' = 'Made711@gmail.com');

-- (Répéter pour toutes les tables)
```

**Sécurité** :
- Seul l'email `Made711@gmail.com` peut accéder aux données
- Impossible de contourner via l'API Supabase
- Protection au niveau de la base de données

### Vues utiles

#### Vue : Dernier pointage

```sql
CREATE OR REPLACE VIEW v_dernier_pointage AS
SELECT DISTINCT ON (beneficiaire_id)
    beneficiaire_id,
    type,
    timestamp,
    methode
FROM historique_pointages
ORDER BY beneficiaire_id, timestamp DESC;
```

**Usage** : Récupérer rapidement le dernier pointage de chaque bénéficiaire (pour savoir s'il est présent ou non).

#### Vue : Statistiques du jour

```sql
CREATE OR REPLACE VIEW v_stats_jour AS
SELECT
    COUNT(DISTINCT CASE WHEN hp.type = 'ENTREE' THEN hp.beneficiaire_id END) as total_entrees,
    COUNT(DISTINCT CASE WHEN hp.type = 'ENTREE' AND pb.categorie = 'Enfant' THEN hp.beneficiaire_id END) as enfants_presents,
    COUNT(DISTINCT CASE WHEN so.type_service = 'CANTINE' THEN so.beneficiaire_id END) as repas_servis
FROM historique_pointages hp
LEFT JOIN profiles_beneficiaires pb ON hp.beneficiaire_id = pb.id
LEFT JOIN services_ong so ON so.beneficiaire_id = pb.id AND so.date_service = CURRENT_DATE
WHERE DATE(hp.timestamp) = CURRENT_DATE;
```

**Usage** : Afficher les statistiques du jour sur le dashboard.

### Storage (Photos)

```sql
-- Bucket pour photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('beneficiaire-photos', 'beneficiaire-photos', true);

-- Politiques
CREATE POLICY "Admin can upload photos" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'beneficiaire-photos' 
        AND auth.jwt()->>'email' = 'Made711@gmail.com'
    );

CREATE POLICY "Public can view photos" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'beneficiaire-photos');

CREATE POLICY "Admin can delete photos" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'beneficiaire-photos' 
        AND auth.jwt()->>'email' = 'Made711@gmail.com'
    );
```

**Organisation** :
- Bucket : `beneficiaire-photos`
- Chemin : `{beneficiaire_id}/{timestamp}.jpg`
- Taille max : 5 MB
- Formats : JPG, PNG, WEBP

---

## 🔌 API ET INTÉGRATIONS

### Supabase Client

**Configuration** : `src/integrations/supabase/client.ts` (généré automatiquement)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Variables d'environnement** : `.env`

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Opérations CRUD

#### Créer un bénéficiaire

```typescript
const { data, error } = await supabase
  .from('profiles_beneficiaires')
  .insert({
    nom: 'Rakoto',
    prenom: 'Jean',
    categorie: 'Individu',
    date_naissance: '1990-01-01',
    code_barre_unique: generateCodeBarre(),
    photo_url: photoUrl,
  })
  .select()
  .single()
```

#### Lire les bénéficiaires

```typescript
const { data, error } = await supabase
  .from('profiles_beneficiaires')
  .select('*')
  .eq('is_archived', false)
  .order('created_at', { ascending: false })
```

#### Mettre à jour

```typescript
const { data, error } = await supabase
  .from('profiles_beneficiaires')
  .update({ nom: 'Nouveau nom' })
  .eq('id', beneficiaireId)
```

#### Archiver (soft delete)

```typescript
const { data, error } = await supabase
  .from('profiles_beneficiaires')
  .update({ is_archived: true })
  .eq('id', beneficiaireId)
```

#### Upload photo

```typescript
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${beneficiaireId}/${Date.now()}.${fileExt}`

const { data, error } = await supabase.storage
  .from('beneficiaire-photos')
  .upload(fileName, file)

// URL publique
const { data: { publicUrl } } = supabase.storage
  .from('beneficiaire-photos')
  .getPublicUrl(fileName)
```

### Authentification

**Hook personnalisé** : `src/hooks/useAuth.ts`

```typescript
export function useAuth() {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier session localStorage
    const savedUser = localStorage.getItem('made_ong_user')
    if (savedUser) {
      setUser(savedUser)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Vérification hardcodée
    if (email === 'Made711@gmail.com' && password === 'made@711') {
      localStorage.setItem('made_ong_user', email)
      setUser(email)
      return { success: true }
    }
    return { success: false, error: 'Identifiants incorrects' }
  }

  const logout = () => {
    localStorage.removeItem('made_ong_user')
    setUser(null)
  }

  return { user, loading, login, logout }
}
```

**Protection des routes** : `src/App.tsx`

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <div>Chargement...</div>

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🖨️ SCANNER LASER

### Hook personnalisé : `useScanner`

**Fichier** : `src/lib/scanner.ts`

```typescript
export function useScanner(onScan: (code: string) => void) {
  const [buffer, setBuffer] = useState('')
  const [lastKeyTime, setLastKeyTime] = useState(0)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTime

      // Détection scanner : temps entre touches < 40ms
      if (timeDiff < 40 && timeDiff > 0) {
        setIsScanning(true)
      }

      // Si Enter, c'est la fin du scan
      if (e.key === 'Enter' && isScanning) {
        if (buffer.length > 0) {
          onScan(buffer)
          setBuffer('')
        }
        setIsScanning(false)
        return
      }

      // Accumuler les caractères
      if (isScanning && e.key.length === 1) {
        setBuffer(prev => prev + e.key)
      }

      setLastKeyTime(currentTime)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buffer, lastKeyTime, isScanning, onScan])

  return { isScanning }
}
```

**Principe** :
1. Écoute les événements clavier globaux
2. Mesure le temps entre deux touches
3. Si < 40ms → c'est le scanner (humain impossible)
4. Accumule les caractères dans un buffer
5. Quand Enter → déclenche le callback avec le code complet

### Logique de pointage

**Fichier** : `src/components/ScannerInterface.tsx`

```typescript
const handleScan = async (codeBarre: string) => {
  try {
    // 1. Rechercher le bénéficiaire
    const { data: beneficiaire, error } = await supabase
      .from('profiles_beneficiaires')
      .select('*')
      .eq('code_barre_unique', codeBarre)
      .single()

    if (error || !beneficiaire) {
      playErrorBuzz()
      toast.error('Bénéficiaire non trouvé')
      return
    }

    // 2. Récupérer le dernier pointage
    const { data: dernierPointage } = await supabase
      .from('historique_pointages')
      .select('*')
      .eq('beneficiaire_id', beneficiaire.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    // 3. Déterminer le type (ENTREE ou SORTIE)
    let type: 'ENTREE' | 'SORTIE' = 'ENTREE'
    
    if (dernierPointage) {
      // Si dernier = ENTREE → nouveau = SORTIE
      // Si dernier = SORTIE → nouveau = ENTREE
      type = dernierPointage.type === 'ENTREE' ? 'SORTIE' : 'ENTREE'
      
      // Anti-rebond : vérifier que le dernier scan n'est pas trop récent
      const lastScanTime = new Date(dernierPointage.timestamp).getTime()
      const now = Date.now()
      if (now - lastScanTime < 1000) {
        toast.warning('Scan trop rapide, veuillez patienter')
        return
      }
    }

    // 4. Enregistrer le pointage
    const { error: insertError } = await supabase
      .from('historique_pointages')
      .insert({
        beneficiaire_id: beneficiaire.id,
        type,
        methode: 'AUTO',
      })

    if (insertError) throw insertError

    // 5. Feedback
    playSuccessBeep()
    toast.success(`${beneficiaire.prenom} ${beneficiaire.nom} - ${type}`)

  } catch (error) {
    playErrorBuzz()
    toast.error('Erreur lors du pointage')
    console.error(error)
  }
}

// Utilisation du hook
const { isScanning } = useScanner(handleScan)
```

### Feedback audio

**Fichier** : `src/lib/audio.ts`

```typescript
// Bip de succès (440 Hz, 100ms)
export const playSuccessBeep = () => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 440 // La (A4)
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

// Buzzer d'erreur (200 Hz, 200ms)
export const playErrorBuzz = () => {
  const audioContext = new AudioContext()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 200 // Sol grave
  oscillator.type = 'sawtooth'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}
```

**Principe** : Utilise Web Audio API pour générer des sons sans fichiers externes.

---

## 📤 EXPORTS

### Export Excel

**Bibliothèque** : `xlsx` (à installer)

```bash
npm install xlsx
```

**Code** :

```typescript
import * as XLSX from 'xlsx'

const exportToExcel = async () => {
  // 1. Récupérer les données
  const { data: beneficiaires } = await supabase
    .from('profiles_beneficiaires')
    .select('*')
    .eq('is_archived', false)

  // 2. Formater les données
  const formattedData = beneficiaires.map(b => ({
    'ID': b.id,
    'Nom': b.nom,
    'Prénom': b.prenom,
    'Catégorie': b.categorie,
    'Date de naissance': b.date_naissance,
    'Code-barres': b.code_barre_unique,
    'Date d\'enregistrement': new Date(b.created_at).toLocaleDateString('fr-FR'),
  }))

  // 3. Créer le workbook
  const ws = XLSX.utils.json_to_sheet(formattedData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Bénéficiaires')

  // 4. Télécharger
  XLSX.writeFile(wb, `made_ong_export_${new Date().toISOString().split('T')[0]}.xlsx`)
}
```

### Export PDF

**Bibliothèques** : `jspdf` + `html2canvas` (à installer)

```bash
npm install jspdf html2canvas
```

**Code** :

```typescript
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const exportToPDF = async () => {
  // 1. Créer le PDF
  const pdf = new jsPDF('p', 'mm', 'a4')

  // 2. Ajouter le titre
  pdf.setFontSize(20)
  pdf.text('Rapport ONG MADE', 105, 20, { align: 'center' })

  // 3. Ajouter les statistiques
  pdf.setFontSize(12)
  pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 20, 40)
  pdf.text(`Total bénéficiaires: ${stats.total}`, 20, 50)
  pdf.text(`Présences aujourd'hui: ${stats.presences}`, 20, 60)

  // 4. Ajouter un graphique (capture d'écran)
  const chartElement = document.getElementById('chart')
  if (chartElement) {
    const canvas = await html2canvas(chartElement)
    const imgData = canvas.toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 20, 80, 170, 100)
  }

  // 5. Télécharger
  pdf.save(`rapport_made_${new Date().toISOString().split('T')[0]}.pdf`)
}
```

### Génération de badges

**Bibliothèque** : `bwip-js` (à installer)

```bash
npm install bwip-js
```

**Code** :

```typescript
import bwipjs from 'bwip-js'

const generateBadge = async (beneficiaire: Beneficiaire) => {
  // 1. Créer un canvas
  const canvas = document.createElement('canvas')
  canvas.width = 1020 // 85.6mm à 300 DPI
  canvas.height = 648  // 54mm à 300 DPI
  const ctx = canvas.getContext('2d')!

  // 2. Fond blanc
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 3. Ajouter la photo
  if (beneficiaire.photo_url) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = beneficiaire.photo_url
    await new Promise(resolve => img.onload = resolve)
    ctx.drawImage(img, 50, 50, 200, 200)
  }

  // 4. Ajouter le texte
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 40px Inter'
  ctx.fillText(`${beneficiaire.prenom} ${beneficiaire.nom}`, 280, 100)
  
  ctx.font = '30px Inter'
  ctx.fillText(beneficiaire.categorie, 280, 150)

  // 5. Générer le code-barres
  const barcodeCanvas = document.createElement('canvas')
  bwipjs.toCanvas(barcodeCanvas, {
    bcid: 'code128',
    text: beneficiaire.code_barre_unique,
    scale: 3,
    height: 15,
    includetext: true,
    textxalign: 'center',
  })
  ctx.drawImage(barcodeCanvas, 280, 200)

  // 6. Télécharger
  const link = document.createElement('a')
  link.download = `badge_${beneficiaire.nom}_${beneficiaire.prenom}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
```

---

## 🚀 DÉPLOIEMENT

### Développement local

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase

# Lancer le serveur de développement
npm run dev

# Ouvrir http://localhost:5173
```

### Build de production

```bash
# Build
npm run build

# Aperçu du build
npm run preview
```

### Déploiement sur Vercel

1. **Créer un compte Vercel** : https://vercel.com

2. **Installer Vercel CLI** :
```bash
npm install -g vercel
```

3. **Déployer** :
```bash
vercel
```

4. **Configurer les variables d'environnement** :
   - Dans le dashboard Vercel
   - Settings → Environment Variables
   - Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

5. **Redéployer** :
```bash
vercel --prod
```

### Déploiement sur Netlify

1. **Créer un compte Netlify** : https://netlify.com

2. **Installer Netlify CLI** :
```bash
npm install -g netlify-cli
```

3. **Build** :
```bash
npm run build
```

4. **Déployer** :
```bash
netlify deploy --prod --dir=dist
```

5. **Configurer les variables d'environnement** :
   - Dans le dashboard Netlify
   - Site settings → Environment variables
   - Ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

### Déploiement actuel (Skywork)

L'application est actuellement déployée sur : https://23bsra2hqe.skywork.website

**Avantages** :
- Déploiement automatique
- HTTPS inclus
- CDN global
- Pas de configuration nécessaire

**Limitations** :
- URL non personnalisable (utiliser Vercel/Netlify pour domaine custom)

---

## 🔧 MAINTENANCE

### Backup régulier

**Script de backup automatique** :

```typescript
// backup.ts
import { supabase } from './supabase/client'
import fs from 'fs'

async function backup() {
  const timestamp = new Date().toISOString()
  
  // Récupérer toutes les données
  const { data: beneficiaires } = await supabase.from('profiles_beneficiaires').select('*')
  const { data: pointages } = await supabase.from('historique_pointages').select('*')
  const { data: services } = await supabase.from('services_ong').select('*')
  const { data: audit } = await supabase.from('audit_logs').select('*')

  // Créer le fichier de backup
  const backup = {
    timestamp,
    beneficiaires,
    pointages,
    services,
    audit,
  }

  fs.writeFileSync(
    `backups/backup_${timestamp}.json`,
    JSON.stringify(backup, null, 2)
  )

  console.log(`Backup créé: backup_${timestamp}.json`)
}

backup()
```

**Exécution** :
```bash
# Manuellement
npm run backup

# Automatiquement (cron)
# Ajouter dans crontab:
0 2 * * * cd /path/to/app && npm run backup
```

### Monitoring

**Supabase Dashboard** :
- Allez dans votre projet Supabase
- Onglet "Database" → "Logs"
- Surveillez les erreurs et les performances

**Métriques à surveiller** :
- Nombre de requêtes par jour
- Temps de réponse moyen
- Erreurs 500
- Taille de la base de données
- Taille du storage (photos)

### Optimisation

**Index manquants** :
```sql
-- Vérifier les requêtes lentes
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Ajouter des index si nécessaire
CREATE INDEX idx_custom ON table_name(column_name);
```

**Nettoyage du storage** :
```typescript
// Supprimer les photos orphelines (sans bénéficiaire)
const { data: photos } = await supabase.storage
  .from('beneficiaire-photos')
  .list()

const { data: beneficiaires } = await supabase
  .from('profiles_beneficiaires')
  .select('photo_url')

const usedPhotos = beneficiaires.map(b => b.photo_url)
const orphanPhotos = photos.filter(p => !usedPhotos.includes(p.name))

for (const photo of orphanPhotos) {
  await supabase.storage
    .from('beneficiaire-photos')
    .remove([photo.name])
}
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

### Mise à jour

**Dépendances** :
```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour
npm update

# Mettre à jour les dépendances majeures (avec précaution)
npm install react@latest react-dom@latest
```

**Supabase** :
- Les mises à jour sont automatiques côté serveur
- Vérifiez les breaking changes dans la documentation

### Sécurité

**Checklist** :
- ✅ RLS activé sur toutes les tables
- ✅ Politiques restrictives (Made711@gmail.com uniquement)
- ✅ HTTPS activé
- ✅ Variables d'environnement sécurisées
- ✅ Pas de clés API dans le code
- ✅ Audit logs activés
- ✅ Backups réguliers

**Audit de sécurité** :
```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Vérifier les politiques
SELECT * FROM pg_policies;

-- Vérifier les accès récents
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 100;
```

---

## 📞 SUPPORT TECHNIQUE

### Logs et debugging

**Frontend (navigateur)** :
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'made:*')

// Voir les logs
console.log('Debug:', ...)
```

**Backend (Supabase)** :
- Dashboard Supabase → Logs
- Filtrer par niveau (error, warning, info)

**Scanner** :
```typescript
// Ajouter des logs dans useScanner
console.log('Key pressed:', e.key, 'Time diff:', timeDiff)
console.log('Buffer:', buffer)
console.log('Is scanning:', isScanning)
```

### Problèmes courants

**"Cannot read property of undefined"** :
- Vérifier que les données existent avant de les utiliser
- Utiliser optional chaining : `beneficiaire?.nom`

**"Network error"** :
- Vérifier la connexion internet
- Vérifier que Supabase est accessible
- Vérifier les clés API

**"RLS policy violation"** :
- Vérifier que l'utilisateur est connecté
- Vérifier que l'email est `Made711@gmail.com`
- Vérifier les politiques RLS

**Scanner ne fonctionne pas** :
- Voir section [Scanner Laser](#scanner-laser)

### Contact

**Développeur** : Made711@gmail.com

**Documentation** :
- Supabase : https://supabase.com/docs
- React : https://react.dev
- Tailwind CSS : https://tailwindcss.com

---

## 📝 CHANGELOG

### Version 1.0.0 (2026-04-13)

**Fonctionnalités** :
- ✅ Gestion complète des bénéficiaires (CRUD)
- ✅ Système de pointage avec scanner laser USB
- ✅ Génération de badges Code 128
- ✅ Gestion des services (Cantine, Gargote, Médical)
- ✅ Exports (Excel, PDF, JSON)
- ✅ Journal d'audit complet
- ✅ Système d'archivage (soft delete)
- ✅ Dashboard avec statistiques temps réel
- ✅ Authentification sécurisée
- ✅ Row Level Security (RLS)
- ✅ Optimistic UI pour connexion faible
- ✅ Feedback visuel et sonore

**Technologies** :
- React 18 + TypeScript
- Vite 5
- Tailwind CSS v4
- shadcn/ui
- Supabase (PostgreSQL + Storage + Auth)
- Framer Motion
- React Query
- Zustand

---

**© 2026 ONG MADE - Madagascar Assistance & Development Emergency**

*Documentation technique v1.0.0*
