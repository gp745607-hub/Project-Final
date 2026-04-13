import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ExportButtons } from '@/components/ExportButtons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileText, Database, Globe, TrendingUp, Users, Activity, Package } from 'lucide-react';
import { formatDate, CATEGORIES } from '@/lib/index';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const mockBeneficiaires = [
  { id: '1', nom: 'Rakoto', prenom: 'Jean', categorie: 'ENFANT', dateInscription: '2026-01-15', actif: true },
  { id: '2', nom: 'Rabe', prenom: 'Marie', categorie: 'ADOLESCENT', dateInscription: '2026-02-10', actif: true },
  { id: '3', nom: 'Rasoa', prenom: 'Paul', categorie: 'ADULTE', dateInscription: '2026-01-20', actif: true },
  { id: '4', nom: 'Randria', prenom: 'Sophie', categorie: 'SENIOR', dateInscription: '2026-03-05', actif: true },
];

const mockPointages = Array.from({ length: 50 }, (_, i) => ({
  id: `p${i}`,
  beneficiaireId: mockBeneficiaires[i % 4].id,
  type: i % 2 === 0 ? 'ENTREE' : 'SORTIE',
  timestamp: new Date(2026, 3, 13 - Math.floor(i / 10), 8 + (i % 10), 0).toISOString(),
}));

const mockServices = Array.from({ length: 30 }, (_, i) => ({
  id: `s${i}`,
  beneficiaireId: mockBeneficiaires[i % 4].id,
  type: ['CANTINE', 'GARGOTE', 'MEDICAL'][i % 3],
  timestamp: new Date(2026, 3, 13 - Math.floor(i / 10), 12 + (i % 3), 0).toISOString(),
}));

const frequentationData = [
  { jour: 'Lun', presences: 45, services: 38 },
  { jour: 'Mar', presences: 52, services: 42 },
  { jour: 'Mer', presences: 48, services: 40 },
  { jour: 'Jeu', presences: 55, services: 45 },
  { jour: 'Ven', presences: 50, services: 43 },
  { jour: 'Sam', presences: 35, services: 28 },
  { jour: 'Dim', presences: 30, services: 25 },
];

const categoriesData = CATEGORIES.map(cat => ({
  name: cat.label.split(' ')[0],
  value: mockBeneficiaires.filter(b => b.categorie === cat.value).length,
  color: cat.color,
}));

const servicesData = [
  { name: 'Cantine', value: 120, color: 'oklch(0.68 0.22 150)' },
  { name: 'Gargote', value: 85, color: 'oklch(0.62 0.22 220)' },
  { name: 'Médical', value: 45, color: 'oklch(0.65 0.16 30)' },
];

export default function Rapports() {
  const [dateDebut, setDateDebut] = useState<Date>();
  const [dateFin, setDateFin] = useState<Date>();
  const [periode, setPeriode] = useState('mois');
  const [langue, setLangue] = useState('fr');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (type: 'impact' | 'backup') => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);

    if (type === 'impact') {
      const reportData = {
        periode: `${formatDate(dateDebut || new Date())} - ${formatDate(dateFin || new Date())}`,
        statistiques: {
          totalBeneficiaires: mockBeneficiaires.length,
          totalPresences: mockPointages.filter(p => p.type === 'ENTREE').length,
          totalServices: mockServices.length,
          tauxFrequentation: '85%',
        },
        repartitionCategories: categoriesData,
        frequentation: frequentationData,
        services: servicesData,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport_impact_${langue}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        beneficiaires: mockBeneficiaires,
        pointages: mockPointages,
        services: mockServices,
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `backup_made_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports & Exports</h1>
          <p className="text-muted-foreground mt-2">
            Générez des rapports détaillés et exportez vos données
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bénéficiaires</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockBeneficiaires.length}</div>
              <p className="text-xs text-muted-foreground">Actifs dans la base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pointages</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPointages.length}</div>
              <p className="text-xs text-muted-foreground">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockServices.length}</div>
              <p className="text-xs text-muted-foreground">Fournis ce mois</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Fréquentation moyenne</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="exports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="exports">Exports Base de Données</TabsTrigger>
            <TabsTrigger value="impact">Rapport d'Impact</TabsTrigger>
            <TabsTrigger value="backup">Backup Système</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
          </TabsList>

          <TabsContent value="exports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export des Données</CardTitle>
                <CardDescription>
                  Exportez vos données au format Excel ou PDF pour analyse externe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date de début</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateDebut && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateDebut ? formatDate(dateDebut) : 'Sélectionner'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateDebut}
                          onSelect={setDateDebut}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !dateFin && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFin ? formatDate(dateFin) : 'Sélectionner'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFin}
                          onSelect={setDateFin}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Bénéficiaires</h3>
                    <ExportButtons data={mockBeneficiaires} type="beneficiaires" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Pointages</h3>
                    <ExportButtons data={mockPointages} type="pointages" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Services</h3>
                    <ExportButtons data={mockServices} type="services" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rapport d'Impact pour Donateurs</CardTitle>
                <CardDescription>
                  Générez un rapport détaillé avec statistiques et graphiques pour vos partenaires
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Période</Label>
                    <Select value={periode} onValueChange={setPeriode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semaine">Cette semaine</SelectItem>
                        <SelectItem value="mois">Ce mois</SelectItem>
                        <SelectItem value="trimestre">Ce trimestre</SelectItem>
                        <SelectItem value="annee">Cette année</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Langue</Label>
                    <Select value={langue} onValueChange={setLangue}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="it">Italien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="invisible">Action</Label>
                    <Button
                      onClick={() => handleGenerateReport('impact')}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Download className="mr-2 h-4 w-4 animate-pulse" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Générer Rapport
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Contenu du rapport</h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Statistiques générales</Badge>
                        <span className="text-sm text-muted-foreground">
                          Bénéficiaires, présences, services
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Graphiques de fréquentation</Badge>
                        <span className="text-sm text-muted-foreground">
                          Évolution hebdomadaire et mensuelle
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Répartition par catégorie</Badge>
                        <span className="text-sm text-muted-foreground">
                          Enfants, adolescents, adultes, seniors
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Services fournis</Badge>
                        <span className="text-sm text-muted-foreground">
                          Cantine, gargote, médical
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup Système</CardTitle>
                <CardDescription>
                  Sauvegardez l'intégralité de votre base de données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border border-muted bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <Database className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Backup complet</p>
                      <p className="text-sm text-muted-foreground">
                        Inclut tous les bénéficiaires, pointages, services et logs d'audit.
                        Format JSON compatible avec restauration système.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    onClick={() => handleGenerateReport('backup')}
                    disabled={isGenerating}
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Download className="mr-2 h-4 w-4 animate-pulse" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger Backup JSON
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="lg" className="w-full" disabled>
                    <Database className="mr-2 h-4 w-4" />
                    Export SQL (Bientôt)
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Derniers backups</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">backup_made_2026-04-13.json</p>
                          <p className="text-xs text-muted-foreground">Aujourd'hui à 08:30</p>
                        </div>
                      </div>
                      <Badge variant="secondary">2.4 MB</Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">backup_made_2026-04-12.json</p>
                          <p className="text-xs text-muted-foreground">Hier à 18:00</p>
                        </div>
                      </div>
                      <Badge variant="secondary">2.3 MB</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Fréquentation Hebdomadaire</CardTitle>
                  <CardDescription>Présences et services par jour</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={frequentationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 220)" />
                      <XAxis dataKey="jour" stroke="oklch(0.48 0.015 220)" />
                      <YAxis stroke="oklch(0.48 0.015 220)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.88 0.01 220)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="presences" fill="oklch(0.48 0.18 220)" name="Présences" />
                      <Bar dataKey="services" fill="oklch(0.60 0.18 150)" name="Services" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Catégorie</CardTitle>
                  <CardDescription>Distribution des bénéficiaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoriesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoriesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.88 0.01 220)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Services Fournis</CardTitle>
                  <CardDescription>Répartition des services ce mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={servicesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {servicesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.88 0.01 220)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tendance Mensuelle</CardTitle>
                  <CardDescription>Évolution des présences</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={frequentationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 220)" />
                      <XAxis dataKey="jour" stroke="oklch(0.48 0.015 220)" />
                      <YAxis stroke="oklch(0.48 0.015 220)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(1 0 0)',
                          border: '1px solid oklch(0.88 0.01 220)',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="presences"
                        stroke="oklch(0.48 0.18 220)"
                        strokeWidth={2}
                        name="Présences"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </Layout>
  );
}
