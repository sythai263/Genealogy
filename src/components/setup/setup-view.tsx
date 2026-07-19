/**
 * @project AncestorTree
 * @file src/components/setup/setup-view.tsx
 * @description Desktop first-run wizard orchestration
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IS_DESKTOP_MODE } from '@constants';
import type { SetupStep } from '@constants';
import {
  desktopImportResponseSchema,
  type DesktopImportResponse,
} from '@schemas';
import { SetupChoiceStep } from './setup-choice-step';
import { SetupDoneStep } from './setup-done-step';
import { SetupImportingStep } from './setup-importing-step';
import { SetupWelcomeStep } from './setup-welcome-step';

export function SetupView() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>('welcome');
  const [importResult, setImportResult] =
    useState<DesktopImportResponse | null>(null);

  useEffect(() => {
    if (!IS_DESKTOP_MODE) {
      router.replace('/admin');
    }
  }, [router]);

  async function handleImport(file: File) {
    setStep('importing');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/desktop-import', {
        method: 'POST',
        body: formData,
      });
      const parsed = desktopImportResponseSchema.safeParse(await res.json());
      if (!parsed.success) {
        throw new Error('Import thất bại');
      }
      if (!res.ok) {
        throw new Error(parsed.data.error || 'Import thất bại');
      }
      setImportResult(parsed.data);
      setStep('done');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Import thất bại'
      );
      setStep('choice');
    }
  }

  function handleStartFresh() {
    setStep('done');
  }

  function handleFinish() {
    router.replace('/tree');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {step === 'welcome' && (
          <SetupWelcomeStep onContinue={() => setStep('choice')} />
        )}
        {step === 'choice' && (
          <SetupChoiceStep
            onFileSelected={handleImport}
            onStartFresh={handleStartFresh}
          />
        )}
        {step === 'importing' && <SetupImportingStep />}
        {step === 'done' && (
          <SetupDoneStep
            importResult={importResult}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
