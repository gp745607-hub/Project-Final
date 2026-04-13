import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { useScanner } from '@/lib/scanner';
import { playSuccessBeep, playErrorBuzz } from '@/lib/audio';
import { formatDate, Pointage } from '@/lib/index';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { springPresets } from '@/lib/motion';

interface ScannerInterfaceProps {
  onScan: (codeBarre: string) => Promise<void>;
}

interface ScanHistory {
  codeBarre: string;
  timestamp: string;
  success: boolean;
  message?: string;
}

export function ScannerInterface({ onScan }: ScannerInterfaceProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanHistory | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanTimeRef = useRef<number>(0);
  const scanAnimationRef = useRef<NodeJS.Timeout | null>(null);

  const handleScanDetected = async (codeBarre: string) => {
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTimeRef.current;

    if (timeSinceLastScan < 1000) {
      return;
    }

    lastScanTimeRef.current = now;
    setIsScanning(true);
    setIsProcessing(true);

    if (scanAnimationRef.current) {
      clearTimeout(scanAnimationRef.current);
    }

    try {
      await onScan(codeBarre);
      
      const scanRecord: ScanHistory = {
        codeBarre,
        timestamp: new Date().toISOString(),
        success: true,
      };

      setLastScan(scanRecord);
      setScanHistory(prev => [scanRecord, ...prev].slice(0, 10));
      playSuccessBeep();
    } catch (error) {
      const scanRecord: ScanHistory = {
        codeBarre,
        timestamp: new Date().toISOString(),
        success: false,
        message: error instanceof Error ? error.message : 'Erreur de scan',
      };

      setLastScan(scanRecord);
      setScanHistory(prev => [scanRecord, ...prev].slice(0, 10));
      playErrorBuzz();
    } finally {
      setIsProcessing(false);
      scanAnimationRef.current = setTimeout(() => {
        setIsScanning(false);
      }, 2000);
    }
  };

  useScanner({
    onScan: handleScanDetected,
    minLength: 8,
    maxDelay: 40,
    enabled: !isProcessing,
  });

  const handleManualScan = async () => {
    if (!manualCode.trim() || isProcessing) return;

    await handleScanDetected(manualCode.trim());
    setManualCode('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualScan();
    }
  };

  useEffect(() => {
    return () => {
      if (scanAnimationRef.current) {
        clearTimeout(scanAnimationRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="flex flex-col items-center space-y-6">
          <motion.div
            className="relative"
            animate={{
              scale: isScanning ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.6,
              repeat: isScanning ? Infinity : 0,
            }}
          >
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: isScanning
                  ? lastScan?.success
                    ? 'linear-gradient(135deg, oklch(0.68 0.22 150) 0%, oklch(0.58 0.18 150) 100%)'
                    : 'linear-gradient(135deg, oklch(0.55 0.22 10) 0%, oklch(0.45 0.18 10) 100%)'
                  : 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 100%)',
                boxShadow: isScanning
                  ? lastScan?.success
                    ? '0 0 40px color-mix(in srgb, oklch(0.68 0.22 150) 50%, transparent), 0 8px 30px -6px color-mix(in srgb, oklch(0.68 0.22 150) 35%, transparent)'
                    : '0 0 40px color-mix(in srgb, oklch(0.55 0.22 10) 50%, transparent), 0 8px 30px -6px color-mix(in srgb, oklch(0.55 0.22 10) 35%, transparent)'
                  : '0 8px 30px -6px color-mix(in srgb, var(--primary) 35%, transparent)',
              }}
            >
              <AnimatePresence mode="wait">
                {isScanning ? (
                  lastScan?.success ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={springPresets.bouncy}
                    >
                      <CheckCircle2 className="w-16 h-16 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="error"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={springPresets.bouncy}
                    >
                      <XCircle className="w-16 h-16 text-white" />
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={springPresets.gentle}
                  >
                    <Scan className="w-16 h-16 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isScanning && (
              <motion.div
                className="absolute inset-0 rounded-full border-4"
                style={{
                  borderColor: lastScan?.success
                    ? 'oklch(0.68 0.22 150)'
                    : 'oklch(0.55 0.22 10)',
                }}
                initial={{ scale: 1, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
          </motion.div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Activity
                className={`w-5 h-5 ${
                  isProcessing ? 'text-primary animate-pulse' : 'text-muted-foreground'
                }`}
              />
              <h3 className="text-2xl font-semibold">
                {isProcessing
                  ? 'Traitement en cours...'
                  : isScanning
                  ? lastScan?.success
                    ? 'Scan réussi !'
                    : 'Erreur de scan'
                  : 'Scanner prêt'}
              </h3>
            </div>
            <p className="text-muted-foreground">
              {isProcessing
                ? 'Veuillez patienter'
                : 'Scannez un code-barres ou saisissez-le manuellement'}
            </p>
          </div>

          <AnimatePresence>
            {lastScan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={springPresets.gentle}
                className="w-full max-w-md p-4 rounded-lg"
                style={{
                  background: lastScan.success
                    ? 'color-mix(in srgb, oklch(0.68 0.22 150) 10%, transparent)'
                    : 'color-mix(in srgb, oklch(0.55 0.22 10) 10%, transparent)',
                  border: `1px solid ${
                    lastScan.success
                      ? 'color-mix(in srgb, oklch(0.68 0.22 150) 30%, transparent)'
                      : 'color-mix(in srgb, oklch(0.55 0.22 10) 30%, transparent)'
                  }`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {lastScan.success ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: 'oklch(0.68 0.22 150)' }} />
                    ) : (
                      <XCircle className="w-5 h-5" style={{ color: 'oklch(0.55 0.22 10)' }} />
                    )}
                    <div>
                      <p className="font-mono font-semibold">{lastScan.codeBarre}</p>
                      {lastScan.message && (
                        <p className="text-sm text-muted-foreground">{lastScan.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatDate(lastScan.timestamp, 'time')}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full max-w-md space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Saisie manuelle du code-barres"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="font-mono"
              />
              <Button
                onClick={handleManualScan}
                disabled={!manualCode.trim() || isProcessing}
              >
                Scanner
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historique des scans</h3>
            <Badge variant="secondary">{scanHistory.length} / 10</Badge>
          </div>

          {scanHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Scan className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun scan enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {scanHistory.map((scan, index) => (
                  <motion.div
                    key={`${scan.codeBarre}-${scan.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ ...springPresets.gentle, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{
                      background: scan.success
                        ? 'color-mix(in srgb, oklch(0.68 0.22 150) 5%, transparent)'
                        : 'color-mix(in srgb, oklch(0.55 0.22 10) 5%, transparent)',
                      borderColor: scan.success
                        ? 'color-mix(in srgb, oklch(0.68 0.22 150) 20%, transparent)'
                        : 'color-mix(in srgb, oklch(0.55 0.22 10) 20%, transparent)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {scan.success ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: 'oklch(0.68 0.22 150)' }} />
                      ) : (
                        <XCircle className="w-4 h-4" style={{ color: 'oklch(0.55 0.22 10)' }} />
                      )}
                      <div>
                        <p className="font-mono text-sm font-medium">{scan.codeBarre}</p>
                        {scan.message && (
                          <p className="text-xs text-muted-foreground">{scan.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(scan.timestamp, 'time')}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
