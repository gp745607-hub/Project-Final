import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { ScannerInterface } from '@/components/ScannerInterface'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Clock, Users, LogIn, LogOut, AlertCircle, UserPlus, Search, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { springPresets, fadeInUp, staggerContainer, staggerItem } from '@/lib/motion'
import type { Beneficiaire, Pointage } from '@/lib/index'
import { CATEGORIES, formatDate, formatDuration, getCategorieColor, getCategorieLabel, getPresenceDuration, isPresenceProlongee } from '@/lib/index'

interface PresenceActuelle {
  beneficiaire: Beneficiaire
  entree: Pointage
  sortie?: Pointage
  duree: number
  prolongee: boolean
}

export default function Pointage() {
  const { toast } = useToast()
  const [pointages, setPointages] = useState<Pointage[]>([])
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [presencesActuelles, setPresencesActuelles] = useState<PresenceActuelle[]>([])
  const [selectedCategorie, setSelectedCategorie] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false)
  const [manualCodeBarre, setManualCodeBarre] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState({
    totalPresences: 0,
    entrees: 0,
    sorties: 0,
    presentsActuels: 0,
    alertesProlongees: 0
  })

  useEffect(() => {
    loadMockData()
  }, [])

  useEffect(() => {
    updatePresencesActuelles()
    updateStats()
  }, [pointages, beneficiaires])

  const loadMockData = () => {
    const mockBeneficiaires: Beneficiaire[] = [
      {
        id: '1',
        codeBarre: 'MADE1234567890',
        nom: 'Rakoto',
        prenom: 'Jean',
        dateNaissance: '2010-05-15',
        categorie: 'ENFANT',
        photo: 'https://images.unsplash.com/photo-1543181077-099f32f30a1c?w=200',
        dateInscription: '2024-01-10',
        actif: true,
        archive: false
      },
      {
        id: '2',
        codeBarre: 'MADE0987654321',
        nom: 'Razafy',
        prenom: 'Marie',
        dateNaissance: '2005-08-22',
        categorie: 'ADOLESCENT',
        photo: 'https://images.unsplash.com/photo-1553775927-a071d5a6a39a?w=200',
        dateInscription: '2024-01-15',
        actif: true,
        archive: false
      },
      {
        id: '3',
        codeBarre: 'MADE5555666677',
        nom: 'Andria',
        prenom: 'Paul',
        dateNaissance: '1985-03-10',
        categorie: 'ADULTE',
        photo: 'https://images.unsplash.com/photo-1579210504658-94fcc9cfa42f?w=200',
        dateInscription: '2024-02-01',
        actif: true,
        archive: false
      }
    ]

    const now = new Date()
    const mockPointages: Pointage[] = [
      {
        id: 'p1',
        beneficiaireId: '1',
        codeBarre: 'MADE1234567890',
        type: 'ENTREE',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        scannerType: 'LASER'
      },
      {
        id: 'p2',
        beneficiaireId: '2',
        codeBarre: 'MADE0987654321',
        type: 'ENTREE',
        timestamp: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
        scannerType: 'LASER'
      },
      {
        id: 'p3',
        beneficiaireId: '3',
        codeBarre: 'MADE5555666677',
        type: 'ENTREE',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        scannerType: 'MANUEL',
        operateur: 'Made711@gmail.com'
      }
    ]

    setBeneficiaires(mockBeneficiaires)
    setPointages(mockPointages)
  }

  const updatePresencesActuelles = () => {
    const presences: PresenceActuelle[] = []
    const today = new Date().toDateString()

    beneficiaires.forEach(beneficiaire => {
      const pointagesBenef = pointages
        .filter(p => p.beneficiaireId === beneficiaire.id)
        .filter(p => new Date(p.timestamp).toDateString() === today)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      if (pointagesBenef.length > 0 && pointagesBenef[0].type === 'ENTREE') {
        const entree = pointagesBenef[0]
        const sortie = pointagesBenef.find(p => p.type === 'SORTIE')
        const duree = getPresenceDuration(entree.timestamp, sortie?.timestamp)
        const prolongee = isPresenceProlongee(entree.timestamp, sortie?.timestamp)

        presences.push({
          beneficiaire,
          entree,
          sortie,
          duree,
          prolongee
        })
      }
    })

    setPresencesActuelles(presences)
  }

  const updateStats = () => {
    const today = new Date().toDateString()
    const todayPointages = pointages.filter(p => new Date(p.timestamp).toDateString() === today)

    setStats({
      totalPresences: todayPointages.length,
      entrees: todayPointages.filter(p => p.type === 'ENTREE').length,
      sorties: todayPointages.filter(p => p.type === 'SORTIE').length,
      presentsActuels: presencesActuelles.length,
      alertesProlongees: presencesActuelles.filter(p => p.prolongee).length
    })
  }

  const handleScan = async (codeBarre: string) => {
    setIsProcessing(true)

    try {
      const beneficiaire = beneficiaires.find(b => b.codeBarre === codeBarre)

      if (!beneficiaire) {
        toast({
          title: 'Bénéficiaire introuvable',
          description: `Code-barres ${codeBarre} non reconnu`,
          variant: 'destructive'
        })
        return
      }

      if (!beneficiaire.actif || beneficiaire.archive) {
        toast({
          title: 'Bénéficiaire inactif',
          description: `${beneficiaire.prenom} ${beneficiaire.nom} est archivé ou inactif`,
          variant: 'destructive'
        })
        return
      }

      const today = new Date().toDateString()
      const todayPointages = pointages
        .filter(p => p.beneficiaireId === beneficiaire.id)
        .filter(p => new Date(p.timestamp).toDateString() === today)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const lastPointage = todayPointages[0]
      const type: 'ENTREE' | 'SORTIE' = !lastPointage || lastPointage.type === 'SORTIE' ? 'ENTREE' : 'SORTIE'

      const newPointage: Pointage = {
        id: `p${Date.now()}`,
        beneficiaireId: beneficiaire.id,
        codeBarre,
        type,
        timestamp: new Date().toISOString(),
        scannerType: 'LASER'
      }

      setPointages(prev => [newPointage, ...prev])

      toast({
        title: type === 'ENTREE' ? 'Entrée enregistrée' : 'Sortie enregistrée',
        description: `${beneficiaire.prenom} ${beneficiaire.nom} - ${formatDate(new Date(), 'time')}`,
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le pointage',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualScan = async () => {
    if (!manualCodeBarre.trim()) {
      toast({
        title: 'Code-barres requis',
        description: 'Veuillez saisir un code-barres',
        variant: 'destructive'
      })
      return
    }

    await handleScan(manualCodeBarre.trim())
    setManualCodeBarre('')
    setIsManualDialogOpen(false)
  }

  const filteredPresences = presencesActuelles.filter(p => {
    const matchesCategorie = selectedCategorie === 'ALL' || p.beneficiaire.categorie === selectedCategorie
    const matchesSearch = searchQuery === '' || 
      p.beneficiaire.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.beneficiaire.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.beneficiaire.codeBarre.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategorie && matchesSearch
  })

  return (
    <Layout>
      <div className="w-full min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPresets.gentle}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Pointage</h1>
                <p className="text-muted-foreground mt-2">Gestion des entrées et sorties en temps réel</p>
              </div>
              <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <UserPlus className="h-5 w-5" />
                    Pointage manuel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pointage manuel</DialogTitle>
                    <DialogDescription>
                      Saisissez le code-barres du bénéficiaire pour enregistrer un pointage
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="manual-code">Code-barres</Label>
                      <Input
                        id="manual-code"
                        placeholder="MADE1234567890"
                        value={manualCodeBarre}
                        onChange={(e) => setManualCodeBarre(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleManualScan} disabled={isProcessing}>
                      Enregistrer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total pointages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stats.totalPresences}</div>
                        <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Entrées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-chart-2/10">
                        <LogIn className="h-6 w-6 text-chart-2" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stats.entrees}</div>
                        <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Sorties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-chart-3/10">
                        <LogOut className="h-6 w-6 text-chart-3" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stats.sorties}</div>
                        <p className="text-xs text-muted-foreground">Aujourd'hui</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Présents actuels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stats.presentsActuels}</div>
                        <p className="text-xs text-muted-foreground">En ce moment</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={staggerItem}>
                <Card className={stats.alertesProlongees > 0 ? 'border-destructive' : ''}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Alertes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-destructive/10">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold">{stats.alertesProlongees}</div>
                        <p className="text-xs text-muted-foreground">Présence +12h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="lg:col-span-1"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Scanner laser</CardTitle>
                    <CardDescription>Détection automatique des scans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScannerInterface onScan={handleScan} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="lg:col-span-2"
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Présences actuelles</CardTitle>
                        <CardDescription>{filteredPresences.length} bénéficiaire(s) présent(s)</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedCategorie} onValueChange={setSelectedCategorie}>
                      <TabsList className="grid w-full grid-cols-5 mb-4">
                        <TabsTrigger value="ALL">Tous</TabsTrigger>
                        {CATEGORIES.map(cat => (
                          <TabsTrigger key={cat.value} value={cat.value}>
                            {cat.value}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value={selectedCategorie} className="mt-0">
                        <ScrollArea className="h-[500px] pr-4">
                          <AnimatePresence mode="popLayout">
                            {filteredPresences.length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                              >
                                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">Aucune présence actuellement</p>
                              </motion.div>
                            ) : (
                              <div className="space-y-3">
                                {filteredPresences.map((presence, index) => (
                                  <motion.div
                                    key={presence.beneficiaire.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ ...springPresets.snappy, delay: index * 0.05 }}
                                  >
                                    <Card className={presence.prolongee ? 'border-destructive' : ''}>
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                          {presence.beneficiaire.photo && (
                                            <img
                                              src={presence.beneficiaire.photo}
                                              alt={`${presence.beneficiaire.prenom} ${presence.beneficiaire.nom}`}
                                              className="w-12 h-12 rounded-full object-cover"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <p className="font-semibold truncate">
                                                {presence.beneficiaire.prenom} {presence.beneficiaire.nom}
                                              </p>
                                              <Badge
                                                variant="outline"
                                                style={{
                                                  borderColor: getCategorieColor(presence.beneficiaire.categorie),
                                                  color: getCategorieColor(presence.beneficiaire.categorie)
                                                }}
                                              >
                                                {presence.beneficiaire.categorie}
                                              </Badge>
                                              {presence.prolongee && (
                                                <Badge variant="destructive" className="gap-1">
                                                  <AlertCircle className="h-3 w-3" />
                                                  +12h
                                                </Badge>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                              <span className="flex items-center gap-1">
                                                <LogIn className="h-3 w-3" />
                                                {formatDate(presence.entree.timestamp, 'time')}
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(presence.duree)}
                                              </span>
                                              <span className="text-xs font-mono">
                                                {presence.beneficiaire.codeBarre}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </AnimatePresence>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}