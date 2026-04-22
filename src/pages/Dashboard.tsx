import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Activity, 
  HeartHandshake, 
  IdCard, 
  ScanLine, 
  UserPlus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { DB_KEYS, getCategorieColor, ROUTE_PATHS } from '@/lib/index'
import type { Beneficiaire, Pointage, Service } from '@/lib/index'

export default function Dashboard() {
  const navigate = useNavigate()
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    const b = localStorage.getItem(DB_KEYS.BENEFICIAIRES)
    const p = localStorage.getItem(DB_KEYS.POINTAGES)
    const s = localStorage.getItem(DB_KEYS.SERVICES)
    setBeneficiaires(b ? JSON.parse(b) : [])
    setPointages(p ? JSON.parse(p) : [])
    setServices(s ? JSON.parse(s) : [])
  }, [])

  const stats = useMemo(() => {
    const actifs = beneficiaires.filter(b => b.actif && !b.archive)
    const today = new Date().toDateString()
    const logsAujourdhui = pointages.filter(p => new Date(p.timestamp).toDateString() === today)
    
    return {
      total: actifs.length,
      todayPointages: logsAujourdhui.length,
      todayServices: services.filter(s => new Date(s.timestamp).toDateString() === today).length,
      parCategorie: actifs.reduce((acc: Record<string, number>, b) => {
        acc[b.categorie] = (acc[b.categorie] || 0) + 1
        return acc
      }, {}),
      derniersScans: logsAujourdhui.slice(0, 5)
    }
  }, [beneficiaires, pointages, services])

  return (
    <Layout>
      <div className="p-8 space-y-10 bg-[#f8fafc]">
        {/* Header avec bienvenue dynamique */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              <span className="bg-indigo-600 text-white p-2 rounded-2xl shadow-lg shadow-indigo-200">
                <TrendingUp size={28}/>
              </span>
              Tableau de bord
            </h1>
            <p className="text-slate-500 font-medium mt-1">Aujourd'hui nous sommes le {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => navigate(ROUTE_PATHS.POINTAGE)} className="rounded-2xl gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 border-none">
              <ScanLine size={18}/> Scanner
            </Button>
            <Button onClick={() => navigate(ROUTE_PATHS.BENEFICIAIRES)} variant="outline" className="rounded-2xl gap-2 border-slate-200 bg-white">
              <UserPlus size={18}/> Nouveau
            </Button>
          </div>
        </div>
        
        {/* Cartes de statistiques principales avec Gradients */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Actifs" 
            value={stats.total} 
            icon={<Users/>} 
            gradient="from-indigo-500 to-blue-600"
            onClick={() => navigate(ROUTE_PATHS.BENEFICIAIRES)}
          />
          <StatCard 
            title="Passages Jour" 
            value={stats.todayPointages} 
            icon={<Activity/>} 
            gradient="from-emerald-500 to-teal-600"
            onClick={() => navigate(ROUTE_PATHS.POINTAGE)}
          />
          <StatCard 
            title="Services du Jour" 
            value={stats.todayServices} 
            icon={<HeartHandshake/>} 
            gradient="from-orange-500 to-rose-600"
            onClick={() => navigate(ROUTE_PATHS.SERVICES)}
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Section Répartition par catégorie */}
          <Card className="lg:col-span-7 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users className="text-indigo-600" size={20}/> Répartition des Bénéficiaires
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.parCategorie).map(([cat, count]) => (
                  <div key={cat} className="group relative overflow-hidden flex flex-col p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                    <div 
                      className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:opacity-20 transition-opacity" 
                      style={{ backgroundColor: getCategorieColor(cat) }}
                    />
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: getCategorieColor(cat) }} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat}</span>
                    </div>
                    <span className="text-3xl font-black text-slate-900">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions Rapides Connectées */}
          <Card className="lg:col-span-5 rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden">
             <CardHeader>
              <CardTitle className="text-xl">Accès Rapides</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <QuickActionBtn 
                label="Générer des Badges" 
                icon={<IdCard/>} 
                color="bg-white/10" 
                onClick={() => navigate(ROUTE_PATHS.BADGES)}
              />
              <QuickActionBtn 
                label="Journal des Pointages" 
                icon={<Activity/>} 
                color="bg-white/10" 
                onClick={() => navigate(ROUTE_PATHS.RAPPORTS)}
              />
              <div className="pt-4 border-t border-white/10 mt-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Dernières Activités</p>
                <div className="space-y-3">
                  {stats.derniersScans.length > 0 ? stats.derniersScans.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-white/5 p-3 rounded-xl">
                      <span className="font-medium text-slate-300">{p.type}</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {new Date(p.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-sm italic">Aucun scan enregistré aujourd'hui.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

// Composant StatCard amélioré avec Gradient et OnClick
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

function StatCard({ title, value, icon, gradient, onClick }: StatCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`relative rounded-[2rem] border-none shadow-lg overflow-hidden group cursor-pointer transition-all hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
      <CardContent className="relative pt-8 pb-8 flex items-center gap-6 text-white">
        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80 tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black">{value}</p>
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all"/>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Petit bouton d'action pour la carte noire
function QuickActionBtn({ label, icon, color, onClick }: { 
  label: string; 
  icon: React.ReactNode; // Type correct pour Lucide icons
  color: string; 
  onClick: () => void; 
}) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 ${color} hover:bg-white/20 rounded-2xl transition-all group`}
    >
      <div className="flex items-center gap-3">
        <span className="text-indigo-400 group-hover:text-white transition-colors">{icon}</span>
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      <ArrowRight size={16} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all"/>
    </button>
  )
}