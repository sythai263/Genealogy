'use client';

import { useRef } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@components/ui';
import { BACKUP_TABLE_KEYS, type BackupTableKey } from '@constants';
import type { RestoreResult } from '@types';

interface BackupRestoreSectionProps {
  restoring: boolean;
  restoreResult: RestoreResult | null;
  onRestore: (file: File) => void;
}

function isBackupTableKey(key: string): key is BackupTableKey {
  return (BACKUP_TABLE_KEYS as readonly string[]).includes(key);
}

export function BackupRestoreSection({
  restoring,
  restoreResult,
  onRestore,
}: BackupRestoreSectionProps) {
  const t = useTranslations('Admin');
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getTableLabel(table: string): string {
    if (isBackupTableKey(table)) {
      return t(`backup.tables.${table}`);
    }
    return table;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onRestore(file);
    event.target.value = '';
  }

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('backup.restore')}</h2>
          <p className="text-sm text-muted-foreground">{t('backup.restoreDesc')}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>{t('backup.restoreWarningLabel')}</strong>{' '}
          {t('backup.restoreWarningBefore')}{' '}
          <strong>{t('backup.restoreWarningStrong')}</strong>{' '}
          {t('backup.restoreWarningAfter')}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        className="sr-only"
        onChange={handleFileChange}
        disabled={restoring}
      />

      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={restoring}
        className="h-11 w-full border-dashed text-base"
        size="lg"
      >
        {restoring ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {t('backup.restoring')}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {t('backup.restoreSelect')}
          </>
        )}
      </Button>

      {restoreResult && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {t('backup.toasts.restoreSuccess', {
              count: restoreResult.total_inserted,
            })}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(restoreResult.tables).map(([table, count]) => (
              <div
                key={table}
                className="flex justify-between py-0.5 text-xs"
              >
                <span className="text-muted-foreground">
                  {getTableLabel(table)}
                </span>
                <span className="font-mono font-medium">{count}</span>
              </div>
            ))}
          </div>
          {restoreResult.errors && restoreResult.errors.length > 0 && (
            <div className="space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
              <p className="flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3 w-3" />{' '}
                {t('backup.restoreWarningLabel')}
              </p>
              {restoreResult.errors.slice(0, 5).map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
