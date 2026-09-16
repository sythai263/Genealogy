/**
 * @project AncestorTree
 * @file src/components/export/admin-export-view.tsx
 * @description Admin page for data export (GEDCOM 7.0, CSV, Markdown)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@components/ui';
import { useClanSettings, useTreeData } from '@hooks';
import {
    downloadCsv,
    downloadGedcom,
    downloadMarkdown,
    generateCsv,
    generateGedcom,
    generateMarkdown,
    validateGedcom,
} from '@lib';
import {
    AlertCircle,
    CheckCircle,
    Download,
    FileCode,
    FileDown,
    FileText,
    FileType,
    GitBranchPlus,
    Loader2,
    Table,
    Users
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface ExportPreview {
  content: string;
  valid: boolean;
  errors: string[];
  indiCount: number;
  famCount: number;
}

export function AdminExportView() {
  const t = useTranslations('Admin');
  const { isEditor } = useAuth();
  const { data: treeData, isLoading: treeLoading } = useTreeData();
  const { data: clanSettings } = useClanSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);

  if (!isEditor) {
    return <AccessDenied />;
  }

  function handlePreview() {
    if (!treeData) return;
    const content = generateGedcom(treeData);
    const validation = validateGedcom(content);
    const indiCount = (content.match(/^0 @I[^@]+@ INDI$/gm) || []).length;
    const famCount = (content.match(/^0 @F[^@]+@ FAM$/gm) || []).length;
    setPreview({
      content,
      valid: validation.valid,
      errors: validation.errors,
      indiCount,
      famCount,
    });
  }

  function handleExport() {
    if (!treeData) return;
    setIsExporting(true);
    try {
      const content = preview?.content || generateGedcom(treeData);
      downloadGedcom(content);
      toast.success(t('export.toasts.gedcomSuccess'));
    } catch {
      toast.error(t('export.toasts.gedcomError'));
    } finally {
      setIsExporting(false);
    }
  }

  function handleExportCsv() {
    if (!treeData) return;
    try {
      const csv = generateCsv(treeData);
      downloadCsv(csv);
      toast.success(t('export.toasts.csvSuccess'));
    } catch {
      toast.error(t('export.toasts.csvError'));
    }
  }

  function handleExportMarkdown() {
    if (!treeData) return;
    try {
      const md = generateMarkdown(treeData);
      downloadMarkdown(md);
      toast.success(t('export.toasts.markdownSuccess'));
    } catch {
      toast.error(t('export.toasts.markdownError'));
    }
  }

  /**
   * Full genealogy PDF — cover + history + member biographies.
   * The tree diagram section is exported from the /tree page instead, where
   * the rendered SVG is available. jspdf/html2canvas load lazily on demand.
   */
  async function handleExportPdf() {
    if (!treeData) return;
    setIsExportingPdf(true);
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
      setIsExportingPdf(false);
    }
  }

  async function handleExportWord() {
    if (!treeData) return;
    setIsExportingWord(true);
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
      setIsExportingWord(false);
    }
  }

  const peopleCount =
    treeData?.people.filter(p => p.privacy_level !== 2).length || 0;
  const familyCount = treeData?.families.length || 0;

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>{t('export.title')}</h1>
        <p className='text-muted-foreground'>{t('export.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            {t('export.gedcomTitle')}
          </CardTitle>
          <CardDescription>{t('export.gedcomDesc')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Stats */}
          <div className='flex gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span>
                {treeLoading
                  ? '...'
                  : t('export.peopleCount', { count: peopleCount })}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <GitBranchPlus className='h-4 w-4 text-muted-foreground' />
              <span>
                {treeLoading
                  ? '...'
                  : t('export.familyCount', { count: familyCount })}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className='rounded-md border p-3 text-sm space-y-1'>
            <p>
              <strong>{t('export.includesLabel')}</strong>{' '}
              {t('export.gedcomIncludes')}
            </p>
            <p>
              <strong>{t('export.excludesLabel')}</strong>{' '}
              {t('export.gedcomExcludes')}
            </p>
            <p>
              <strong>{t('export.gedcomFilterLabel')}</strong>{' '}
              {t('export.gedcomFilter')}
            </p>
            <p>
              <strong>{t('export.gedcomExtensionsLabel')}</strong>{' '}
              {t('export.gedcomExtensions')}
            </p>
          </div>

          {/* Preview result */}
          {preview && (
            <div className='rounded-md border p-3 space-y-2'>
              <div className='flex items-center gap-2'>
                {preview.valid ? (
                  <CheckCircle className='h-4 w-4 text-green-600' />
                ) : (
                  <AlertCircle className='h-4 w-4 text-red-600' />
                )}
                <span className='text-sm font-medium'>
                  {preview.valid
                    ? t('export.fileValid')
                    : t('export.errorCount', { count: preview.errors.length })}
                </span>
                <Badge variant='outline'>{preview.indiCount} INDI</Badge>
                <Badge variant='outline'>{preview.famCount} FAM</Badge>
                <Badge variant='outline'>
                  {(preview.content.length / 1024).toFixed(1)} KB
                </Badge>
              </div>
              {!preview.valid && (
                <ul className='text-xs text-red-600 space-y-1'>
                  {preview.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={handlePreview}
              disabled={treeLoading || !treeData}>
              {t('export.preview')}
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || treeLoading || !treeData}>
              {isExporting ? (
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              ) : (
                <Download className='h-4 w-4 mr-2' />
              )}
              {t('export.exportGedcom')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Export */}
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
          <Button
            onClick={handleExportCsv}
            disabled={treeLoading || !treeData}>
            <Download className='h-4 w-4 mr-2' />
            {t('export.exportCsv')}
          </Button>
        </CardContent>
      </Card>

      {/* Markdown Export */}
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
          <Button
            onClick={handleExportMarkdown}
            disabled={treeLoading || !treeData}>
            <Download className='h-4 w-4 mr-2' />
            {t('export.exportMarkdown')}
          </Button>
        </CardContent>
      </Card>

      {/* PDF Export */}
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
            onClick={handleExportPdf}
            disabled={isExportingPdf || treeLoading || !treeData}>
            {isExportingPdf ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Download className='h-4 w-4 mr-2' />
            )}
            {t('export.exportPdf')}
          </Button>
        </CardContent>
      </Card>

      {/* Word Export */}
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
            onClick={handleExportWord}
            disabled={isExportingWord || treeLoading || !treeData}>
            {isExportingWord ? (
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <Download className='h-4 w-4 mr-2' />
            )}
            {t('export.exportWord')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
