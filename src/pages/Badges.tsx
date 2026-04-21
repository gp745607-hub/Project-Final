import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { BadgeGenerator } from '@/components/BadgeGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // CardHeader et CardTitle supprimés (inutilisés)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Printer, RefreshCw, Grid3x3, IdCard, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Beneficiaire } from '@/lib/index';
import { DB_KEYS, generateCodeBarre } from '@/lib/index';

export default function BadgesPage() {
  const { toast } = useToast();
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([]);
  const [selectedBeneficiaire, setSelectedBeneficiaire] = useState<Beneficiaire | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DB_KEYS.BENEFICIAIRES);
    setBeneficiaires(saved ? JSON.parse(saved) : []);
  }, []);

  const handleRegenerate = (b: Beneficiaire) => {
    const newCode = generateCodeBarre();
    const updated = beneficiaires.map(item => 
      item.id === b.id ? { ...item, codeBarre: newCode } : item
    );
    setBeneficiaires(updated);
    localStorage.setItem(DB_KEYS.BENEFICIAIRES, JSON.stringify(updated));
    toast({ 
      title: "Code mis à jour", 
      description: `Nouveau matricule généré pour ${b.prenom}.` 
    });
  };

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-2">
            <IdCard className="text-primary" size={32}/> Badges
          </h1>
          <Button 
            disabled={beneficiaires.length === 0} 
            className="rounded-2xl gap-2 shadow-lg"
          >
            <Grid3x3 size={18}/> Planche Complète
          </Button>
        </div>

        {beneficiaires.length === 0 ? (
          <Card className="border-dashed border-2 bg-slate-50/50 rounded-[2rem]">
            <CardContent className="py-20 text-center space-y-4">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <Search size={32}/>
              </div>
              <p className="text-slate-500 font-medium">
                Aucun bénéficiaire actif.<br/>
                Ajoutez-en un pour générer son badge.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {beneficiaires.filter(b => !b.archive).map(b => (
              <Card key={b.id} className="rounded-[2rem] border-none shadow-lg overflow-hidden group bg-white hover:shadow-2xl transition-all">
                <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-colors" />
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-20 w-20 mx-auto rounded-2xl bg-slate-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                    {b.photo ? (
                      <img 
                        src={b.photo} 
                        alt={`Badge de ${b.nom}`} 
                        title={`Aperçu : ${b.nom}`} // Accessibilité fixée
                        className="object-cover w-full h-full" 
                      />
                    ) : (
                      <IdCard className="h-10 w-10 text-slate-200" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-black text-lg uppercase leading-tight truncate">
                      {b.nom} {b.prenom}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {b.categorie}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl border font-mono text-xs font-bold text-primary">
                    {b.codeBarre}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      className="flex-1 rounded-xl" 
                      onClick={() => { setSelectedBeneficiaire(b); setShowBadgeDialog(true); }}
                    >
                      <Printer size={14}/>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="rounded-xl hover:text-orange-600" 
                      onClick={() => handleRegenerate(b)}
                    >
                      <RefreshCw size={14}/>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Impression du Badge</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedBeneficiaire && <BadgeGenerator beneficiaire={selectedBeneficiaire} />}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}