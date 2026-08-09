'use client';

import { useEffect, useRef, useState } from 'react';
import { DatabaseBackup } from 'lucide-react';
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
    intervalLabel,
  } = useBackupSchedule();

  const exportMutation = useBackupExport();
  const restoreMutation = useBackupRestore();

  function runExport() {
    exportMutation.mutate(undefined, {
      onSuccess: () => {
        recordBackup();
        toast.success('Sao lưu thành công! File đã được tải xuống.');
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Sao lưu thất bại');
      },
    });
  }

  useEffect(() => {
    if (isDue && schedule.autoDownload && !autoBackupTriggered.current) {
      autoBackupTriggered.current = true;
      toast.info('Đã đến lịch sao lưu tự động, đang tải xuống…');
      runExport();
    }
    // Intentionally run once when due — export mutation is stable enough for this UX.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDue, schedule.autoDownload]);

  function handleRestore(file: File) {
    if (
      !window.confirm(
        `Xác nhận khôi phục từ "${file.name}"?\n\nTOÀN BỘ dữ liệu hiện tại sẽ bị XÓA và thay thế bằng dữ liệu trong file sao lưu.\n\nHành động này KHÔNG THỂ hoàn tác.`
      )
    ) {
      return;
    }

    setRestoreResult(null);
    restoreMutation.mutate(file, {
      onSuccess: (data) => {
        setRestoreResult(data);
        toast.success(`Khôi phục thành công — ${data.total_inserted} bản ghi`);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Khôi phục thất bại');
      },
    });
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <DatabaseBackup className="h-6 w-6" />
          Sao lưu &amp; Khôi phục
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Xuất toàn bộ dữ liệu gia phả ra một file ZIP duy nhất và khôi phục khi
          cần thiết.
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
