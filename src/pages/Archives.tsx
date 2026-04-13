import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { BeneficiaireTable } from '@/components/BeneficiaireTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, RotateCcw, Download, Archive, Users, Calendar } from 'lucide-react';
import { Beneficiaire, CATEGORIES, formatDate, getCategorieLabel, exportToCSV, exportToJSON, debounce } from '@/lib/index';
import { springPresets } from '@/lib/motion';

const mockArchivedBeneficiaires: Beneficiaire[] = [
  {
    id: '1',
    codeBarre: 'MADEL8X9K2M5N7',
    nom: 'Rakoto',
    prenom: 'Jean',
    dateNaissance: '2010-05-15',
    categorie: 'ENFANT',
    photo: 'https://images.unsplash.com/photo-1543181077-099f32f30a1c?w=200',
    notes: 'Archivé suite à déménagement',
    dateInscription: '2024-01-10',
    actif: false,
    archive: true,
    dateArchivage: '2026-03-15',
  },
  {
    id: '2',
    codeBarre: 'MADEP4Q7R9S2T6',
    nom: 'Rasoamalala',
    prenom: 'Marie',
    dateNaissance: '2005-08-22',
    categorie: 'ADOLESCENT',
    photo: 'https://images.unsplash.com/photo-1553775927-a071d5a6a39a?w=200',
    notes: 'Archivé temporairement',
    dateInscription: '2024-02-20',
    actif: false,
    archive: true,
    dateArchivage: '2026-02-28',
  },
  {
    id: '3',
    codeBarre: 'MADEW8Y3Z5A1B4',
    nom: 'Andrianina',
    prenom: 'Paul',
    dateNaissance: '1985-11-30',
    categorie: 'ADULTE',
    photo: 'https://images.unsplash.com/photo-1579210504658-94fcc9cfa42f?w=200',
    notes: 'Archivé - fin de programme',
    dateInscription: '2023-06-15',
    actif: false,
    archive: true,
    dateArchivage: '2026-01-10',
  },
];

export default function Archives() {
  const { toast } = useToast();
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>(mockArchivedBeneficiaires);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('ALL');
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const debouncedSearch = useMemo(
    () => debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter((b) => {
      const matchesSearch =
        searchQuery === '' ||
        b.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.codeBarre.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategorie =
        selectedCategorie === 'ALL' || b.categorie === selectedCategorie;

      return matchesSearch && matchesCategorie;
    });
  }, [beneficiaires, searchQuery, selectedCategorie]);

  const handleRestore = async (id: string) => {
    const beneficiaire = beneficiaires.find((b) => b.id === id);
    if (!beneficiaire) return;

    setSelectedBeneficiaire(beneficiaire);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!selectedBeneficiaire) return;

    setIsRestoring(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setBeneficiaires((prev) =>
        prev.filter((b) => b.id !== selectedBeneficiaire.id)
      );

      toast({
        title: 'Bénéficiaire restauré',
        description: `${selectedBeneficiaire.prenom} ${selectedBeneficiaire.nom} a été restauré avec succès.`,
      });

      setRestoreDialogOpen(false);
      setSelectedBeneficiaire(null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de restaurer le bénéficiaire.',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredBeneficiaires.map((b) => ({
      'Code-barres': b.codeBarre,
      Nom: b.nom,
      Prénom: b.prenom,
      'Date de naissance': formatDate(b.dateNaissance),
      Catégorie: getCategorieLabel(b.categorie),
      'Date inscription': formatDate(b.dateInscription),
      'Date archivage': b.dateArchivage ? formatDate(b.dateArchivage) : '',
      Notes: b.notes || '',
    }));

    exportToCSV(exportData, 'archives_beneficiaires');

    toast({
      title: 'Export réussi',
      description: 'Les archives ont été exportées en CSV.',
    });
  };

  const handleExportJSON = () => {
    exportToJSON(filteredBeneficiaires, 'archives_beneficiaires');

    toast({
      title: 'Export réussi',
      description: 'Les archives ont été exportées en JSON.',
    });
  };

  const stats = useMemo(() => {
    const total = beneficiaires.length;
    const byCategorie = CATEGORIES.reduce((acc, cat) => {
      acc[cat.value] = beneficiaires.filter((b) => b.categorie === cat.value).length;
      return acc;
    }, {} as Record<string, number>);

    return { total, byCategorie };
  }, [beneficiaires]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springPresets.gentle}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Archives</h1>
            <p className="text-muted-foreground mt-2">
              Gestion des bénéficiaires archivés
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Archivés</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Bénéficiaires archivés
              </p>
            </CardContent>
          </Card>

          {CATEGORIES.map((cat) => (
            <Card key={cat.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{cat.label.split(' ')[0]}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.byCategorie[cat.value] || 0}</div>
                <Badge
                  variant="outline"
                  className="mt-2"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  {cat.label}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bénéficiaires Archivés</CardTitle>
            <CardDescription>
              Liste complète des bénéficiaires archivés. Vous pouvez les restaurer à tout moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom ou code-barres..."
                  className="pl-10"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={selectedCategorie} onValueChange={setSelectedCategorie}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="ALL">Tous ({stats.total})</TabsTrigger>
                {CATEGORIES.map((cat) => (
                  <TabsTrigger key={cat.value} value={cat.value}>
                    {cat.label.split(' ')[0]} ({stats.byCategorie[cat.value] || 0})
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedCategorie} className="mt-6">
                {filteredBeneficiaires.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Aucun bénéficiaire archivé</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery
                        ? 'Aucun résultat ne correspond à votre recherche.'
                        : 'Il n\'y a pas de bénéficiaires archivés dans cette catégorie.'}
                    </p>
                  </div>
                ) : (
                  <BeneficiaireTable
                    beneficiaires={filteredBeneficiaires}
                    onEdit={() => {}}
                    onArchive={handleRestore}
                    onViewDetails={() => {}}
                    onGenerateBadge={() => {}}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer le bénéficiaire</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir restaurer ce bénéficiaire ? Il sera réactivé et retiré des archives.
            </DialogDescription>
          </DialogHeader>

          {selectedBeneficiaire && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                {selectedBeneficiaire.photo && (
                  <img
                    src={selectedBeneficiaire.photo}
                    alt={`${selectedBeneficiaire.prenom} ${selectedBeneficiaire.nom}`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">
                    {selectedBeneficiaire.prenom} {selectedBeneficiaire.nom}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBeneficiaire.codeBarre}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-1"
                    style={{
                      borderColor: CATEGORIES.find(
                        (c) => c.value === selectedBeneficiaire.categorie
                      )?.color,
                      color: CATEGORIES.find(
                        (c) => c.value === selectedBeneficiaire.categorie
                      )?.color,
                    }}
                  >
                    {getCategorieLabel(selectedBeneficiaire.categorie)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Archivé le :</span>
                  <span className="font-medium">
                    {selectedBeneficiaire.dateArchivage
                      ? formatDate(selectedBeneficiaire.dateArchivage, 'long')
                      : 'N/A'}
                  </span>
                </div>
                {selectedBeneficiaire.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes : </span>
                    <span>{selectedBeneficiaire.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={isRestoring}
            >
              Annuler
            </Button>
            <Button onClick={confirmRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="mr-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </motion.div>
                  Restauration...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
