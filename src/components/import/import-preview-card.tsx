/**
 * @project AncestorTree
 * @file src/components/import/import-preview-card.tsx
 * @description GEDCOM import step 2 — parse summary: stats, errors,
 *              warnings, potential duplicates, import action
 *              (DB insert planned for future sprint)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import type { ImportSummary } from '@lib';

interface ImportPreviewCardProps {
  summary: ImportSummary;
  fileName: string;
  onReset: () => void;
}

export function ImportPreviewCard({
  summary,
  fileName,
  onReset,
}: ImportPreviewCardProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');

  // Prototype: DB insert not yet implemented (XL effort — planned for future sprint)
  const isImportReady = false;

  return (
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
          <Button variant='outline' onClick={onReset}>
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
  );
}
