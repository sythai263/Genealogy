/**
 * @project AncestorTree
 * @file src/components/export/admin-export-view.tsx
 * @description Admin page for data export (GEDCOM 7.0, CSV, Markdown, PDF,
 *              Word) — composes per-format export cards; each card owns its
 *              own export logic
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
import { CsvExportCard } from './csv-export-card';
import { GedcomExportCard } from './gedcom-export-card';
import { MarkdownExportCard } from './markdown-export-card';
import { PdfExportCard } from './pdf-export-card';
import { WordExportCard } from './word-export-card';

export function AdminExportView() {
  const t = useTranslations('Admin');
  const { isEditor } = useAuth();

  if (!isEditor) {
    return <AccessDenied />;
  }

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>{t('export.title')}</h1>
        <p className='text-muted-foreground'>{t('export.subtitle')}</p>
      </div>

      <GedcomExportCard />
      <CsvExportCard />
      <MarkdownExportCard />
      <PdfExportCard />
      <WordExportCard />
    </div>
  );
}
