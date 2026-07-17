'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@components/ui';
import { BACKUP_INTERVAL_LABELS } from '@constants';
import { cn, formatBackupDate } from '@lib';
import type { BackupInterval, BackupSchedule } from '@types';

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
  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Tự động sao lưu</h2>
          <p className="text-sm text-muted-foreground">
            Nhắc nhở hoặc tự động tải xuống file sao lưu theo lịch định kỳ.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tần suất sao lưu:</p>
        <div className="grid grid-cols-4 gap-2">
          {(
            Object.entries(BACKUP_INTERVAL_LABELS) as [BackupInterval, string][]
          ).map(([value, label]) => (
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
              {label}
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
            <p className="text-sm font-medium">
              Tự động tải xuống khi đến lịch
            </p>
            <p className="text-xs text-muted-foreground">
              File sẽ được tải xuống tự động khi bạn mở trang này và đã đến lịch
              sao lưu
            </p>
          </div>
        </label>
      )}

      {schedule.interval !== 'off' && (
        <div className="space-y-1.5 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lần sao lưu gần nhất</span>
            <span className="font-medium">
              {formatBackupDate(schedule.lastBackupAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lần sao lưu tiếp theo</span>
            <span className="font-medium">
              {nextDue ? formatBackupDate(nextDue) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trạng thái</span>
            <Badge
              variant={isDue ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {isDue ? 'Cần sao lưu' : 'Đã cập nhật'}
            </Badge>
          </div>
        </div>
      )}

      {schedule.interval === 'off' && (
        <p className="text-center text-xs text-muted-foreground">
          Chọn tần suất để bật tính năng tự động sao lưu.
        </p>
      )}
    </div>
  );
}
