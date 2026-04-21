import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, AlertCircle } from 'lucide-react'
import { DB_KEYS, getCategorieColor } from '@/lib/index'
import type { Beneficiaire, Pointage, Service } from '@/lib/index'

export default function Dashboard() {
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
    return {
      total: actifs.length,
      todayPointages: pointages.filter(p => 
        new Date(p.timestamp).toDateString() === new Date().toDateString()
      ).length,
      parCategorie: actifs.reduce((acc: Record<string, number>, b) => {
        acc[b.categorie] = (acc[b.categorie] || 0) + 1
        return acc
      }, {})
    }
  }, [beneficiaires, pointages])

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard title="Total Actifs" value={stats.total} icon={<Users/>} />
          <StatCard title="Passages Jour" value={stats.todayPointages} icon={<Activity/>} />
          <StatCard title="Services rendus" value={services.length} icon={<AlertCircle/>} />
        </div>
        
        <Card className="rounded-[2rem] border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.parCategorie).map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                  {/* Correction style inline pour Edge Tools : on utilise une variable CSS */}
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm" 
                    style={{ backgroundColor: getCategorieColor(cat) } as React.CSSProperties} 
                  />
                  <span className="text-sm font-semibold text-slate-700">{cat} : {count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

// Composant interne avec typage strict pour éviter les erreurs 'any'
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="rounded-[1.5rem] border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}