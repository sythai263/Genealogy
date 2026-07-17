'use client';

import { Download, Info, RefreshCw } from 'lucide-react';
import { Button } from '@components/ui';
import {
  BACKUP_MEDIA_OPTIONS,
  IS_DESKTOP_MODE,
} from '@constants';
import { cn, formatBackupDate } from '@lib';
import type { IncludeMedia } from '@types';

interface BackupExportSectionProps {
  includeMedia: IncludeMedia;
  onIncludeMediaChange: (value: IncludeMedia) => void;
  exporting: boolean;
  onExport: () => void;
  lastBackupAt: string | null;
}

export function BackupExportSection({
  includeMedia,
  onIncludeMediaChange,
  exporting,
  onExport,
  lastBackupAt,
}: BackupExportSectionProps) {
  return (
    <div className="space-y-4 rounded-xl border p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sao lưu ngay</h2>
          <p className="text-sm text-muted-foreground">
            Tải xuống toàn bộ dữ liệu gia phả dưới dạng 1 file ZIP.
          </p>
        </div>
      </div>

      {IS_DESKTOP_MODE && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Tùy chọn hình ảnh:</p>
          <div className="grid grid-cols-3 gap-2">
            {BACKUP_MEDIA_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onIncludeMediaChange(option.value)}
                className={cn(
                  'flex flex-col rounded-lg border-2 p-3 text-left transition-all',
                  includeMedia === option.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-muted hover:border-muted-foreground/40'
                )}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 text-xs text-muted-foreground">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!IS_DESKTOP_MODE && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Chế độ Web: ảnh được lưu dưới dạng đường dẫn (liên kết Supabase
            Storage).
          </span>
        </div>
      )}

      <Button
        onClick={onExport}
        disabled={exporting}
        className="h-11 w-full text-base"
        size="lg"
      >
        {exporting ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Đang xuất dữ liệu…
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Xuất sao lưu
          </>
        )}
      </Button>

      {lastBackupAt && (
        <p className="text-center text-xs text-muted-foreground">
          Sao lưu gần nhất: {formatBackupDate(lastBackupAt)}
        </p>
      )}
    </div>
  );
}
