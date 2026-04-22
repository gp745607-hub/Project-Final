import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Download, Users, Archive, 
  UserCheck, UserX, FileText, Filter, 
  MoreHorizontal, Trash2, IdCard 
} from 'lucide-react'
import { Layout } from '@/components/Layout'
import { BeneficiaireTable } from '@/components/BeneficiaireTable'
import { BeneficiaireForm } from '@/components/BeneficiaireForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// IMPORTATION DES CONSTANTES ET UTILITAIRES CENTRAUX
import { 
  type Beneficiaire, 
  CATEGORIES, 
  generateCodeBarre, 
  exportToCSV,
  DB_KEYS,
  calculateAge,
  getCategorieLabel
} from '@/lib/index'

export default function BeneficiairesPage() {
  const { toast } = useToast()
  
  // --- ÉTATS (STATES) ---
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategorie, setSelectedCategorie] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // --- 1. SYNCHRONISATION AVEC LA BASE DE DONNÉES (LocalStorage) ---
  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem(DB_KEYS.BENEFICIAIRES)
        if (saved) {
          setBeneficiaires(JSON.parse(saved))
        }
      } catch (error) {
        console.error("Erreur de lecture DB:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
    // Écouter les changements depuis d'autres onglets
    window.addEventListener('storage', loadData)
    return () => window.removeEventListener('storage', loadData)
  }, [])

  const saveToDB = (newList: Beneficiaire[]) => {
    setBeneficiaires(newList)
    localStorage.setItem(DB_KEYS.BENEFICIAIRES, JSON.stringify(newList))
  }

  // --- 2. LOGIQUE DE RECHERCHE ET FILTRAGE ---
  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter(b => {
      if (b.archive) return false // On cache les archivés par défaut
      
      const searchStr = searchQuery.toLowerCase()
      const matchesSearch = 
        b.nom.toLowerCase().includes(searchStr) || 
        b.prenom.toLowerCase().includes(searchStr) ||
        b.codeBarre.includes(searchStr)
      
      const matchesCategorie = selectedCategorie === 'ALL' || b.categorie === selectedCategorie
      
      return matchesSearch && matchesCategorie
    })
  }, [beneficiaires, searchQuery, selectedCategorie])

  // --- 3. ACTIONS PRINCIPALES ---
  
  // AJOUTER
  const handleAdd = async (data: Partial<Beneficiaire>) => {
    const newEntry: Beneficiaire = {
      id: crypto.randomUUID(),
      codeBarre: generateCodeBarre(),
      nom: data.nom!.toUpperCase(),
      prenom: data.prenom!,
      dateNaissance: data.dateNaissance!,
      categorie: data.categorie!,
      photo: data.photo || '',
      notes: data.notes || '',
      dateInscription: new Date().toISOString(),
      actif: true,
      archive: false
    }

    const updatedList = [newEntry, ...beneficiaires]
    saveToDB(updatedList)
    setIsAddModalOpen(false)
    
    // Déclenchement automatique du badge
    handleDownloadBadge(newEntry)

    toast({
      title: "Bénéficiaire ajouté",
      description: `${newEntry.prenom} a été enregistré avec le badge ${newEntry.codeBarre}`,
    })
  }

  // MODIFIER
  const handleUpdate = (data: Partial<Beneficiaire>) => {
    if (!selectedBeneficiaire) return
    const updatedList = beneficiaires.map(b => 
      b.id === selectedBeneficiaire.id ? { ...b, ...data } : b
    )
    saveToDB(updatedList)
    setIsEditModalOpen(false)
    setSelectedBeneficiaire(null)
    toast({ title: "Profil mis à jour" })
  }

  // ARCHIVER
  const handleArchive = (id: string) => {
    const updatedList = beneficiaires.map(b => 
      b.id === id ? { ...b, archive: true } : b
    )
    saveToDB(updatedList)
    toast({ title: "Membre archivé", description: "Il n'apparaîtra plus dans les scans actifs." })
  }

  // GÉNÉRER / TÉLÉCHARGER BADGE
  const handleDownloadBadge = (b: Beneficiaire) => {
    const badgeContent = `
      ====================================
               ONG MADE - BADGE
      ====================================
      ID: ${b.codeBarre}
      NOM: ${b.nom}
      PRENOM: ${b.prenom}
      CATEGORIE: ${b.categorie}
      INSCRIPTION: ${new Date(b.dateInscription).toLocaleDateString()}
      ------------------------------------
      Scanner ce code pour l'entrée/sortie
      ====================================
    `
    const blob = new Blob([badgeContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Badge_${b.nom}_${b.codeBarre}.txt`
    link.click()
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
        
        {/* ENTÊTE DYNAMIQUE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">
              BÉNÉFICIAIRES<span className="text-indigo-600">.</span>
            </h1>
            <p className="text-slate-500 font-medium">Gestion de la base de données centrale de l'ONG MADE.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => exportToCSV(beneficiaires, 'membres-made')} className="rounded-xl border-slate-200">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 px-6">
              <Plus className="mr-2 h-5 w-5" /> Nouveau Membre
            </Button>
          </div>
        </div>

        {/* STATISTIQUES RÉELLES CONNECTÉES */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Actifs" value={beneficiaires.filter(b => !b.archive).length} icon={<Users className="text-indigo-600" />} />
          <StatCard label="Enfants" value={beneficiaires.filter(b => b.categorie === 'ENFANT').length} color="bg-emerald-50" />
          <StatCard label="Adultes" value={beneficiaires.filter(b => b.categorie === 'ADULTE').length} color="bg-orange-50" />
          <StatCard label="Archivés" value={beneficiaires.filter(b => b.archive).length} icon={<Archive className="text-slate-400" />} />
        </div>

        {/* ZONE DE FILTRES ET TABLEAU */}
        <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-slate-50">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Rechercher par nom ou code-barres..." 
                  className="pl-12 h-14 rounded-2xl bg-slate-50 border-none text-lg focus-visible:ring-2 focus-visible:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs value={selectedCategorie} onValueChange={setSelectedCategorie} className="w-fit">
                <TabsList className="h-14 p-1 bg-slate-100 rounded-2xl">
                  <TabsTrigger value="ALL" className="rounded-xl px-6">Tous</TabsTrigger>
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value} className="rounded-xl px-6">
                      {cat.value}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 text-center">Chargement...</div>
            ) : filteredBeneficiaires.length === 0 ? (
              <div className="p-32 text-center">
                <div className="inline-flex p-6 bg-slate-50 rounded-full mb-4">
                  <Users className="h-12 w-12 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Aucun membre trouvé</h3>
                <p className="text-slate-500">Commencez par ajouter un bénéficiaire à l'ONG MADE.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                      <th className="px-8 py-4">Bénéficiaire</th>
                      <th className="px-8 py-4">Code-Barres</th>
                      <th className="px-8 py-4">Catégorie</th>
                      <th className="px-8 py-4">Âge</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBeneficiaires.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                              {b.nom[0]}{b.prenom[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{b.prenom} {b.nom}</p>
                              <p className="text-xs text-slate-500 italic">Inscrit le {new Date(b.dateInscription).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <code className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-600 uppercase">
                            {b.codeBarre}
                          </code>
                        </td>
                        <td className="px-8 py-5">
                          <Badge variant="secondary" className="rounded-lg font-bold">{b.categorie}</Badge>
                        </td>
                        <td className="px-8 py-5 font-medium text-slate-600">
                          {calculateAge(b.dateNaissance)} ans
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" onClick={() => handleDownloadBadge(b)} title="Télécharger le badge">
                              <IdCard className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => handleArchive(b.id)} title="Archiver">
                              <Archive className="h-4 w-4 text-slate-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL D'AJOUT */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">NOUVEAU MEMBRE</DialogTitle>
            <DialogDescription>Remplissez les informations pour générer le badge MADE automatiquement.</DialogDescription>
          </DialogHeader>
          <BeneficiaireForm onSubmit={handleAdd} onCancel={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </Layout>
  )
}

// COMPOSANT INTERNE : CARTE DE STATS
function StatCard({ label, value, icon, color }: any) {
  return (
    <Card className={`border-none shadow-sm rounded-[2rem] ${color || 'bg-white'}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl shadow-sm">{icon || <FileText className="text-slate-300"/>}</div>
      </CardContent>
    </Card>
  )
}