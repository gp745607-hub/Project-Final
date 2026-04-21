import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Users, LogIn, LogOut, AlertCircle, 
  UserPlus, Search, ShieldCheck, Zap, Activity
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { ScannerInterface } from '@/components/ScannerInterface'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import type { Beneficiaire, Pointage } from '@/lib/index'
import { formatDate, formatDuration, getPresenceDuration, isPresenceProlongee } from '@/lib/index'

const DB_BENEFICIAIRES = 'made_ong_database_v1'
const DB_POINTAGES = 'made_ong_pointages_v1'

export default function PointagePage() {
  const { toast } = useToast()
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Chargement et Synchro
  useEffect(() => {
    const load = () => {
      setBeneficiaires(JSON.parse(localStorage.getItem(DB_BENEFICIAIRES) || '[]'))
      setPointages(JSON.parse(localStorage.getItem(DB_POINTAGES) || '[]'))
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  useEffect(() => {
    localStorage.setItem(DB_POINTAGES, JSON.stringify(pointages))
  }, [pointages])

  const presencesActuelles = useMemo(() => {
    const today = new Date().toDateString()
    return beneficiaires.filter(b => !b.archive).map(b => {
      const logs = pointages.filter(p => p.beneficiaireId === b.id && new Date(p.timestamp).toDateString() === today)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      if (logs.length > 0 && logs[0].type === 'ENTREE') {
        return { beneficiaire: b, entree: logs[0], duree: getPresenceDuration(logs[0].timestamp), prolongee: isPresenceProlongee(logs[0].timestamp) }
      }
      return null
    }).filter(Boolean) as any[]
  }, [pointages, beneficiaires])

  const handleScan = async (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    const b = beneficiaires.find(x => x.codeBarre.toUpperCase() === cleanCode)
    if (!b) {
      toast({ title: "Badge Inconnu", variant: "destructive" })
      return
    }
    const type = presencesActuelles.find(p => p.beneficiaire.id === b.id) ? 'SORTIE' : 'ENTREE'
    const newLog = { id: crypto.randomUUID(), beneficiaireId: b.id, type, timestamp: new Date().toISOString() }
    setPointages([newLog, ...pointages])
    toast({ 
        title: type === 'ENTREE' ? "ENTRÉE VALIDÉE" : "SORTIE VALIDÉE", 
        description: `${b.prenom} ${b.nom}`,
        className: type === 'ENTREE' ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
    })
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Terminal de Pointage v2.0</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Flux de Présence</h1>
          </div>
          <div className="flex gap-3">
             <div className="bg-white dark:bg-slate-900 p-1 rounded-xl shadow-inner border flex gap-1">
                <StatSimple label="Presents" value={presencesActuelles.length} color="text-emerald-600" />
                <div className="w-[1px] bg-slate-200" />
                <StatSimple label="Alertes" value={presencesActuelles.filter(p => p.prolongee).length} color="text-red-500" />
             </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ZONE SCANNER */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-slate-900 text-white overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={100} /></div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 font-bold">
                  <Zap className="text-yellow-400 fill-yellow-400" size={20} /> Lecteur Laser
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mb-6">
                    <ScannerInterface onScan={handleScan} />
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Statut: <span className="text-emerald-400">Connecté</span></span>
                    <span>Fréquence: 120Hz</span>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-100 transition-all active:scale-95">
                <UserPlus className="mr-2" /> Pointage Manuel
            </Button>
          </div>

          {/* LISTE DES PRÉSENTS */}
          <div className="lg:col-span-8">
            <Card className="border-none shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl h-[700px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Activity className="text-primary" /> Membres sur site
                </CardTitle>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Rechercher..." className="pl-10 rounded-full bg-slate-100/50 border-none" />
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-6">
                <div className="grid gap-4">
                  {presencesActuelles.map((p) => (
                    <motion.div 
                      layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      key={p.beneficiaire.id}
                      className={`group flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${p.prolongee ? 'bg-red-50 border-red-100' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            {p.beneficiaire.photo ? <img src={p.beneficiaire.photo} alt="p" className="w-full h-full object-cover" /> : <Users className="text-slate-300" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{p.beneficiaire.nom} {p.beneficiaire.prenom}</h4>
                          <div className="flex gap-2 items-center mt-1">
                             <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none text-[10px]">{p.beneficiaire.categorie}</Badge>
                             <span className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={12} /> Entré à {formatDate(p.entree.timestamp, 'time')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-black font-mono ${p.prolongee ? 'text-red-500' : 'text-emerald-500'}`}>{formatDuration(p.duree)}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Depuis l'arrivée</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function StatSimple({ label, value, color }: any) {
    return (
        <div className="px-6 py-2 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
        </div>
    )
}