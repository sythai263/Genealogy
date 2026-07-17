'use client';

import { Clock, Download } from 'lucide-react';
import { Button } from '@components/ui';
import { formatBackupDate } from '@lib';
import type { BackupSchedule } from '@types';

interface BackupDueBannerProps {
  intervalLabel: string;
  lastBackupAt: BackupSchedule['lastBackupAt'];
  exporting: boolean;
  onExport: () => void;
}

export function BackupDueBanner({
  intervalLabel,
  lastBackupAt,
  exporting,
  onExport,
}: BackupDueBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
      <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Đã đến lịch sao lưu {intervalLabel.toLowerCase()}
        </p>
        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
          Lần sao lưu gần nhất: {formatBackupDate(lastBackupAt)}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onExport}
        disabled={exporting}
      >
        <Download className="mr-1.5 h-3 w-3" />
        Sao lưu ngay
      </Button>
    </div>
  );
}
