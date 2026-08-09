'use client';

import { Download, Info, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@components/ui';
import { formatBackupDate } from '@lib';

interface BackupExportSectionProps {
  exporting: boolean;
  onExport: () => void;
  lastBackupAt: string | null;
}

export function BackupExportSection({
  exporting,
  onExport,
  lastBackupAt,
}: BackupExportSectionProps) {
  const t = useTranslations('Admin');

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('backup.exportNow')}</h2>
          <p className="text-sm text-muted-foreground">{t('backup.exportDesc')}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{t('backup.exportMediaNote')}</span>
      </div>

      <Button
        onClick={onExport}
        disabled={exporting}
        className="h-11 w-full text-base"
        size="lg"
      >
        {exporting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {t('backup.exporting')}
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            {t('backup.export')}
          </>
        )}
      </Button>

      {lastBackupAt && (
        <p className="text-center text-xs text-muted-foreground">
          {t('backup.lastBackup', { date: formatBackupDate(lastBackupAt) })}
        </p>
      )}
    </div>
  );
}
