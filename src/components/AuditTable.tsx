import { useState, useMemo } from 'react';
import { AuditLog, formatDate, exportToCSV } from '@/lib/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Search, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditTableProps {
  logs: AuditLog[];
}

const ACTION_LABELS: Record<AuditLog['action'], string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  ARCHIVE: 'Archivage',
  RESTORE: 'Restauration',
  SCAN: 'Scan',
  SERVICE: 'Service',
  EXPORT: 'Export',
};

const ACTION_COLORS: Record<AuditLog['action'], string> = {
  CREATE: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  UPDATE: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  DELETE: 'bg-destructive/10 text-destructive border-destructive/20',
  ARCHIVE: 'bg-muted text-muted-foreground border-border',
  RESTORE: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  SCAN: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
  SERVICE: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  EXPORT: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
};

const ENTITY_LABELS: Record<AuditLog['entity'], string> = {
  BENEFICIAIRE: 'Bénéficiaire',
  POINTAGE: 'Pointage',
  SERVICE: 'Service',
  BADGE: 'Badge',
  RAPPORT: 'Rapport',
};

export function AuditTable({ logs }: AuditTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const itemsPerPage = 20;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        searchTerm === '' ||
        log.utilisateur.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchTerm, actionFilter, entityFilter]);

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredLogs]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLogs, currentPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExportCSV = () => {
    const exportData = sortedLogs.map((log) => ({
      Date: formatDate(log.timestamp, 'long'),
      Action: ACTION_LABELS[log.action],
      Entité: ENTITY_LABELS[log.entity],
      'ID Cible': log.entityId,
      Utilisateur: log.utilisateur,
      'Adresse IP': log.ipAddress || 'N/A',
      Détails: JSON.stringify(log.details),
    }));
    exportToCSV(exportData, 'journal_audit');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par utilisateur, ID ou détails..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes actions</SelectItem>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Entité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes entités</SelectItem>
              {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleExportCSV} variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entité</TableHead>
              <TableHead>ID Cible</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Aucun log trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedLogs.map((log) => {
                const isExpanded = expandedRows.has(log.id);
                return (
                  <Collapsible key={log.id} open={isExpanded} onOpenChange={() => toggleRow(log.id)}>
                    <TableRow className="group">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </motion.div>
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatDate(log.timestamp, 'long')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ACTION_COLORS[log.action]}>
                          {ACTION_LABELS[log.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{ENTITY_LABELS[log.entity]}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.entityId}
                      </TableCell>
                      <TableCell className="text-sm">{log.utilisateur}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="py-4 px-6"
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold text-foreground">Détails :</h4>
                              <pre className="text-xs bg-background rounded-md p-4 overflow-x-auto border">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * itemsPerPage + 1} à{' '}
            {Math.min(currentPage * itemsPerPage, sortedLogs.length)} sur {sortedLogs.length} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}