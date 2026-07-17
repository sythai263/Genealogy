'use client';

import { useRef } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Upload } from 'lucide-react';
import { Badge, Button } from '@components/ui';
import { BACKUP_TABLE_NAMES } from '@constants';
import type { RestoreResult } from '@types';

interface BackupRestoreSectionProps {
  restoring: boolean;
  restoreResult: RestoreResult | null;
  onRestore: (file: File) => void;
}

export function BackupRestoreSection({
  restoring,
  restoreResult,
  onRestore,
}: BackupRestoreSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <h2 className="text-lg font-semibold">Khôi phục dữ liệu</h2>
          <p className="text-sm text-muted-foreground">
            Chọn file ZIP đã sao lưu trước đó để khôi phục toàn bộ dữ liệu.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong>Cảnh báo:</strong> Toàn bộ dữ liệu hiện tại sẽ bị{' '}
          <strong>xóa hoàn toàn</strong> và thay thế bằng dữ liệu trong file sao
          lưu. Hành động này không thể hoàn tác.
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
            Đang khôi phục…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Chọn file ZIP để khôi phục
          </>
        )}
      </Button>

      {restoreResult && (
        <div className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Khôi phục thành công — {restoreResult.total_inserted} bản ghi
            {restoreResult.mode && (
              <Badge variant="outline" className="ml-auto text-xs">
                {restoreResult.mode === 'desktop' ? 'Desktop' : 'Web'}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(restoreResult.tables).map(([table, count]) => (
              <div
                key={table}
                className="flex justify-between py-0.5 text-xs"
              >
                <span className="text-muted-foreground">
                  {BACKUP_TABLE_NAMES[table] ?? table}
                </span>
                <span className="font-mono font-medium">{count}</span>
              </div>
            ))}
          </div>
          {restoreResult.errors && restoreResult.errors.length > 0 && (
            <div className="space-y-0.5 text-xs text-amber-700 dark:text-amber-300">
              <p className="flex items-center gap-1 font-medium">
                <AlertTriangle className="h-3 w-3" /> Cảnh báo:
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
