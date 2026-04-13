import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, FileText, Database, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/index';
import type { Beneficiaire, Pointage, Service, AuditLog } from '@/lib/index';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportButtonsProps {
  data: any;
  type: 'beneficiaires' | 'pointages' | 'services' | 'audit';
}

export function ExportButtons({ data, type }: ExportButtonsProps) {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const { toast } = useToast();

  const handleExportExcel = async () => {
    setLoadingExcel(true);
    try {
      let excelData: any[] = [];
      let filename = '';

      switch (type) {
        case 'beneficiaires':
          excelData = (data as Beneficiaire[]).map(b => ({
            'Code-barres': b.codeBarre,
            'Nom': b.nom,
            'Prénom': b.prenom,
            'Date de naissance': formatDate(b.dateNaissance),
            'Catégorie': b.categorie,
            'Date inscription': formatDate(b.dateInscription),
            'Statut': b.actif ? 'Actif' : 'Inactif',
            'Archivé': b.archive ? 'Oui' : 'Non',
            'Notes': b.notes || ''
          }));
          filename = 'beneficiaires';
          break;

        case 'pointages':
          excelData = (data as Pointage[]).map(p => ({
            'Code-barres': p.codeBarre,
            'Type': p.type,
            'Date et heure': formatDate(p.timestamp, 'long'),
            'Scanner': p.scannerType,
            'Opérateur': p.operateur || 'Automatique'
          }));
          filename = 'pointages';
          break;

        case 'services':
          excelData = (data as Service[]).map(s => ({
            'Code-barres': s.codeBarre,
            'Service': s.type,
            'Date et heure': formatDate(s.timestamp, 'long'),
            'Opérateur': s.operateur || 'Automatique',
            'Notes': s.notes || ''
          }));
          filename = 'services';
          break;

        case 'audit':
          excelData = (data as AuditLog[]).map(a => ({
            'Date et heure': formatDate(a.timestamp, 'long'),
            'Action': a.action,
            'Entité': a.entity,
            'ID Entité': a.entityId,
            'Utilisateur': a.utilisateur,
            'Détails': JSON.stringify(a.details),
            'Adresse IP': a.ipAddress || ''
          }));
          filename = 'audit';
          break;
      }

      // Créer le workbook
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, filename);

      // Ajuster la largeur des colonnes
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Télécharger le fichier
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`);

      toast({
        title: '✅ Export Excel réussi',
        description: `Le fichier ${filename}.xlsx a été téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur export Excel:', error);
      toast({
        title: '❌ Erreur d\'export',
        description: 'Une erreur est survenue lors de l\'export Excel.',
        variant: 'destructive',
      });
    } finally {
      setLoadingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setLoadingPDF(true);
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('fr-FR');
      
      // En-tête
      doc.setFontSize(18);
      doc.text('ONG MADE', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('Madagascar Assistance & Development Emergency', 105, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Rapport généré le ${dateStr}`, 105, 28, { align: 'center' });

      let tableData: any[] = [];
      let columns: any[] = [];
      let title = '';

      switch (type) {
        case 'beneficiaires':
          title = 'Liste des Bénéficiaires';
          columns = [
            { header: 'Code-barres', dataKey: 'codeBarre' },
            { header: 'Nom', dataKey: 'nom' },
            { header: 'Prénom', dataKey: 'prenom' },
            { header: 'Catégorie', dataKey: 'categorie' },
            { header: 'Date inscription', dataKey: 'dateInscription' },
          ];
          tableData = (data as Beneficiaire[]).map(b => ({
            codeBarre: b.codeBarre,
            nom: b.nom,
            prenom: b.prenom,
            categorie: b.categorie,
            dateInscription: formatDate(b.dateInscription),
          }));
          break;

        case 'pointages':
          title = 'Historique des Pointages';
          columns = [
            { header: 'Code-barres', dataKey: 'codeBarre' },
            { header: 'Type', dataKey: 'type' },
            { header: 'Date et heure', dataKey: 'timestamp' },
            { header: 'Scanner', dataKey: 'scannerType' },
          ];
          tableData = (data as Pointage[]).map(p => ({
            codeBarre: p.codeBarre,
            type: p.type,
            timestamp: formatDate(p.timestamp, 'long'),
            scannerType: p.scannerType,
          }));
          break;

        case 'services':
          title = 'Historique des Services';
          columns = [
            { header: 'Code-barres', dataKey: 'codeBarre' },
            { header: 'Service', dataKey: 'type' },
            { header: 'Date et heure', dataKey: 'timestamp' },
            { header: 'Notes', dataKey: 'notes' },
          ];
          tableData = (data as Service[]).map(s => ({
            codeBarre: s.codeBarre,
            type: s.type,
            timestamp: formatDate(s.timestamp, 'long'),
            notes: s.notes || '-',
          }));
          break;

        case 'audit':
          title = 'Journal d\'Audit';
          columns = [
            { header: 'Date', dataKey: 'timestamp' },
            { header: 'Action', dataKey: 'action' },
            { header: 'Entité', dataKey: 'entity' },
            { header: 'Utilisateur', dataKey: 'utilisateur' },
          ];
          tableData = (data as AuditLog[]).map(a => ({
            timestamp: formatDate(a.timestamp, 'long'),
            action: a.action,
            entity: a.entity,
            utilisateur: a.utilisateur,
          }));
          break;
      }

      // Titre du rapport
      doc.setFontSize(14);
      doc.text(title, 14, 40);

      // Tableau
      autoTable(doc, {
        startY: 45,
        head: [columns.map(col => col.header)],
        body: tableData.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 45, left: 14, right: 14 },
      });

      // Pied de page
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} sur ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Télécharger
      const filename = `rapport_${type}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast({
        title: '✅ Export PDF réussi',
        description: `Le rapport PDF a été téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        title: '❌ Erreur d\'export',
        description: 'Une erreur est survenue lors de l\'export PDF.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  const handleBackup = async () => {
    setLoadingBackup(true);
    try {
      const backupData = {
        type,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data,
        metadata: {
          totalRecords: Array.isArray(data) ? data.length : 1,
          exportedBy: 'Made711@gmail.com',
        }
      };

      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `backup_${type}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: '✅ Sauvegarde réussie',
        description: `Le fichier de sauvegarde JSON a été téléchargé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: '❌ Erreur de sauvegarde',
        description: 'Une erreur est survenue lors de la création de la sauvegarde.',
        variant: 'destructive',
      });
    } finally {
      setLoadingBackup(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={handleExportExcel}
        disabled={loadingExcel || !data || (Array.isArray(data) && data.length === 0)}
        className="gap-2"
        variant="default"
      >
        {loadingExcel ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Exporter Excel
      </Button>

      <Button
        onClick={handleExportPDF}
        disabled={loadingPDF || !data || (Array.isArray(data) && data.length === 0)}
        className="gap-2"
        variant="outline"
      >
        {loadingPDF ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Exporter PDF
      </Button>

      <Button
        onClick={handleBackup}
        disabled={loadingBackup || !data || (Array.isArray(data) && data.length === 0)}
        className="gap-2"
        variant="outline"
      >
        {loadingBackup ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        Sauvegarde JSON
      </Button>
    </div>
  );
}
