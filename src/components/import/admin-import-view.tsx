/**
 * @project AncestorTree
 * @file src/components/import/admin-import-view.tsx
 * @description Admin GEDCOM import wizard — orchestrates upload + preview
 *              steps (upload/preview cards live in sibling components)
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
import { Badge } from '@components/ui';
import { GEDCOM_IMPORT_MAX_BYTES } from '@constants';
import { useTreeData } from '@hooks';
import { prepareImport, type ImportSummary } from '@lib';
import { ImportPreviewCard } from './import-preview-card';
import { ImportUploadCard } from './import-upload-card';

type Step = 'upload' | 'preview';

export function AdminImportView() {
  const t = useTranslations('Admin');
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

  function handleReset() {
    setStep('upload');
    setSummary(null);
    setFileName('');
  }

  if (!isEditor) {
    return <AccessDenied />;
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

      {step === 'upload' && (
        <ImportUploadCard
          isProcessing={isProcessing}
          onFileUpload={handleFileUpload}
        />
      )}

      {step === 'preview' && summary && (
        <ImportPreviewCard
          summary={summary}
          fileName={fileName}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
