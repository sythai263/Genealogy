/**
 * @project AncestorTree
 * @file src/components/export/markdown-export-card.tsx
 * @description Markdown export card — includes info + export button
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Download, FileCode } from 'lucide-react';
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
import { downloadMarkdown, generateMarkdown } from '@lib';

export function MarkdownExportCard() {
  const t = useTranslations('Admin');
  const { data: treeData, isLoading: treeLoading } = useTreeData();

  function handleExport() {
    if (!treeData) return;
    try {
      const md = generateMarkdown(treeData);
      downloadMarkdown(md);
      toast.success(t('export.toasts.markdownSuccess'));
    } catch {
      toast.error(t('export.toasts.markdownError'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileCode className='h-5 w-5' />
          {t('export.markdownTitle')}
        </CardTitle>
        <CardDescription>{t('export.markdownDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='rounded-md border p-3 text-sm space-y-1'>
          <p>
            <strong>{t('export.includesLabel')}</strong>{' '}
            {t('export.markdownIncludes')}
          </p>
          <p>
            <strong>{t('export.markdownSortLabel')}</strong>{' '}
            {t('export.markdownSort')}
          </p>
          <p>
            <strong>{t('export.markdownFormatLabel')}</strong>{' '}
            {t('export.markdownFormat')}
          </p>
        </div>
        <Button onClick={handleExport} disabled={treeLoading || !treeData}>
          <Download className='h-4 w-4 mr-2' />
          {t('export.exportMarkdown')}
        </Button>
      </CardContent>
    </Card>
  );
}
