import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, Coffee, Heart, Scan, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScanner } from '@/lib/scanner';
import { playSuccessBeep, playErrorBuzz } from '@/lib/audio';
import { Service, Beneficiaire, formatDate, validateCodeBarre } from '@/lib/index';
import { useToast } from '@/hooks/use-toast';

interface ServiceModuleProps {
  serviceType: 'CANTINE' | 'GARGOTE' | 'MEDICAL';
}

const SERVICE_CONFIG = {
  CANTINE: {
    icon: UtensilsCrossed,
    label: 'Cantine',
    color: 'oklch(0.68 0.22 150)',
    description: 'Service de repas principal',
  },
  GARGOTE: {
    icon: Coffee,
    label: 'Gargote',
    color: 'oklch(0.62 0.22 220)',
    description: 'Service de collation',
  },
  MEDICAL: {
    icon: Heart,
    label: 'Médical',
    color: 'oklch(0.55 0.22 10)',
    description: 'Service de soins médicaux',
  },
};

export function ServiceModule({ serviceType }: ServiceModuleProps) {
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScan, setLastScan] = useState<{ code: string; time: Date; success: boolean } | null>(null);
  const [todayServices, setTodayServices] = useState<Service[]>([]);
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const { toast } = useToast();

  const config = SERVICE_CONFIG[serviceType];
  const Icon = config.icon;

  useEffect(() => {
    const mockBeneficiaires: Beneficiaire[] = [
      {
        id: '1',
        codeBarre: 'MADE1234567890',
        nom: 'Rakoto',
        prenom: 'Jean',
        dateNaissance: '2010-05-15',
        categorie: 'ENFANT',
        dateInscription: '2024-01-10',
        actif: true,
        archive: false,
      },
      {
        id: '2',
        codeBarre: 'MADE0987654321',
        nom: 'Rabe',
        prenom: 'Marie',
        dateNaissance: '2008-08-20',
        categorie: 'ADOLESCENT',
        dateInscription: '2024-02-15',
        actif: true,
        archive: false,
      },
    ];
    setBeneficiaires(mockBeneficiaires);

    const mockServices: Service[] = [
      {
        id: '1',
        beneficiaireId: '1',
        codeBarre: 'MADE1234567890',
        type: serviceType,
        timestamp: new Date().toISOString(),
        operateur: 'Made711@gmail.com',
      },
    ];
    setTodayServices(mockServices);
  }, [serviceType]);

  const processService = async (codeBarre: string) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (!validateCodeBarre(codeBarre)) {
        playErrorBuzz();
        setLastScan({ code: codeBarre, time: new Date(), success: false });
        toast({
          title: 'Code-barres invalide',
          description: `Le code "${codeBarre}" n'est pas au format valide.`,
          variant: 'destructive',
        });
        return;
      }

      const beneficiaire = beneficiaires.find(b => b.codeBarre === codeBarre && b.actif && !b.archive);

      if (!beneficiaire) {
        playErrorBuzz();
        setLastScan({ code: codeBarre, time: new Date(), success: false });
        toast({
          title: 'Bénéficiaire introuvable',
          description: `Aucun bénéficiaire actif avec le code "${codeBarre}".`,
          variant: 'destructive',
        });
        return;
      }

      const today = new Date().toDateString();
      const alreadyServed = todayServices.some(
        s => s.beneficiaireId === beneficiaire.id && 
             s.type === serviceType && 
             new Date(s.timestamp).toDateString() === today
      );

      if (alreadyServed) {
        playErrorBuzz();
        setLastScan({ code: codeBarre, time: new Date(), success: false });
        toast({
          title: 'Service déjà enregistré',
          description: `${beneficiaire.prenom} ${beneficiaire.nom} a déjà bénéficié du service ${config.label} aujourd'hui.`,
          variant: 'destructive',
        });
        return;
      }

      const newService: Service = {
        id: Date.now().toString(),
        beneficiaireId: beneficiaire.id,
        codeBarre: beneficiaire.codeBarre,
        type: serviceType,
        timestamp: new Date().toISOString(),
        operateur: 'Made711@gmail.com',
      };

      setTodayServices(prev => [newService, ...prev]);
      playSuccessBeep();
      setLastScan({ code: codeBarre, time: new Date(), success: true });

      toast({
        title: 'Service enregistré',
        description: `${config.label} enregistré pour ${beneficiaire.prenom} ${beneficiaire.nom}.`,
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  useScanner({
    onScan: processService,
    enabled: true,
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processService(manualCode.trim());
      setManualCode('');
    }
  };

  const todayCount = todayServices.filter(s => s.type === serviceType).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)` }}
              >
                <Icon className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div>
                <CardTitle className="text-2xl">{config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {todayCount} aujourd'hui
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
            <Scan className="w-5 h-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Scanner actif - Scannez un code-barres ou saisissez-le manuellement
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="Saisie manuelle du code-barres..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button type="submit" disabled={isProcessing || !manualCode.trim()}>
              Valider
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {lastScan && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Alert variant={lastScan.success ? 'default' : 'destructive'}>
                  {lastScan.success ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>
                        {lastScan.success ? 'Service enregistré' : 'Échec'} - Code: {lastScan.code}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(lastScan.time, 'time')}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historique du jour
          </CardTitle>
          <CardDescription>
            Services {config.label} enregistrés aujourd'hui
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Aucun service enregistré aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayServices.map((service) => {
                const beneficiaire = beneficiaires.find(b => b.id === service.beneficiaireId);
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {beneficiaire ? `${beneficiaire.prenom} ${beneficiaire.nom}` : 'Inconnu'}
                        </p>
                        <p className="text-sm text-muted-foreground">{service.codeBarre}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(service.timestamp, 'time')}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(service.timestamp, 'short')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
