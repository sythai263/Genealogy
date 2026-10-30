/**
 * @project AncestorTree
 * @file src/components/import/import-upload-card.tsx
 * @description GEDCOM import step 1 — file dropzone/select for the import
 *              wizard
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { FileText, Loader2, Upload } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';

interface ImportUploadCardProps {
  isProcessing: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportUploadCard({
  isProcessing,
  onFileUpload,
}: ImportUploadCardProps) {
  const t = useTranslations('Admin');

  return (
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
              onChange={onFileUpload}
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
  );
}
