/**
 * @project AncestorTree
 * @file src/components/export/csv-export-card.tsx
 * @description CSV export card — includes/excludes info + export button
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Download, Table } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useTreeData } from '@hooks';
import { downloadCsv, generateCsv } from '@lib';

export function CsvExportCard() {
  const t = useTranslations('Admin');
  const { data: treeData, isLoading: treeLoading } = useTreeData();

  function handleExport() {
    if (!treeData) return;
    try {
      const csv = generateCsv(treeData);
      downloadCsv(csv);
      toast.success(t('export.toasts.csvSuccess'));
    } catch {
      toast.error(t('export.toasts.csvError'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Table className='h-5 w-5' />
          {t('export.csvTitle')}
        </CardTitle>
        <CardDescription>{t('export.csvDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border p-3 text-sm space-y-1'>
          <p>
            <strong>{t('export.includesLabel')}</strong>{' '}
            {t('export.csvIncludes')}
          </p>
          <p>
            <strong>{t('export.excludesLabel')}</strong>{' '}
            {t('export.csvExcludes')}
          </p>
          <p>
            <strong>{t('export.csvEncodingLabel')}</strong>{' '}
            {t('export.csvEncoding')}
          </p>
        </div>
        <Button onClick={handleExport} disabled={treeLoading || !treeData}>
          <Download className='h-4 w-4 mr-2' />
          {t('export.exportCsv')}
        </Button>
      </CardContent>
    </Card>
  );
}
