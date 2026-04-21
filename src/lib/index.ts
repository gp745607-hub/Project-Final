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
  codeBarre: string;
  type: 'CANTINE' | 'GARGOTE' | 'MEDICAL';
  timestamp: string;
  notes?: string;
  operateur?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'SCAN' | 'SERVICE' | 'EXPORT';
  entity: 'BENEFICIAIRE' | 'POINTAGE' | 'SERVICE' | 'BADGE' | 'RAPPORT';
  entityId: string;
  utilisateur: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export const CATEGORIES = [
  { value: 'ENFANT', label: 'Enfant (0-12 ans)', color: 'oklch(0.68 0.22 150)' },
  { value: 'ADOLESCENT', label: 'Adolescent (13-17 ans)', color: 'oklch(0.62 0.22 220)' },
  { value: 'ADULTE', label: 'Adulte (18-59 ans)', color: 'oklch(0.65 0.16 30)' },
  { value: 'SENIOR', label: 'Senior (60+ ans)', color: 'oklch(0.58 0.14 280)' },
] as const;

export const SERVICE_TYPES = [
  { value: 'CANTINE', label: 'Cantine', icon: 'UtensilsCrossed' },
  { value: 'GARGOTE', label: 'Gargote', icon: 'Coffee' },
  { value: 'MEDICAL', label: 'Médical', icon: 'Heart' },
] as const;

export function generateCodeBarre(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `MADE${timestamp}${random}`.toUpperCase();
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'time') {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString('fr-FR', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function calculateAge(dateNaissance: string): number {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function getCategorieFromAge(age: number): Beneficiaire['categorie'] {
  if (age < 13) return 'ENFANT';
  if (age < 18) return 'ADOLESCENT';
  if (age < 60) return 'ADULTE';
  return 'SENIOR';
}

export function getCategorieColor(categorie: Beneficiaire['categorie']): string {
  const cat = CATEGORIES.find(c => c.value === categorie);
  return cat?.color || 'oklch(0.5 0.1 220)';
}

export function getCategorieLabel(categorie: Beneficiaire['categorie']): string {
  const cat = CATEGORIES.find(c => c.value === categorie);
  return cat?.label || categorie;
}

export function validateCodeBarre(codeBarre: string): boolean {
  return /^MADE[A-Z0-9]{10,}$/.test(codeBarre);
}

export function getPresenceDuration(entree: string, sortie?: string): number {
  const entreeTime = new Date(entree).getTime();
  const sortieTime = sortie ? new Date(sortie).getTime() : Date.now();
  return Math.floor((sortieTime - entreeTime) / (1000 * 60 * 60));
}

export function isPresenceProlongee(entree: string, sortie?: string): boolean {
  return getPresenceDuration(entree, sortie) > 12;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    const minutes = Math.floor(hours * 60);
    return `${minutes} min`;
  }
  return `${Math.floor(hours)}h${Math.floor((hours % 1) * 60).toString().padStart(2, '0')}`;
}

export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        const stringValue = value === null || value === undefined ? '' : String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function exportToJSON(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export const DB_KEYS = {
  BENEFICIAIRES: 'made_ong_database_v1',
  POINTAGES: 'made_ong_pointages_v1'
};

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
export const DB_KEYS = {
  BENEFICIAIRES: 'made_ong_database_v1',
  POINTAGES: 'made_ong_pointages_v1'
};

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
