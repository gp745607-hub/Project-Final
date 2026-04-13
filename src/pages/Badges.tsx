import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { BadgeGenerator } from '@/components/BadgeGenerator';
import { Beneficiaire, CATEGORIES, getCategorieColor, getCategorieLabel, generateCodeBarre } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Printer, RefreshCw, Download, Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

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
    archive: false,
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
    archive: false,
  },
  {
    id: '3',
    codeBarre: 'MADE5678901234',
    nom: 'Andria',
    prenom: 'Paul',
    dateNaissance: '1985-03-10',
    categorie: 'ADULTE',
    photo: 'https://images.unsplash.com/flagged/photo-1579210504658-94fcc9cfa42f?w=200',
    dateInscription: '2024-02-01',
    actif: true,
    archive: false,
  },
  {
    id: '4',
    codeBarre: 'MADE4321098765',
    nom: 'Rabe',
    prenom: 'Sophie',
    dateNaissance: '1960-11-30',
    categorie: 'SENIOR',
    dateInscription: '2024-02-10',
    actif: true,
    archive: false,
  },
];

export default function Badges() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('ALL');
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>(mockBeneficiaires);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  const filteredBeneficiaires = useMemo(() => {
    return beneficiaires.filter(b => {
      const matchesSearch = 
        b.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.codeBarre.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategorie = selectedCategorie === 'ALL' || b.categorie === selectedCategorie;
      
      return matchesSearch && matchesCategorie && !b.archive;
    });
  }, [beneficiaires, searchQuery, selectedCategorie]);

  const handleGenerateBadge = (beneficiaire: Beneficiaire) => {
    setSelectedBeneficiaire(beneficiaire);
    setShowBadgeDialog(true);
  };

  const handleRegenerateCodeBarre = async (beneficiaire: Beneficiaire) => {
    const newCodeBarre = generateCodeBarre();
    setBeneficiaires(prev => 
      prev.map(b => b.id === beneficiaire.id ? { ...b, codeBarre: newCodeBarre } : b)
    );
    toast({
      title: 'Code-barres régénéré',
      description: `Nouveau code: ${newCodeBarre}`,
    });
  };

  const handlePrintBatch = async () => {
    setIsGeneratingBatch(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ouvrir la fenêtre d\'impression',
        variant: 'destructive',
      });
      setIsGeneratingBatch(false);
      return;
    }

    const badgesPerPage = 10;
    const pages = Math.ceil(filteredBeneficiaires.length / badgesPerPage);
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Planche de Badges - ONG MADE</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .page { page-break-after: always; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; padding: 10mm; }
          .page:last-child { page-break-after: auto; }
          .badge { border: 2px solid #333; border-radius: 8px; padding: 8mm; background: white; }
          .badge-header { text-align: center; margin-bottom: 4mm; }
          .badge-photo { width: 30mm; height: 30mm; object-fit: cover; border-radius: 4mm; margin: 0 auto 4mm; display: block; background: #f0f0f0; }
          .badge-name { font-size: 14pt; font-weight: bold; text-align: center; margin: 2mm 0; }
          .badge-category { text-align: center; font-size: 10pt; color: #666; margin: 2mm 0; }
          .badge-barcode { text-align: center; font-family: monospace; font-size: 10pt; margin: 4mm 0; }
          .badge-footer { text-align: center; font-size: 8pt; color: #999; margin-top: 4mm; }
        </style>
      </head>
      <body>
    `;

    for (let page = 0; page < pages; page++) {
      htmlContent += '<div class="page">';
      const startIdx = page * badgesPerPage;
      const endIdx = Math.min(startIdx + badgesPerPage, filteredBeneficiaires.length);
      
      for (let i = startIdx; i < endIdx; i++) {
        const b = filteredBeneficiaires[i];
        htmlContent += `
          <div class="badge">
            <div class="badge-header">
              <strong>ONG MADE</strong><br/>
              <small>Madagascar Assistance & Development</small>
            </div>
            ${b.photo ? `<img src="${b.photo}" class="badge-photo" alt="Photo" />` : '<div class="badge-photo"></div>'}
            <div class="badge-name">${b.prenom} ${b.nom}</div>
            <div class="badge-category">${getCategorieLabel(b.categorie)}</div>
            <div class="badge-barcode">${b.codeBarre}</div>
            <div class="badge-footer">Inscrit le ${new Date(b.dateInscription).toLocaleDateString('fr-FR')}</div>
          </div>
        `;
      }
      htmlContent += '</div>';
    }

    htmlContent += '</body></html>';
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };

    setIsGeneratingBatch(false);
    toast({
      title: 'Planche générée',
      description: `${filteredBeneficiaires.length} badges prêts à imprimer`,
    });
  };

  return (
    <Layout>
      <div className="w-full p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestion des Badges</h1>
              <p className="text-muted-foreground mt-1">
                Génération et impression des badges bénéficiaires
              </p>
            </div>
            <Button
              onClick={handlePrintBatch}
              disabled={filteredBeneficiaires.length === 0 || isGeneratingBatch}
              size="lg"
              className="gap-2"
            >
              {isGeneratingBatch ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Grid3x3 className="h-5 w-5" />
              )}
              Imprimer Planche ({filteredBeneficiaires.length} badges)
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filtres et Recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou code-barres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Tabs value={selectedCategorie} onValueChange={setSelectedCategorie}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="ALL">Tous ({beneficiaires.filter(b => !b.archive).length})</TabsTrigger>
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat.value} value={cat.value}>
                      {cat.label.split(' ')[0]} ({beneficiaires.filter(b => b.categorie === cat.value && !b.archive).length})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBeneficiaires.map((beneficiaire) => (
              <motion.div
                key={beneficiaire.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      {beneficiaire.photo ? (
                        <img
                          src={beneficiaire.photo}
                          alt={`${beneficiaire.prenom} ${beneficiaire.nom}`}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold">
                          {beneficiaire.prenom[0]}{beneficiaire.nom[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {beneficiaire.prenom} {beneficiaire.nom}
                        </h3>
                        <Badge
                          style={{ backgroundColor: getCategorieColor(beneficiaire.categorie) }}
                          className="text-white text-xs mt-1"
                        >
                          {getCategorieLabel(beneficiaire.categorie)}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-muted rounded p-2 text-center">
                      <div className="text-xs text-muted-foreground mb-1">Code-barres</div>
                      <div className="font-mono text-sm font-semibold">{beneficiaire.codeBarre}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleGenerateBadge(beneficiaire)}
                        size="sm"
                        className="flex-1 gap-1"
                      >
                        <Printer className="h-3 w-3" />
                        Badge
                      </Button>
                      <Button
                        onClick={() => handleRegenerateCodeBarre(beneficiaire)}
                        size="sm"
                        variant="outline"
                        className="gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredBeneficiaires.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Aucun bénéficiaire trouvé</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu et Impression du Badge</DialogTitle>
          </DialogHeader>
          {selectedBeneficiaire && (
            <BadgeGenerator beneficiaire={selectedBeneficiaire} />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
