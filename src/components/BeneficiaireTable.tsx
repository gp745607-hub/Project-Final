import { useState, useMemo } from 'react';
import { Search, Eye, Edit, Archive, CreditCard, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Beneficiaire, 
  CATEGORIES, 
  getCategorieColor, 
  getCategorieLabel,
  calculateAge,
  formatDate 
} from '@/lib/index';

interface BeneficiaireTableProps {
  beneficiaires: Beneficiaire[];
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onViewDetails: (id: string) => void;
  onGenerateBadge: (id: string) => void;
}

type SortField = 'nom' | 'prenom' | 'dateInscription' | 'categorie';
type SortOrder = 'asc' | 'desc';

export function BeneficiaireTable({
  beneficiaires,
  onEdit,
  onArchive,
  onViewDetails,
  onGenerateBadge,
}: BeneficiaireTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('TOUS');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dateInscription');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const itemsPerPage = 10;

  const filteredBeneficiaires = useMemo(() => {
    let filtered = beneficiaires;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.nom.toLowerCase().includes(query) ||
          b.prenom.toLowerCase().includes(query) ||
          b.codeBarre.toLowerCase().includes(query)
      );
    }

    if (selectedCategorie !== 'TOUS') {
      filtered = filtered.filter((b) => b.categorie === selectedCategorie);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'dateInscription') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [beneficiaires, searchQuery, selectedCategorie, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredBeneficiaires.length / itemsPerPage);
  const paginatedBeneficiaires = filteredBeneficiaires.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { TOUS: beneficiaires.length };
    CATEGORIES.forEach((cat) => {
      counts[cat.value] = beneficiaires.filter((b) => b.categorie === cat.value).length;
    });
    return counts;
  }, [beneficiaires]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, prénom ou code-barres..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredBeneficiaires.length} bénéficiaire{filteredBeneficiaires.length > 1 ? 's' : ''}
        </div>
      </div>

      <Tabs value={selectedCategorie} onValueChange={(value) => {
        setSelectedCategorie(value);
        setCurrentPage(1);
      }}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="TOUS" className="gap-2">
            Tous
            <Badge variant="secondary" className="ml-1">
              {categoryCounts.TOUS}
            </Badge>
          </TabsTrigger>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
              {cat.label.split(' ')[0]}
              <Badge variant="secondary" className="ml-1">
                {categoryCounts[cat.value] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Photo</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('nom')}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Nom
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('prenom')}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Prénom
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Âge</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('categorie')}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Catégorie
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Code-barres</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('dateInscription')}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Inscription
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedBeneficiaires.map((beneficiaire, index) => (
                  <motion.tr
                    key={beneficiaire.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Avatar className="h-10 w-10">
                        {beneficiaire.photo && <AvatarImage src={beneficiaire.photo} alt={`${beneficiaire.prenom} ${beneficiaire.nom}`} />}
                        <AvatarFallback className="text-xs font-medium">
                          {beneficiaire.prenom[0]}{beneficiaire.nom[0]}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-4 py-3 font-medium">{beneficiaire.nom}</td>
                    <td className="px-4 py-3">{beneficiaire.prenom}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {calculateAge(beneficiaire.dateNaissance)} ans
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        style={{
                          backgroundColor: `color-mix(in srgb, ${getCategorieColor(beneficiaire.categorie)} 15%, transparent)`,
                          color: getCategorieColor(beneficiaire.categorie),
                          borderColor: `color-mix(in srgb, ${getCategorieColor(beneficiaire.categorie)} 30%, transparent)`,
                        }}
                        className="border"
                      >
                        {getCategorieLabel(beneficiaire.categorie).split(' ')[0]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {beneficiaire.codeBarre}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(beneficiaire.dateInscription)}
                    </td>
                    <td className="px-4 py-3">
                      {beneficiaire.archive ? (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Archivé
                        </Badge>
                      ) : beneficiaire.actif ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(beneficiaire.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(beneficiaire.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onGenerateBadge(beneficiaire.id)}
                          className="h-8 w-8 p-0"
                        >
                          <CreditCard className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onArchive(beneficiaire.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredBeneficiaires.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Aucun bénéficiaire trouvé</p>
            <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}