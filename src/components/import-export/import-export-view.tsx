/**
 * @project AncestorTree
 * @file src/components/import-export/import-export-view.tsx
 * @description Desktop ZIP export / import of genealogy data
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileArchive,
  Upload,
} from 'lucide-react';
import { Button } from '@components/ui';
import { BACKUP_MEDIA_OPTIONS } from '@constants';
import { cn } from '@lib';
import type { IncludeMedia, RestoreResult } from '@types';

export function ImportExportView() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<RestoreResult | null>(null);
  const [includeMedia, setIncludeMedia] = useState<IncludeMedia>('reference');

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/desktop-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ include_media: includeMedia }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export thất bại');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `giapha-${new Date().toISOString().slice(0, 10)}.zip`;
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Xuất dữ liệu thành công!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export thất bại');
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(file: File) {
    if (
      !window.confirm(
        `Xác nhận nhập dữ liệu từ "${file.name}"?\n\nTOÀN BỘ dữ liệu hiện tại sẽ bị xóa và thay thế.`
      )
    ) {
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/desktop-import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import thất bại');
      setImportResult(data as RestoreResult);
      toast.success(`Nhập thành công ${data.total_inserted} bản ghi`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import thất bại');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="container max-w-2xl space-y-8 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <FileArchive className="h-6 w-6" /> Xuất / Nhập dữ liệu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sao lưu và khôi phục toàn bộ dữ liệu gia phả dưới dạng file ZIP.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Xuất dữ liệu</h2>
            <p className="text-sm text-muted-foreground">
              Tải về file ZIP chứa toàn bộ gia phả.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Tuỳ chọn media:</p>
          <div className="grid grid-cols-3 gap-2">
            {BACKUP_MEDIA_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setIncludeMedia(option.value)}
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

        <Button
          onClick={() => void handleExport()}
          disabled={exporting}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? 'Đang xuất...' : 'Xuất dữ liệu'}
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Upload className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Nhập dữ liệu</h2>
            <p className="text-sm text-muted-foreground">
              Khôi phục từ file ZIP đã xuất trước đó.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Toàn bộ dữ liệu hiện tại sẽ bị <strong>xóa</strong> và thay thế bằng
            dữ liệu trong file.
          </span>
        </div>

        <label className="block">
          <input
            type="file"
            accept=".zip"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
              event.target.value = '';
            }}
            disabled={importing}
          />
          <Button
            asChild
            variant="outline"
            disabled={importing}
            className="w-full cursor-pointer"
          >
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? 'Đang nhập...' : 'Chọn file ZIP để nhập'}
            </span>
          </Button>
        </label>

        {importResult && (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Nhập thành công —{' '}
              {importResult.total_inserted} bản ghi
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {Object.entries(importResult.tables).map(([table, count]) => (
                <div key={table} className="flex justify-between">
                  <span>{table}</span>
                  <span className="font-mono">{count}</span>
                </div>
              ))}
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                <p className="font-medium">Cảnh báo:</p>
                {importResult.errors.slice(0, 3).map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
