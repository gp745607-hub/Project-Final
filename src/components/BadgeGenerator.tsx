import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Beneficiaire, getCategorieLabel, getCategorieColor, formatDate } from '@/lib/index';
import bwipjs from 'bwip-js';

interface BadgeGeneratorProps {
  beneficiaire: Beneficiaire;
}

export function BadgeGenerator({ beneficiaire }: BadgeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewBarcodeRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');
  const { toast } = useToast();

  // Générer le code-barres pour l'aperçu
  useEffect(() => {
    if (previewBarcodeRef.current) {
      try {
        bwipjs.toCanvas(previewBarcodeRef.current, {
          bcid: 'code128',
          text: beneficiaire.codeBarre,
          scale: 2,
          height: 10,
          includetext: false,
          textxalign: 'center',
        });
      } catch (error) {
        console.error('Erreur génération code-barres aperçu:', error);
      }
    }
  }, [beneficiaire.codeBarre]);

  const generateBarcodeImage = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const tempCanvas = document.createElement('canvas');
      try {
        bwipjs.toCanvas(tempCanvas, {
          bcid: 'code128',
          text: beneficiaire.codeBarre,
          scale: 3,
          height: 15,
          includetext: false,
          textxalign: 'center',
        });
        resolve(tempCanvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    });
  };

  const generateBadgeCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Dimensions haute résolution pour impression (300 DPI)
    const dpi = 300;
    const widthMM = 85.6;
    const heightMM = 54;
    const widthPx = Math.floor((widthMM / 25.4) * dpi);
    const heightPx = Math.floor((heightMM / 25.4) * dpi);

    canvas.width = widthPx;
    canvas.height = heightPx;

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, widthPx, heightPx);

    // En-tête coloré
    const headerHeight = heightPx * 0.25;
    const categorieColor = getCategorieColor(beneficiaire.categorie);
    ctx.fillStyle = categorieColor;
    ctx.fillRect(0, 0, widthPx, headerHeight);

    // Texte en-tête
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(dpi * 0.18)}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ONG MADE', widthPx / 2, headerHeight * 0.4);
    ctx.font = `${Math.floor(dpi * 0.12)}px Inter, Arial, sans-serif`;
    ctx.fillText('Madagascar Assistance & Development', widthPx / 2, headerHeight * 0.7);

    // Photo (si disponible)
    if (beneficiaire.photo) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load photo'));
          img.src = beneficiaire.photo!;
        });

        const photoSize = heightPx * 0.35;
        const photoX = widthPx * 0.08;
        const photoY = headerHeight + (heightPx - headerHeight - photoSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        ctx.restore();

        ctx.strokeStyle = categorieColor;
        ctx.lineWidth = dpi * 0.02;
        ctx.beginPath();
        ctx.arc(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2, 0, Math.PI * 2);
        ctx.stroke();
      } catch (error) {
        console.error('Failed to load photo:', error);
      }
    }

    // Informations texte
    const textStartX = widthPx * 0.45;
    const textStartY = headerHeight + heightPx * 0.15;

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.floor(dpi * 0.16)}px Inter, Arial, sans-serif`;
    ctx.fillText(`${beneficiaire.prenom}`, textStartX, textStartY);
    ctx.fillText(`${beneficiaire.nom}`, textStartX, textStartY + dpi * 0.2);

    ctx.font = `${Math.floor(dpi * 0.11)}px Inter, Arial, sans-serif`;
    ctx.fillStyle = '#666666';
    ctx.fillText(getCategorieLabel(beneficiaire.categorie), textStartX, textStartY + dpi * 0.38);

    // Code-barres Code 128 (haute résolution)
    try {
      const barcodeDataUrl = await generateBarcodeImage();
      const barcodeImg = new Image();
      await new Promise<void>((resolve, reject) => {
        barcodeImg.onload = () => resolve();
        barcodeImg.onerror = () => reject(new Error('Failed to load barcode'));
        barcodeImg.src = barcodeDataUrl;
      });

      const barcodeY = heightPx * 0.75;
      const barcodeHeight = heightPx * 0.15;
      const barcodeWidth = widthPx * 0.85;
      const barcodeX = (widthPx - barcodeWidth) / 2;

      ctx.drawImage(barcodeImg, barcodeX, barcodeY, barcodeWidth, barcodeHeight);

      // Texte du code-barres
      ctx.font = `${Math.floor(dpi * 0.09)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(beneficiaire.codeBarre, widthPx / 2, barcodeY + barcodeHeight + dpi * 0.12);
    } catch (error) {
      console.error('Failed to generate barcode:', error);
      // Fallback: afficher juste le texte
      ctx.font = `${Math.floor(dpi * 0.12)}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000000';
      ctx.fillText(beneficiaire.codeBarre, widthPx / 2, heightPx * 0.85);
    }

    // Bordure
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = dpi * 0.01;
    ctx.strokeRect(0, 0, widthPx, heightPx);

    return canvas;
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateBadgeCanvas();
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `badge_${beneficiaire.nom}_${beneficiaire.prenom}_${beneficiaire.codeBarre}.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: '✅ Badge téléchargé',
        description: `Badge de ${beneficiaire.prenom} ${beneficiaire.nom} téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur génération badge:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible de générer le badge.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const canvas = await generateBadgeCanvas();
      const dataUrl = canvas.toDataURL('image/png', 1.0);

      const printWindow = window.open('', '_blank');
      if (!printWindow) throw new Error('Popup blocked');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Badge - ${beneficiaire.prenom} ${beneficiaire.nom}</title>
            <style>
              @page { size: 85.6mm 54mm; margin: 0; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { width: 85.6mm; height: 54mm; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Badge" />
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      toast({
        title: '🖨️ Impression lancée',
        description: 'Fenêtre d\'impression ouverte.',
      });
    } catch (error) {
      console.error('Erreur impression badge:', error);
      toast({
        title: '❌ Erreur',
        description: 'Impossible d\'imprimer le badge.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Aperçu du badge</h3>
            <p className="text-sm text-muted-foreground">
              {beneficiaire.prenom} {beneficiaire.nom} - {getCategorieLabel(beneficiaire.categorie)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="default"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
            <Button
              onClick={handlePrint}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center"
        >
          <div
            className="relative bg-white rounded-lg shadow-lg overflow-hidden"
            style={{
              width: '428px',
              height: '270px',
              border: '2px solid #e5e7eb',
            }}
          >
            <div
              className="absolute inset-x-0 top-0 h-16 flex flex-col items-center justify-center text-white"
              style={{ backgroundColor: getCategorieColor(beneficiaire.categorie) }}
            >
              <div className="text-lg font-bold">ONG MADE</div>
              <div className="text-xs">Madagascar Assistance & Development</div>
            </div>

            <div className="absolute left-6 top-20 flex items-center gap-4">
              {beneficiaire.photo ? (
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-4"
                  style={{ borderColor: getCategorieColor(beneficiaire.categorie) }}
                >
                  <img
                    src={beneficiaire.photo}
                    alt={`${beneficiaire.prenom} ${beneficiaire.nom}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center border-4 bg-muted"
                  style={{ borderColor: getCategorieColor(beneficiaire.categorie) }}
                >
                  <QrCode className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              <div className="space-y-1">
                <div className="text-xl font-bold">{beneficiaire.prenom}</div>
                <div className="text-xl font-bold">{beneficiaire.nom}</div>
                <div className="text-sm text-muted-foreground">
                  {getCategorieLabel(beneficiaire.categorie)}
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center">
              <canvas ref={previewBarcodeRef} className="mb-2" />
              <div className="text-xs font-mono">{beneficiaire.codeBarre}</div>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Date d'inscription:</span>
            <span className="ml-2 font-medium">{formatDate(beneficiaire.dateInscription)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Code-barres:</span>
            <span className="ml-2 font-mono font-medium">{beneficiaire.codeBarre}</span>
          </div>
        </div>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
