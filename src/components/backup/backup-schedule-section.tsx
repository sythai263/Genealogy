'use client';

import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@components/ui';
import { BACKUP_INTERVALS } from '@constants';
import { cn, formatBackupDate } from '@lib';
import type { BackupSchedule } from '@types';

interface BackupScheduleSectionProps {
  schedule: BackupSchedule;
  isDue: boolean;
  nextDue: Date | null;
  onScheduleChange: (updates: Partial<BackupSchedule>) => void;
}

export function BackupScheduleSection({
  schedule,
  isDue,
  nextDue,
  onScheduleChange,
}: BackupScheduleSectionProps) {
  const t = useTranslations('Admin');

  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t('backup.schedule')}</h2>
          <p className="text-sm text-muted-foreground">{t('backup.scheduleDesc')}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t('backup.scheduleFrequency')}</p>
        <div className="grid grid-cols-4 gap-2">
          {BACKUP_INTERVALS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onScheduleChange({ interval: value })}
              className={cn(
                'rounded-lg border-2 p-2.5 text-sm font-medium transition-all',
                schedule.interval === value
                  ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                  : 'border-muted hover:border-muted-foreground/40'
              )}
            >
              {t(`backup.intervals.${value}`)}
            </button>
          ))}
        </div>
      </div>

      {schedule.interval !== 'off' && (
        <label className="flex cursor-pointer items-center gap-3 select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={schedule.autoDownload}
              onChange={(event) =>
                onScheduleChange({ autoDownload: event.target.checked })
              }
            />
            <div className="h-6 w-10 rounded-full bg-muted transition-colors peer-checked:bg-violet-500" />
            <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{t('backup.scheduleAutoDownload')}</p>
            <p className="text-xs text-muted-foreground">
              {t('backup.scheduleAutoDownloadHint')}
            </p>
          </div>
        </label>
      )}

      {schedule.interval !== 'off' && (
        <div className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('backup.scheduleLast')}</span>
            <span className="font-medium">
              {formatBackupDate(schedule.lastBackupAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('backup.scheduleNext')}</span>
            <span className="font-medium">
              {nextDue ? formatBackupDate(nextDue) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('backup.scheduleStatus')}</span>
            <Badge
              variant={isDue ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {isDue ? t('backup.scheduleDue') : t('backup.scheduleOk')}
            </Badge>
          </div>
        </div>
      )}

      {schedule.interval === 'off' && (
        <p className="text-center text-xs text-muted-foreground">
          {t('backup.scheduleOffHint')}
        </p>
      )}
    </div>
  );
}
