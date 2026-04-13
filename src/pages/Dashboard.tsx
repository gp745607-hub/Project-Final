import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { StatsCard, MetricCard, AlertCard } from '@/components/Stats';
import { Beneficiaire, Pointage, Service, CATEGORIES, formatDate, formatDuration, isPresenceProlongee } from '@/lib/index';
import { Users, UserCheck, Utensils, AlertTriangle, TrendingUp, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { springPresets, staggerContainer, staggerItem } from '@/lib/motion';

interface DashboardStats {
  totalPresencesToday: number;
  enfantsPresents: number;
  repasServis: number;
  alertesProlongees: number;
  presencesParHeure: { heure: string; count: number }[];
  presencesParCategorie: { categorie: string; count: number }[];
}

interface PresenceActive {
  beneficiaire: Beneficiaire;
  entree: string;
  duree: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPresencesToday: 0,
    enfantsPresents: 0,
    repasServis: 0,
    alertesProlongees: 0,
    presencesParHeure: [],
    presencesParCategorie: [],
  });
  const [presencesActives, setPresencesActives] = useState<PresenceActive[]>([]);
  const [alertes, setAlertes] = useState<PresenceActive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const mockBeneficiaires: Beneficiaire[] = [
        {
          id: '1',
          codeBarre: 'MADE001',
          nom: 'Rakoto',
          prenom: 'Jean',
          dateNaissance: '2015-03-15',
          categorie: 'ENFANT',
          dateInscription: '2024-01-10',
          actif: true,
          archive: false,
        },
        {
          id: '2',
          codeBarre: 'MADE002',
          nom: 'Rabe',
          prenom: 'Marie',
          dateNaissance: '2010-07-22',
          categorie: 'ADOLESCENT',
          dateInscription: '2024-01-15',
          actif: true,
          archive: false,
        },
        {
          id: '3',
          codeBarre: 'MADE003',
          nom: 'Randria',
          prenom: 'Paul',
          dateNaissance: '1985-11-08',
          categorie: 'ADULTE',
          dateInscription: '2024-02-01',
          actif: true,
          archive: false,
        },
      ];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockPointages: Pointage[] = [
        {
          id: 'p1',
          beneficiaireId: '1',
          codeBarre: 'MADE001',
          type: 'ENTREE',
          timestamp: new Date(today.getTime() + 8 * 3600000).toISOString(),
          scannerType: 'LASER',
        },
        {
          id: 'p2',
          beneficiaireId: '2',
          codeBarre: 'MADE002',
          type: 'ENTREE',
          timestamp: new Date(today.getTime() + 9 * 3600000).toISOString(),
          scannerType: 'LASER',
        },
        {
          id: 'p3',
          beneficiaireId: '3',
          codeBarre: 'MADE003',
          type: 'ENTREE',
          timestamp: new Date(today.getTime() + 7 * 3600000).toISOString(),
          scannerType: 'LASER',
        },
        {
          id: 'p4',
          beneficiaireId: '3',
          codeBarre: 'MADE003',
          type: 'SORTIE',
          timestamp: new Date(today.getTime() + 12 * 3600000).toISOString(),
          scannerType: 'LASER',
        },
      ];

      const mockServices: Service[] = [
        {
          id: 's1',
          beneficiaireId: '1',
          codeBarre: 'MADE001',
          type: 'CANTINE',
          timestamp: new Date(today.getTime() + 12 * 3600000).toISOString(),
        },
        {
          id: 's2',
          beneficiaireId: '2',
          codeBarre: 'MADE002',
          type: 'CANTINE',
          timestamp: new Date(today.getTime() + 12.5 * 3600000).toISOString(),
        },
        {
          id: 's3',
          beneficiaireId: '3',
          codeBarre: 'MADE003',
          type: 'GARGOTE',
          timestamp: new Date(today.getTime() + 11 * 3600000).toISOString(),
        },
      ];

      const todayPointages = mockPointages.filter(
        (p) => new Date(p.timestamp) >= today
      );

      const presencesMap = new Map<string, { entree?: Pointage; sortie?: Pointage }>();
      todayPointages.forEach((p) => {
        const existing = presencesMap.get(p.beneficiaireId) || {};
        if (p.type === 'ENTREE') {
          existing.entree = p;
        } else {
          existing.sortie = p;
        }
        presencesMap.set(p.beneficiaireId, existing);
      });

      const actives: PresenceActive[] = [];
      const alertesList: PresenceActive[] = [];

      presencesMap.forEach((presence, beneficiaireId) => {
        if (presence.entree && !presence.sortie) {
          const beneficiaire = mockBeneficiaires.find((b) => b.id === beneficiaireId);
          if (beneficiaire) {
            const duree = (Date.now() - new Date(presence.entree.timestamp).getTime()) / (1000 * 60 * 60);
            const presenceActive = {
              beneficiaire,
              entree: presence.entree.timestamp,
              duree,
            };
            actives.push(presenceActive);

            if (isPresenceProlongee(presence.entree.timestamp)) {
              alertesList.push(presenceActive);
            }
          }
        }
      });

      const enfantsPresents = actives.filter(
        (p) => p.beneficiaire.categorie === 'ENFANT'
      ).length;

      const presencesParHeure: { heure: string; count: number }[] = [];
      for (let h = 6; h <= 20; h++) {
        const count = todayPointages.filter((p) => {
          const hour = new Date(p.timestamp).getHours();
          return hour === h && p.type === 'ENTREE';
        }).length;
        presencesParHeure.push({ heure: `${h}h`, count });
      }

      const presencesParCategorie = CATEGORIES.map((cat) => ({
        categorie: cat.label,
        count: actives.filter((p) => p.beneficiaire.categorie === cat.value).length,
      }));

      setStats({
        totalPresencesToday: todayPointages.filter((p) => p.type === 'ENTREE').length,
        enfantsPresents,
        repasServis: mockServices.length,
        alertesProlongees: alertesList.length,
        presencesParHeure,
        presencesParCategorie,
      });

      setPresencesActives(actives);
      setAlertes(alertesList);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      setLoading(false);
    }
  };

  const heuresPointeData = stats.presencesParHeure.slice(0, 10);
  const maxCount = Math.max(...heuresPointeData.map((h) => h.count), 1);

  return (
    <Layout>
      <div className="w-full p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springPresets.gentle}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
              <p className="text-muted-foreground mt-1">
                Vue d'ensemble des activités - {formatDate(new Date(), 'long')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Mise à jour automatique toutes les 30s</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={staggerItem}>
            <StatsCard
              title="Présences Aujourd'hui"
              value={stats.totalPresencesToday}
              icon={<Users className="w-5 h-5" />}
              trend="+12% vs hier"
              trendUp={true}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard
              title="Enfants Présents"
              value={stats.enfantsPresents}
              icon={<UserCheck className="w-5 h-5" />}
              trend="Actuellement sur site"
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard
              title="Repas Servis"
              value={stats.repasServis}
              icon={<Utensils className="w-5 h-5" />}
              trend="+8% vs hier"
              trendUp={true}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <StatsCard
              title="Alertes Présence"
              value={stats.alertesProlongees}
              icon={<AlertTriangle className="w-5 h-5" />}
              trend=">12h sans sortie"
              trendUp={false}
            />
          </motion.div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Heures de Pointe
                </CardTitle>
                <CardDescription>
                  Fréquentation par heure (entrées)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {heuresPointeData.map((item) => (
                    <div key={item.heure} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium text-muted-foreground">
                        {item.heure}
                      </div>
                      <div className="flex-1">
                        <div className="h-8 bg-muted rounded-md overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / maxCount) * 100}%` }}
                            transition={springPresets.gentle}
                            className="h-full bg-primary flex items-center justify-end pr-2"
                          >
                            {item.count > 0 && (
                              <span className="text-xs font-semibold text-primary-foreground">
                                {item.count}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Présences par Catégorie
                </CardTitle>
                <CardDescription>
                  Répartition des bénéficiaires présents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.presencesParCategorie.map((item) => {
                    const cat = CATEGORIES.find((c) => c.label === item.categorie);
                    return (
                      <MetricCard
                        key={item.categorie}
                        label={item.categorie}
                        value={item.count}
                        color={cat?.color}
                        icon={<UserCheck className="w-4 h-4" />}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {alertes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springPresets.gentle, delay: 0.4 }}
          >
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes de Présence Prolongée
                </CardTitle>
                <CardDescription>
                  Bénéficiaires présents depuis plus de 12 heures
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertes.map((alerte) => (
                    <AlertCard
                      key={alerte.beneficiaire.id}
                      beneficiaire={{
                        nom: alerte.beneficiaire.nom,
                        prenom: alerte.beneficiaire.prenom,
                        categorie: alerte.beneficiaire.categorie,
                        codeBarre: alerte.beneficiaire.codeBarre,
                      }}
                      entree={alerte.entree}
                      duree={alerte.duree}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springPresets.gentle, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Accès Rapides</CardTitle>
              <CardDescription>
                Modules principaux de gestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <motion.a
                  href="#/pointage"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                >
                  <UserCheck className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1">Pointage</h3>
                  <p className="text-sm text-muted-foreground">
                    Scanner les entrées/sorties
                  </p>
                </motion.a>

                <motion.a
                  href="#/beneficiaires"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                >
                  <Users className="w-8 h-8 text-secondary mb-3" />
                  <h3 className="font-semibold mb-1">Bénéficiaires</h3>
                  <p className="text-sm text-muted-foreground">
                    Gérer les profils
                  </p>
                </motion.a>

                <motion.a
                  href="#/services"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                >
                  <Utensils className="w-8 h-8 text-accent mb-3" />
                  <h3 className="font-semibold mb-1">Services</h3>
                  <p className="text-sm text-muted-foreground">
                    Cantine, Gargote, Médical
                  </p>
                </motion.a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
