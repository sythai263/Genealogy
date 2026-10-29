/**
 * @project AncestorTree
 * @file src/components/export/pdf-export-card.tsx
 * @description Full genealogy PDF export card — cover + history + member
 *              biographies. The tree diagram section is exported from the
 *              /tree page instead, where the rendered SVG is available.
 *              jspdf/html2canvas load lazily on demand.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useClanSettings, useTreeData } from '@hooks';

export function PdfExportCard() {
  const t = useTranslations('Admin');
  const { data: treeData, isLoading: treeLoading } = useTreeData();
  const { data: clanSettings } = useClanSettings();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!treeData) return;
    setIsExporting(true);
    try {
      const { exportFullGiaPha } = await import('@lib/pdf-export');
      await exportFullGiaPha({
        containerElement: null,
        treeData,
        clanSettings: clanSettings ?? null,
        sectionOptions: {
          includeCover: true,
          includeHistory: true,
          includeTree: false,
          includeBiographies: true,
        },
      });
      toast.success(t('export.toasts.pdfSuccess'));
    } catch {
      toast.error(t('export.toasts.pdfError'));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileDown className='h-5 w-5' />
          {t('export.pdfTitle')}
        </CardTitle>
        <CardDescription>{t('export.pdfDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border p-3 text-sm space-y-1'>
          <p>
            <strong>{t('export.includesLabel')}</strong>{' '}
            {t('export.pdfIncludes')}
          </p>
          <p>
            <strong>{t('export.excludesLabel')}</strong>{' '}
            {t('export.pdfExcludes')}
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting || treeLoading || !treeData}>
          {isExporting ? (
            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
          ) : (
            <Download className='h-4 w-4 mr-2' />
          )}
          {t('export.exportPdf')}
        </Button>
      </CardContent>
    </Card>
  );
}
