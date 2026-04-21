import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { StatsCard, MetricCard, AlertCard } from '@/components/Stats';
import { 
  Beneficiaire, Pointage, Service, CATEGORIES, 
  formatDate, isPresenceProlongee 
} from '@/lib/index';
import { 
  Users, UserCheck, Utensils, AlertTriangle, 
  TrendingUp, Clock 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

// CLÉS DE STOCKAGE (DOIVENT ÊTRE IDENTIQUES PARTOUT)
const DB_BENEFICIAIRES = 'made_ong_database_v1';
const DB_POINTAGES = 'made_ong_pointages_v1';
const DB_SERVICES = 'made_ong_services_v1';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // États pour stocker les données brutes
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [pointages, setPointages] = useState<Pointage[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // 1. CHARGEMENT DES DONNÉES RÉELLES
  const loadRealData = () => {
    if (typeof window !== 'undefined') {
      const b = localStorage.getItem(DB_BENEFICIAIRES);
      const p = localStorage.getItem(DB_POINTAGES);
      const s = localStorage.getItem(DB_SERVICES);
      
      setBeneficiaires(b ? JSON.parse(b) : []);
      setPointages(p ? JSON.parse(p) : []);
      setServices(s ? JSON.parse(s) : []);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
    // Rafraîchissement automatique toutes les 10 secondes pour le monitoring
    const interval = setInterval(loadRealData, 10000);
    
    // Ecoute les changements faits dans d'autres onglets (ex: scan sur la page Pointage)
    window.addEventListener('storage', loadRealData);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadRealData);
    };
  }, []);

  // 2. CALCULS DES STATISTIQUES (SYNCHRONISÉS)
  const dashboardStats = useMemo(() => {
    const todayStr = new Date().toDateString();
    
    // Filtrer les logs du jour
    const todayPointages = pointages.filter(p => new Date(p.timestamp).toDateString() === todayStr);
    const todayServices = services.filter(s => new Date(s.timestamp).toDateString() === todayStr);

    // Calcul des présences actives (ceux qui sont entrés mais pas encore sortis)
    const actives: any[] = [];
    const alertesList: any[] = [];
    
    beneficiaires.filter(b => !b.archive).forEach(beneficiaire => {
      const logs = todayPointages
        .filter(p => p.beneficiaireId === beneficiaire.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      if (logs.length > 0 && logs[0].type === 'ENTREE') {
        const diffHeures = (Date.now() - new Date(logs[0].timestamp).getTime()) / (1000 * 60 * 60);
        const presence = { 
          beneficiaire, 
          entree: logs[0].timestamp, 
          duree: diffHeures 
        };
        actives.push(presence);
        if (isPresenceProlongee(logs[0].timestamp)) alertesList.push(presence);
      }
    });

    // Fréquentation par heure (pour le graphique)
    const parHeure = Array.from({ length: 12 }, (_, i) => {
      const h = i + 7; // De 7h à 18h
      return {
        heure: `${h}h`,
        count: todayPointages.filter(p => p.type === 'ENTREE' && new Date(p.timestamp).getHours() === h).length
      };
    });

    return {
      totalToday: todayPointages.filter(p => p.type === 'ENTREE').length,
      enfants: actives.filter(p => p.beneficiaire.categorie === 'ENFANT').length,
      repas: todayServices.length,
      alertes: alertesList,
      actives,
      parHeure,
      parCategorie: CATEGORIES.map(cat => ({
        label: cat.label,
        value: cat.value,
        count: actives.filter(p => p.beneficiaire.categorie === cat.value).length,
        color: cat.color
      }))
    };
  }, [beneficiaires, pointages, services]);

  const maxFreq = Math.max(...dashboardStats.parHeure.map(h => h.count), 1);

  if (loading) return <div className="p-10 text-center">Chargement du système...</div>;

  return (
    <Layout>
      <div className="w-full p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">MADE Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Analyse en temps réel — {formatDate(new Date(), 'long')}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTÈME OPÉRATIONNEL
            </div>
          </div>
        </motion.div>

        {/* CARTES DE STATISTIQUES */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={staggerItem}>
            <StatsCard title="Entrées (Jour)" value={dashboardStats.totalToday} icon={<Users />} trend="Cumulatif aujourd'hui" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard title="Enfants sur site" value={dashboardStats.enfants} icon={<UserCheck />} trend="Présence actuelle" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard title="Services/Repas" value={dashboardStats.repas} icon={<Utensils />} trend="Total délivré" />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard title="Alertes" value={dashboardStats.alertes.length} icon={<AlertTriangle />} trend="Durée excessive" trendUp={false} />
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* GRAPHIQUE FRÉQUENTATION */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Pics d'affluence</CardTitle>
              <CardDescription>Nombre d'entrées enregistrées par heure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardStats.parHeure.map((item) => (
                  <div key={item.heure} className="flex items-center gap-3">
                    <div className="w-10 text-xs font-bold text-muted-foreground">{item.heure}</div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(item.count / maxFreq) * 100}%` }}
                        className="h-full bg-primary flex items-center justify-end pr-2 text-[10px] text-white font-bold"
                      >
                        {item.count > 0 ? item.count : ''}
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* RÉPARTITION PAR CATÉGORIE */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-secondary" /> Groupes Présents</CardTitle>
              <CardDescription>Détails des bénéficiaires actuellement sur site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardStats.parCategorie.map((item) => (
                <MetricCard 
                  key={item.value} 
                  label={item.label} 
                  value={item.count} 
                  color={item.color} 
                  icon={<UserCheck className="w-4 h-4" />} 
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* SECTION ALERTES */}
        {dashboardStats.alertes.length > 0 && (
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="animate-bounce" /> Attention : Présences prolongées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardStats.alertes.map((alerte: any) => (
                <AlertCard 
                  key={alerte.beneficiaire.id} 
                  beneficiaire={alerte.beneficiaire}
                  entree={alerte.entree}
                  duree={alerte.duree}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}