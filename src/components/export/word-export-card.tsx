/**
 * @project AncestorTree
 * @file src/components/export/word-export-card.tsx
 * @description Full genealogy Word export card — cover + history + member
 *              biographies. word-export lib loads lazily on demand.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, FileType, Loader2 } from 'lucide-react';
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

export function WordExportCard() {
  const t = useTranslations('Admin');
  const { data: treeData, isLoading: treeLoading } = useTreeData();
  const { data: clanSettings } = useClanSettings();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (!treeData) return;
    setIsExporting(true);
    try {
      const { exportFullGiaPhaWord } = await import('@lib/word-export');
      await exportFullGiaPhaWord({
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
      toast.success(t('export.toasts.wordSuccess'));
    } catch {
      toast.error(t('export.toasts.wordError'));
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileType className='h-5 w-5' />
          {t('export.wordTitle')}
        </CardTitle>
        <CardDescription>{t('export.wordDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border p-3 text-sm space-y-1'>
          <p>
            <strong>{t('export.includesLabel')}</strong>{' '}
            {t('export.wordIncludes')}
          </p>
          <p>
            <strong>{t('export.excludesLabel')}</strong>{' '}
            {t('export.wordExcludes')}
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
          {t('export.exportWord')}
        </Button>
      </CardContent>
    </Card>
  );
}
