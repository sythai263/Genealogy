'use client';

import { useEffect, useRef, useState } from 'react';
import { DatabaseBackup } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  useBackupExport,
  useBackupRestore,
  useBackupSchedule,
} from '@hooks';
import type { RestoreResult } from '@types';
import { BackupDueBanner } from './backup-due-banner';
import { BackupExportSection } from './backup-export-section';
import { BackupRestoreSection } from './backup-restore-section';
import { BackupScheduleSection } from './backup-schedule-section';

export function BackupView() {
  const t = useTranslations('Admin');
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(
    null
  );
  const autoBackupTriggered = useRef(false);

  const {
    schedule,
    setSchedule,
    recordBackup,
    isDue,
    nextDue,
  } = useBackupSchedule();

  const exportMutation = useBackupExport();
  const restoreMutation = useBackupRestore();

  const intervalLabel =
    schedule.interval !== 'off'
      ? t(`backup.intervals.${schedule.interval}`)
      : '';

  function runExport() {
    exportMutation.mutate(undefined, {
      onSuccess: () => {
        recordBackup();
        toast.success(t('backup.toasts.exportSuccess'));
      },
      onError: (error: Error) => {
        toast.error(error.message || t('backup.toasts.exportError'));
      },
    });
  }

  useEffect(() => {
    if (isDue && schedule.autoDownload && !autoBackupTriggered.current) {
      autoBackupTriggered.current = true;
      toast.info(t('backup.autoBackupToast'));
      runExport();
    }
    // Intentionally run once when due — export mutation is stable enough for this UX.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDue, schedule.autoDownload]);

  function handleRestore(file: File) {
    if (!window.confirm(t('backup.restoreConfirm', { name: file.name }))) {
      return;
    }

    setRestoreResult(null);
    restoreMutation.mutate(file, {
      onSuccess: (data) => {
        setRestoreResult(data);
        toast.success(
          t('backup.toasts.restoreSuccess', { count: data.total_inserted })
        );
      },
      onError: (error: Error) => {
        toast.error(error.message || t('backup.toasts.restoreError'));
      },
    });
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <DatabaseBackup className="h-6 w-6" />
          {t('backup.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('backup.subtitle')}
        </p>
      </div>

      {isDue && !schedule.autoDownload && (
        <BackupDueBanner
          intervalLabel={intervalLabel}
          lastBackupAt={schedule.lastBackupAt}
          exporting={exportMutation.isPending}
          onExport={() => runExport()}
        />
      )}

      <BackupExportSection
        exporting={exportMutation.isPending}
        onExport={() => runExport()}
        lastBackupAt={schedule.lastBackupAt}
      />

      <BackupRestoreSection
        restoring={restoreMutation.isPending}
        restoreResult={restoreResult}
        onRestore={handleRestore}
      />

      <BackupScheduleSection
        schedule={schedule}
        isDue={isDue}
        nextDue={nextDue}
        onScheduleChange={setSchedule}
      />
    </div>
  );
}
