import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { ScannerInterface } from '@/components/ScannerInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Users, AlertCircle } from 'lucide-react'
import { DB_KEYS, formatDate, formatDuration, getPresenceDuration, isPresenceProlongee } from '@/lib/index'
import type { Beneficiaire, Pointage } from '@/lib/index'

interface Presence {
  beneficiaire: Beneficiaire;
  entree: Pointage;
  duree: number;
  prolongee: boolean;
}

// Typage strict pour les props du StatCard afin d'éliminer l'erreur 'any'
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

export default function PointagePage() {
  const { toast } = useToast()
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [pointages, setPointages] = useState<Pointage[]>([])

  const syncData = () => {
    const b = localStorage.getItem(DB_KEYS.BENEFICIAIRES)
    const p = localStorage.getItem(DB_KEYS.POINTAGES)
    setBeneficiaires(b ? JSON.parse(b) : [])
    setPointages(p ? JSON.parse(p) : [])
  }

  useEffect(() => {
    syncData();
    window.addEventListener('focus', syncData);
    return () => window.removeEventListener('focus', syncData);
  }, [])

  const presencesActuelles = useMemo(() => {
    const today = new Date().toDateString()
    return beneficiaires
      .filter(b => !b.archive)
      .map(b => {
        const logs = pointages
          .filter(p => p.beneficiaireId === b.id && new Date(p.timestamp).toDateString() === today)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        if (logs.length > 0 && logs[0].type === 'ENTREE') {
          return { 
            beneficiaire: b, 
            entree: logs[0], 
            duree: getPresenceDuration(logs[0].timestamp), 
            prolongee: isPresenceProlongee(logs[0].timestamp) 
          }
        }
        return null
      }).filter((p): p is Presence => p !== null)
  }, [pointages, beneficiaires])

  const handleScan = async (code: string) => {
    const b = beneficiaires.find(x => x.codeBarre.toUpperCase() === code.trim().toUpperCase())
    if (!b) {
      toast({ title: "Bénéficiaire inconnu", variant: "destructive" }); 
      return;
    }
    
    const type = presencesActuelles.some(p => p.beneficiaire.id === b.id) ? 'SORTIE' : 'ENTREE'
    
    const newLog: Pointage = { 
      id: crypto.randomUUID(), 
      beneficiaireId: b.id, 
      codeBarre: b.codeBarre, 
      type, 
      timestamp: new Date().toISOString(), 
      scannerType: 'LASER' 
    }
    
    const updated = [newLog, ...pointages]
    setPointages(updated)
    localStorage.setItem(DB_KEYS.POINTAGES, JSON.stringify(updated))
    
    toast({ 
      title: `${type} ENREGISTRÉE`, 
      description: `${b.prenom} ${b.nom}` 
    })
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            label="Présents" 
            value={presencesActuelles.length} 
            icon={<Users/>} 
            color="bg-indigo-600 text-white" 
          />
          <StatCard 
            label="Alertes (+12h)" 
            value={presencesActuelles.filter(p => p.prolongee).length} 
            icon={<AlertCircle/>} 
            color="bg-red-500 text-white" 
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 bg-slate-900 text-white rounded-[2rem] border-none shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck/> Borne de Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScannerInterface onScan={handleScan} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 rounded-[2rem] shadow-xl bg-white border-none">
            <CardHeader className="border-b">
              <CardTitle>Pointages en cours</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[450px] p-6">
              {presencesActuelles.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Aucun bénéficiaire présent sur le site.</p>
              ) : (
                presencesActuelles.map(p => (
                  <div key={p.beneficiaire.id} className="flex justify-between items-center p-4 border-b last:border-0 hover:bg-slate-50 rounded-xl transition-colors">
                    <div>
                      <p className="font-black text-sm uppercase text-slate-800">{p.beneficiaire.nom} {p.beneficiaire.prenom}</p>
                      <p className="text-[10px] font-bold text-slate-400">Arrivée : {formatDate(p.entree.timestamp, 'time')}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-black ${p.prolongee ? 'text-red-500' : 'text-indigo-600'}`}>
                        {formatDuration(p.duree)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-[1.5rem] flex items-center gap-4 shadow-lg ${color}`}>
      <div className="p-3 bg-white/20 rounded-2xl">{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase opacity-80 tracking-widest">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  )
}