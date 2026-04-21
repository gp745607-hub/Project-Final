// VERSION DEPLOY PRODUCTION : 21-04-2026-V5

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BENEFICIAIRES: '/beneficiaires',
  POINTAGE: '/pointage',
  BADGES: '/badges',
  SERVICES: '/services',
  RAPPORTS: '/rapports',
  AUDIT: '/audit',
  ARCHIVES: '/archives',
} as const;

// --- TYPES & INTERFACES ---

export interface Beneficiaire {
  id: string;
  codeBarre: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  categorie: 'ENFANT' | 'ADOLESCENT' | 'ADULTE' | 'SENIOR';
  photo?: string;
  notes?: string;
  dateInscription: string;
  actif: boolean;
  archive: boolean;
  dateArchivage?: string;
}

export interface Pointage {
  id: string;
  beneficiaireId: string;
  codeBarre: string;
  type: 'ENTREE' | 'SORTIE';
  timestamp: string;
  scannerType: 'LASER' | 'MANUEL';
  operateur?: string;
}

export interface Service {
  id: string;
  beneficiaireId: string;
  type: 'CANTINE' | 'GARGOTE' | 'MEDICAL';
  timestamp: string;
  notes?: string;
}

// --- CONSTANTES ---

export const CATEGORIES = [
  { value: 'ENFANT', label: 'Enfant (0-12 ans)', color: 'oklch(0.68 0.22 150)' },
  { value: 'ADOLESCENT', label: 'Adolescent (13-17 ans)', color: 'oklch(0.62 0.22 220)' },
  { value: 'ADULTE', label: 'Adulte (18-59 ans)', color: 'oklch(0.65 0.16 30)' },
  { value: 'SENIOR', label: 'Senior (60+ ans)', color: 'oklch(0.58 0.14 280)' },
] as const;

// Correction : Ajout de SERVICE_TYPES pour src/pages/Services.tsx
export const SERVICE_TYPES = [
  { value: 'CANTINE', label: 'Cantine / Repas' },
  { value: 'GARGOTE', label: 'Gargote' },
  { value: 'MEDICAL', label: 'Soin Médical' }
] as const;

export const DB_KEYS = {
  BENEFICIAIRES: 'made_ong_database_v1',
  POINTAGES: 'made_ong_pointages_v1',
  SERVICES: 'made_ong_services_v1'
} as const;

// --- FONCTIONS UTILITAIRES ---

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Date invalide";
  if (format === 'time') return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function generateCodeBarre(): string {
  return Math.random().toString(36).substring(2, 11).toUpperCase();
}

export function getCategorieColor(categorie: string): string {
  const cat = CATEGORIES.find(c => c.value === categorie);
  return cat?.color || 'oklch(0.5 0.1 220)';
}

// Correction : Ajout de getCategorieLabel pour Archives.tsx
export function getCategorieLabel(value: string): string {
  const cat = CATEGORIES.find(c => c.value === value);
  return cat ? cat.label : value;
}

export function getPresenceDuration(entree: string): number {
  const entreeTime = new Date(entree).getTime();
  return Math.floor((Date.now() - entreeTime) / (1000 * 60 * 60));
}

export function isPresenceProlongee(entree: string): boolean {
  return getPresenceDuration(entree) > 12;
}

export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.floor(hours * 60)} min`;
  return `${Math.floor(hours)}h${Math.floor((hours % 1) * 60).toString().padStart(2, '0')}`;
}

// --- FONCTIONS D'EXPORT (DEMANDÉES PAR LE BUILD) ---

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(obj => Object.values(obj).join(','));
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// --- OPTIMISATION ---

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// --- DERNIÈRES FONCTIONS POUR LE BUILD ---

/**
 * Valide le format du matricule (ex: 9 caractères alphanumériques)
 */
export function validateCodeBarre(code: string): boolean {
  if (!code) return false;
  const cleaned = code.trim();
  // Vérifie si le code a entre 5 et 12 caractères (ajuste selon tes besoins)
  return cleaned.length >= 5 && cleaned.length <= 12;
}

/**
 * Calcule l'âge à partir d'une date de naissance (ISO string)
 */
export function calculateAge(dateNaissance: string): number {
  if (!dateNaissance) return 0;
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}