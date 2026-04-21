import { useState, useEffect, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { ScannerInterface } from '@/components/ScannerInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Users, AlertCircle } from 'lucide-react'

import { 
  DB_KEYS, 
  formatDate, 
  formatDuration, 
  getPresenceDuration, 
  isPresenceProlongee 
} from '@/lib/index'
import type { Beneficiaire, Pointage } from '@/lib/index'

export default function PointagePage() {
  const { toast } = useToast()
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const syncData = () => {
    const b = localStorage.getItem(DB_KEYS.BENEFICIAIRES)
    const p = localStorage.getItem(DB_KEYS.POINTAGES)
    setBeneficiaires(b ? JSON.parse(b) : [])
    setPointages(p ? JSON.parse(p) : [])
  }

  useEffect(() => {
    syncData()
    window.addEventListener('focus', syncData)
    return () => window.removeEventListener('focus', syncData)
  }, [])

  const presencesActuelles = useMemo(() => {
    const today = new Date().toDateString()
    return beneficiaires
      .filter(b => b.archive !== true)
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
      })
      .filter(Boolean) as any[]
  }, [pointages, beneficiaires])

  const handleScan = (code: string) => {
    const b = beneficiaires.find(x => x.codeBarre.toUpperCase() === code.trim().toUpperCase())
    if (!b) {
      toast({ title: "Inconnu", variant: "destructive" })
      return
    }

    const estPresent = presencesActuelles.some(p => p.beneficiaire.id === b.id)
    const type = estPresent ? 'SORTIE' : 'ENTREE'

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
    toast({ title: `${type} VALIDÉE`, description: `${b.prenom} ${b.nom}` })
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Présents" value={presencesActuelles.length} icon={<Users/>} color="bg-indigo-600 text-white" />
          <StatCard label="Alertes" value={presencesActuelles.filter(p => p.prolongee).length} icon={<AlertCircle/>} color="bg-red-500 text-white" />
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <Card className="lg:col-span-4 bg-slate-900 text-white rounded-[2rem]">
            <CardHeader><CardTitle className="flex gap-2 text-emerald-400"><ShieldCheck/> Scanner</CardTitle></CardHeader>
            <CardContent><ScannerInterface onScan={handleScan} /></CardContent>
          </Card>
          <Card className="lg:col-span-8 rounded-[2rem] shadow-xl overflow-hidden bg-white">
            <CardHeader className="border-b"><CardTitle>Liste de présence</CardTitle></CardHeader>
            <ScrollArea className="h-[400px] p-6">
              {presencesActuelles.map(p => (
                <div key={p.beneficiaire.id} className="flex justify-between p-4 border-b">
                  <div>
                    <p className="font-bold text-sm uppercase">{p.beneficiaire.nom} {p.beneficiaire.prenom}</p>
                    <p className="text-[10px] text-slate-400">Entrée : {formatDate(p.entree.timestamp, 'time')}</p>
                  </div>
                  <p className="font-mono font-bold text-indigo-600">{formatDuration(p.duree)}</p>
                </div>
              ))}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className={`p-6 rounded-[1.5rem] flex items-center gap-4 ${color || 'bg-white border'}`}>
      <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
      <div><p className="text-xs font-bold uppercase opacity-80">{label}</p><p className="text-2xl font-black">{value}</p></div>
    </div>
  )
}