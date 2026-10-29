/**
 * @project AncestorTree
 * @file src/components/export/gedcom-export-card.tsx
 * @description GEDCOM 7.0 export card — stats, includes/excludes info,
 *              preview validation, export button
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  CheckCircle,
  Download,
  FileText,
  GitBranchPlus,
  Loader2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useTreeData } from '@hooks';
import {
  downloadGedcom,
  generateGedcom,
  validateGedcom,
} from '@lib';

interface ExportPreview {
  content: string;
  valid: boolean;
  errors: string[];
  indiCount: number;
  famCount: number;
}

export function GedcomExportCard() {
  const t = useTranslations('Admin');
  const { data: treeData, isLoading: treeLoading } = useTreeData();
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState<ExportPreview | null>(null);

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

  const peopleCount =
    treeData?.people.filter(p => p.privacy_level !== 2).length || 0;
  const familyCount = treeData?.families.length || 0;

  return (
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
  );
}
