import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { AuditTable } from '@/components/AuditTable';
import { AuditLog, exportToCSV } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Search, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'CREATE',
    entity: 'BENEFICIAIRE',
    entityId: 'BEN001',
    utilisateur: 'Made711@gmail.com',
    details: { nom: 'Rakoto', prenom: 'Jean', categorie: 'ENFANT' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    action: 'SCAN',
    entity: 'POINTAGE',
    entityId: 'PT001',
    utilisateur: 'Made711@gmail.com',
    details: { codeBarre: 'MADE123ABC', type: 'ENTREE', scannerType: 'LASER' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    action: 'UPDATE',
    entity: 'BENEFICIAIRE',
    entityId: 'BEN002',
    utilisateur: 'Made711@gmail.com',
    details: { field: 'photo', oldValue: null, newValue: 'photo_url' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    action: 'SERVICE',
    entity: 'SERVICE',
    entityId: 'SRV001',
    utilisateur: 'Made711@gmail.com',
    details: { type: 'CANTINE', codeBarre: 'MADE456DEF' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 18000000).toISOString(),
    action: 'ARCHIVE',
    entity: 'BENEFICIAIRE',
    entityId: 'BEN003',
    utilisateur: 'Made711@gmail.com',
    details: { nom: 'Rabe', prenom: 'Marie', reason: 'Déménagement' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    action: 'EXPORT',
    entity: 'RAPPORT',
    entityId: 'RPT001',
    utilisateur: 'Made711@gmail.com',
    details: { format: 'PDF', type: 'MENSUEL', periode: '2026-03' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '7',
    timestamp: new Date(Date.now() - 25200000).toISOString(),
    action: 'DELETE',
    entity: 'POINTAGE',
    entityId: 'PT002',
    utilisateur: 'Made711@gmail.com',
    details: { codeBarre: 'MADE789GHI', reason: 'Erreur de scan' },
    ipAddress: '192.168.1.100'
  },
  {
    id: '8',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    action: 'RESTORE',
    entity: 'BENEFICIAIRE',
    entityId: 'BEN004',
    utilisateur: 'Made711@gmail.com',
    details: { nom: 'Andry', prenom: 'Paul' },
    ipAddress: '192.168.1.100'
  }
];

const actionLabels: Record<AuditLog['action'], string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  ARCHIVE: 'Archivage',
  RESTORE: 'Restauration',
  SCAN: 'Pointage',
  SERVICE: 'Service',
  EXPORT: 'Export'
};

const entityLabels: Record<AuditLog['entity'], string> = {
  BENEFICIAIRE: 'Bénéficiaire',
  POINTAGE: 'Pointage',
  SERVICE: 'Service',
  BADGE: 'Badge',
  RAPPORT: 'Rapport'
};

export default function Audit() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log => {
      const matchesSearch = 
        searchQuery === '' ||
        log.utilisateur.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;

      let matchesDate = true;
      if (dateFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateFilter === 'today') matchesDate = daysDiff === 0;
        else if (dateFilter === 'week') matchesDate = daysDiff <= 7;
        else if (dateFilter === 'month') matchesDate = daysDiff <= 30;
      }

      return matchesSearch && matchesAction && matchesEntity && matchesDate;
    });
  }, [searchQuery, actionFilter, entityFilter, dateFilter, mockAuditLogs]);

  const handleExportCSV = () => {
    const exportData = filteredLogs.map(log => ({
      Date: new Date(log.timestamp).toLocaleString('fr-FR'),
      Action: actionLabels[log.action],
      Entité: entityLabels[log.entity],
      'ID Entité': log.entityId,
      Utilisateur: log.utilisateur,
      Détails: JSON.stringify(log.details),
      'Adresse IP': log.ipAddress || 'N/A'
    }));
    exportToCSV(exportData, 'audit_logs');
  };

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const byAction = filteredLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, byAction };
  }, [filteredLogs]);

  return (
    <Layout>
      <div className="w-full min-h-screen bg-background">
        <div className="w-full px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Journal d'Audit</h1>
              <p className="text-muted-foreground text-lg">
                Traçabilité complète de toutes les actions effectuées dans le système
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Événements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Créations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-2">{stats.byAction.CREATE || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Modifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-3">{stats.byAction.UPDATE || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pointages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1">{stats.byAction.SCAN || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres et Recherche
                </CardTitle>
                <CardDescription>
                  Affinez les résultats du journal d'audit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les actions</SelectItem>
                      {Object.entries(actionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Entité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les entités</SelectItem>
                      {Object.entries(entityLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les dates</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">7 derniers jours</SelectItem>
                      <SelectItem value="month">30 derniers jours</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button onClick={handleExportCSV} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique des Événements</CardTitle>
                <CardDescription>
                  {filteredLogs.length} événement{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuditTable logs={filteredLogs} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
