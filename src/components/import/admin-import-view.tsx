/**
 * @project AncestorTree
 * @file src/components/import/admin-import-view.tsx
 * @description Admin GEDCOM import wizard — upload + preview (DB insert planned for future sprint)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { GEDCOM_IMPORT_MAX_BYTES } from '@constants';
import { useTreeData } from '@hooks';
import { prepareImport, type ImportSummary } from '@lib';
import { AccessDenied } from '@components/shared';

type Step = 'upload' | 'preview';

export function AdminImportView() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const { isEditor } = useAuth();
  const { data: treeData } = useTreeData();
  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.ged')) {
        toast.error(t('import.toasts.invalidFile'));
        return;
      }

      if (file.size > GEDCOM_IMPORT_MAX_BYTES) {
        toast.error(t('import.toasts.tooLarge'));
        return;
      }

      setIsProcessing(true);
      setFileName(file.name);

      try {
        const content = await file.text();
        const result = prepareImport(content, treeData || undefined);
        setSummary(result);
        setStep('preview');
      } catch {
        toast.error(t('import.toasts.readError'));
      } finally {
        setIsProcessing(false);
      }
    },
    [treeData, t]
  );

  if (!isEditor) {
    return <AccessDenied />;
  }

  // Prototype: DB insert not yet implemented (XL effort — planned for future sprint)
  const isImportReady = false;

  function handleReset() {
    setStep('upload');
    setSummary(null);
    setFileName('');
  }

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>{t('import.title')}</h1>
        <p className='text-muted-foreground'>{t('import.subtitle')}</p>
      </div>

      {/* Step indicator */}
      <div className='flex items-center gap-2 text-sm'>
        <Badge variant={step === 'upload' ? 'default' : 'outline'}>
          {t('import.stepUpload')}
        </Badge>
        <ArrowRight className='h-3 w-3 text-muted-foreground' />
        <Badge variant={step === 'preview' ? 'default' : 'outline'}>
          {t('import.stepPreview')}
        </Badge>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              {t('import.selectGedcom')}
            </CardTitle>
            <CardDescription>{t('import.supportedFormats')}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='border-2 border-dashed rounded-lg p-8 text-center'>
              <FileText className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
              <label className='cursor-pointer'>
                <input
                  type='file'
                  accept='.ged'
                  onChange={handleFileUpload}
                  className='hidden'
                  disabled={isProcessing}
                />
                <Button variant='outline' asChild disabled={isProcessing}>
                  <span>
                    {isProcessing ? (
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    ) : (
                      <Upload className='h-4 w-4 mr-2' />
                    )}
                    {isProcessing
                      ? t('import.processing')
                      : t('import.selectFile')}
                  </span>
                </Button>
              </label>
              <p className='text-xs text-muted-foreground mt-2'>
                {t('import.maxSize')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && summary && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              {t('import.previewTitle', { fileName })}
            </CardTitle>
            <CardDescription>
              GEDCOM {summary.parseResult.header.version}
              {summary.parseResult.header.source
                ? t('import.source', {
                    source: summary.parseResult.header.source,
                  })
                : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='rounded-md border p-3 text-center'>
                <p className='text-2xl font-bold'>
                  {summary.validation.stats.individualCount}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('import.statsIndividuals')}
                </p>
              </div>
              <div className='rounded-md border p-3 text-center'>
                <p className='text-2xl font-bold'>
                  {summary.validation.stats.familyCount}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('import.statsFamilies')}
                </p>
              </div>
              <div className='rounded-md border p-3 text-center'>
                <p className='text-2xl font-bold'>
                  {summary.validation.stats.duplicateCount}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('import.statsDuplicates')}
                </p>
              </div>
            </div>

            {/* Errors */}
            {summary.validation.errors.length > 0 && (
              <div className='rounded-md border border-red-200 bg-red-50 p-3 space-y-1'>
                <div className='flex items-center gap-1.5 text-red-700 font-medium text-sm'>
                  <AlertCircle className='h-4 w-4' />
                  {t('import.errorsCount', {
                    count: summary.validation.errors.length,
                  })}
                </div>
                <ul className='text-xs text-red-600 space-y-0.5 ml-6'>
                  {summary.validation.errors
                    .slice(0, 10)
                    .map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  {summary.validation.errors.length > 10 && (
                    <li>
                      {t('import.moreErrors', {
                        count: summary.validation.errors.length - 10,
                      })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {summary.validation.warnings.length > 0 && (
              <div className='rounded-md border border-amber-200 bg-amber-50 p-3 space-y-1'>
                <div className='flex items-center gap-1.5 text-amber-700 font-medium text-sm'>
                  <AlertTriangle className='h-4 w-4' />
                  {t('import.warningsCount', {
                    count: summary.validation.warnings.length,
                  })}
                </div>
                <ul className='text-xs text-amber-600 space-y-0.5 ml-6'>
                  {summary.validation.warnings
                    .slice(0, 5)
                    .map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  {summary.validation.warnings.length > 5 && (
                    <li>
                      {t('import.moreWarnings', {
                        count: summary.validation.warnings.length - 5,
                      })}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Duplicates */}
            {summary.validation.duplicates.length > 0 && (
              <div className='rounded-md border p-3 space-y-2'>
                <p className='text-sm font-medium'>
                  {t('import.potentialDuplicates')}
                </p>
                <div className='space-y-1'>
                  {summary.validation.duplicates.slice(0, 5).map((dup, index) => (
                    <div key={index} className='text-xs flex items-center gap-2'>
                      <Badge
                        variant={
                          dup.level === 'HIGH' ? 'destructive' : 'secondary'
                        }
                        className='text-[10px]'>
                        {Math.round(dup.score.total * 100)}%
                      </Badge>
                      <span>
                        {dup.personA.display_name} ↔ {dup.personB.display_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid indicator */}
            {summary.validation.valid &&
              summary.validation.errors.length === 0 && (
                <div className='flex items-center gap-2 text-green-700 text-sm'>
                  <CheckCircle className='h-4 w-4' />
                  {t('import.validReady')}
                </div>
              )}

            {/* Actions */}
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleReset}>
                <ArrowLeft className='h-4 w-4 mr-1.5' />
                {tCommon('back')}
              </Button>
              <Button
                disabled={!isImportReady}
                title={t('import.comingSoon')}>
                <CheckCircle className='h-4 w-4 mr-2' />
                {t('import.importData')}
                <Badge variant='secondary' className='ml-2 text-[10px]'>
                  {t('import.comingSoonBadge')}
                </Badge>
              </Button>
            </div>

            {!isImportReady && (
              <p className='text-xs text-muted-foreground'>
                {t('import.prototypeNote')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
