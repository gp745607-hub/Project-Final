import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Download, Users, Archive, UserCheck, UserX } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { BeneficiaireTable } from '@/components/BeneficiaireTable'
import { BeneficiaireForm } from '@/components/BeneficiaireForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  type Beneficiaire, 
  CATEGORIES, 
  generateCodeBarre, 
  exportToCSV,
  debounce,
  getCategorieLabel,
  calculateAge
} from '@/lib/index'

const MOCK_BENEFICIAIRES: Beneficiaire[] = [
  {
    id: '1',
    codeBarre: 'MADE1234567890',
    nom: 'Rakoto',
    prenom: 'Jean',
    dateNaissance: '2010-05-15',
    categorie: 'ENFANT',
    photo: 'https://images.unsplash.com/photo-1543181077-099f32f30a1c?w=200',
    notes: 'Bénéficiaire régulier',
    dateInscription: '2024-01-10',
    actif: true,
    archive: false
  },
  {
    id: '2',
    codeBarre: 'MADE0987654321',
    nom: 'Rasoamalala',
    prenom: 'Marie',
    dateNaissance: '2005-08-22',
    categorie: 'ADOLESCENT',
    photo: 'https://images.unsplash.com/photo-1553775927-a071d5a6a39a?w=200',
    dateInscription: '2024-02-15',
    actif: true,
    archive: false
  },
  {
    id: '3',
    codeBarre: 'MADE5678901234',
    nom: 'Andriamampianina',
    prenom: 'Paul',
    dateNaissance: '1985-03-10',
    categorie: 'ADULTE',
    dateInscription: '2024-01-20',
    actif: true,
    archive: false
  },
  {
    id: '4',
    codeBarre: 'MADE4321098765',
    nom: 'Razafindrakoto',
    prenom: 'Sophie',
    dateNaissance: '1960-11-05',
    categorie: 'SENIOR',
    photo: 'https://images.unsplash.com/photo-1579210504658-94fcc9cfa42f?w=200',
    notes: 'Suivi médical régulier',
    dateInscription: '2023-12-01',
    actif: true,
    archive: false
  }
]

export default function Beneficiaires() {
  const { toast } = useToast()
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>(MOCK_BENEFICIAIRES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategorie, setSelectedCategorie] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter(b => {
      if (b.archive) return false
      
      const matchesSearch = searchQuery === '' || 
        b.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.codeBarre.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategorie = selectedCategorie === 'ALL' || b.categorie === selectedCategorie
      
      return matchesSearch && matchesCategorie
    })
  }, [beneficiaires, searchQuery, selectedCategorie])

  const stats = useMemo(() => {
    const actifs = beneficiaires.filter(b => !b.archive)
    return {
      total: actifs.length,
      enfants: actifs.filter(b => b.categorie === 'ENFANT').length,
      adolescents: actifs.filter(b => b.categorie === 'ADOLESCENT').length,
      adultes: actifs.filter(b => b.categorie === 'ADULTE').length,
      seniors: actifs.filter(b => b.categorie === 'SENIOR').length
    }
  }, [beneficiaires])

  const handleSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  )

  const handleAdd = async (data: Partial<Beneficiaire>) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const newBeneficiaire: Beneficiaire = {
        id: Date.now().toString(),
        codeBarre: generateCodeBarre(),
        nom: data.nom!,
        prenom: data.prenom!,
        dateNaissance: data.dateNaissance!,
        categorie: data.categorie!,
        photo: data.photo,
        notes: data.notes,
        dateInscription: new Date().toISOString(),
        actif: true,
        archive: false
      }
      
      setBeneficiaires(prev => [...prev, newBeneficiaire])
      setIsAddModalOpen(false)
      
      toast({
        title: 'Bénéficiaire ajouté',
        description: `${newBeneficiaire.prenom} ${newBeneficiaire.nom} a été ajouté avec succès.`,
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le bénéficiaire.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    const beneficiaire = beneficiaires.find(b => b.id === id)
    if (beneficiaire) {
      setSelectedBeneficiaire(beneficiaire)
      setIsEditModalOpen(true)
    }
  }

  const handleUpdate = async (data: Partial<Beneficiaire>) => {
    if (!selectedBeneficiaire) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setBeneficiaires(prev => prev.map(b => 
        b.id === selectedBeneficiaire.id 
          ? { ...b, ...data }
          : b
      ))
      
      setIsEditModalOpen(false)
      setSelectedBeneficiaire(undefined)
      
      toast({
        title: 'Bénéficiaire modifié',
        description: 'Les informations ont été mises à jour avec succès.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le bénéficiaire.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async (id: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setBeneficiaires(prev => prev.map(b => 
        b.id === id 
          ? { ...b, archive: true, dateArchivage: new Date().toISOString() }
          : b
      ))
      
      toast({
        title: 'Bénéficiaire archivé',
        description: 'Le bénéficiaire a été archivé avec succès.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'archiver le bénéficiaire.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    const beneficiaire = beneficiaires.find(b => b.id === id)
    if (beneficiaire) {
      setSelectedBeneficiaire(beneficiaire)
      setIsDetailsModalOpen(true)
    }
  }

  const handleGenerateBadge = (id: string) => {
    const beneficiaire = beneficiaires.find(b => b.id === id)
    if (beneficiaire) {
      toast({
        title: 'Badge en cours de génération',
        description: `Badge pour ${beneficiaire.prenom} ${beneficiaire.nom}`,
      })
    }
  }

  const handleExport = () => {
    const exportData = filteredBeneficiaires.map(b => ({
      'Code-barres': b.codeBarre,
      'Nom': b.nom,
      'Prénom': b.prenom,
      'Date de naissance': b.dateNaissance,
      'Âge': calculateAge(b.dateNaissance),
      'Catégorie': getCategorieLabel(b.categorie),
      'Date d\'inscription': b.dateInscription,
      'Notes': b.notes || ''
    }))
    
    exportToCSV(exportData, 'beneficiaires')
    
    toast({
      title: 'Export réussi',
      description: `${exportData.length} bénéficiaires exportés en Excel.`,
    })
  }

  return (
    <Layout>
      <div className="w-full min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-6 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Bénéficiaires</h1>
              <p className="text-muted-foreground mt-1">
                Gérez les profils et informations des bénéficiaires de l'ONG MADE
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Ajouter un bénéficiaire
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Enfants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.68 0.22 150)' }} />
                  <span className="text-2xl font-bold">{stats.enfants}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Adolescents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.62 0.22 220)' }} />
                  <span className="text-2xl font-bold">{stats.adolescents}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Adultes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.65 0.16 30)' }} />
                  <span className="text-2xl font-bold">{stats.adultes}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Seniors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: 'oklch(0.58 0.14 280)' }} />
                  <span className="text-2xl font-bold">{stats.seniors}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liste des Bénéficiaires</CardTitle>
                  <CardDescription>
                    {filteredBeneficiaires.length} bénéficiaire{filteredBeneficiaires.length > 1 ? 's' : ''} trouvé{filteredBeneficiaires.length > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exporter Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou code-barres..."
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              <Tabs value={selectedCategorie} onValueChange={setSelectedCategorie}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ALL">Tous</TabsTrigger>
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value}>
                      {cat.value}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <BeneficiaireTable
                beneficiaires={filteredBeneficiaires}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onViewDetails={handleViewDetails}
                onGenerateBadge={handleGenerateBadge}
              />
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Bénéficiaire</DialogTitle>
            </DialogHeader>
            <BeneficiaireForm
              onSubmit={handleAdd}
              onCancel={() => setIsAddModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le Bénéficiaire</DialogTitle>
            </DialogHeader>
            <BeneficiaireForm
              beneficiaire={selectedBeneficiaire}
              onSubmit={handleUpdate}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedBeneficiaire(undefined)
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du Bénéficiaire</DialogTitle>
            </DialogHeader>
            {selectedBeneficiaire && (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  {selectedBeneficiaire.photo ? (
                    <img
                      src={selectedBeneficiaire.photo}
                      alt={`${selectedBeneficiaire.prenom} ${selectedBeneficiaire.nom}`}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedBeneficiaire.prenom} {selectedBeneficiaire.nom}
                      </h3>
                      <p className="text-muted-foreground">
                        {getCategorieLabel(selectedBeneficiaire.categorie)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        style={{ 
                          borderColor: selectedBeneficiaire.actif ? 'oklch(0.68 0.22 150)' : 'oklch(0.55 0.22 10)',
                          color: selectedBeneficiaire.actif ? 'oklch(0.68 0.22 150)' : 'oklch(0.55 0.22 10)'
                        }}
                      >
                        {selectedBeneficiaire.actif ? (
                          <><UserCheck className="h-3 w-3 mr-1" /> Actif</>
                        ) : (
                          <><UserX className="h-3 w-3 mr-1" /> Inactif</>
                        )}
                      </Badge>
                      {selectedBeneficiaire.archive && (
                        <Badge variant="outline">
                          <Archive className="h-3 w-3 mr-1" />
                          Archivé
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Code-barres</p>
                    <p className="font-mono font-semibold">{selectedBeneficiaire.codeBarre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-semibold">
                      {new Date(selectedBeneficiaire.dateNaissance).toLocaleDateString('fr-FR')} 
                      <span className="text-muted-foreground ml-2">
                        ({calculateAge(selectedBeneficiaire.dateNaissance)} ans)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date d'inscription</p>
                    <p className="font-semibold">
                      {new Date(selectedBeneficiaire.dateInscription).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {selectedBeneficiaire.dateArchivage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date d'archivage</p>
                      <p className="font-semibold">
                        {new Date(selectedBeneficiaire.dateArchivage).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>

                {selectedBeneficiaire.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">
                      {selectedBeneficiaire.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      setIsDetailsModalOpen(false)
                      handleEdit(selectedBeneficiaire.id)
                    }}
                    className="flex-1"
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDetailsModalOpen(false)
                      handleGenerateBadge(selectedBeneficiaire.id)
                    }}
                    className="flex-1"
                  >
                    Générer Badge
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
