/**
 * @project AncestorTree
 * @file src/components/setup/setup-choice-step.tsx
 * @description Import-or-start-fresh choice step
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Plus, Upload } from 'lucide-react';

interface SetupChoiceStepProps {
  onFileSelected: (file: File) => void;
  onStartFresh: () => void;
}

export function SetupChoiceStep({
  onFileSelected,
  onStartFresh,
}: SetupChoiceStepProps) {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Bạn muốn làm gì?</h2>
        <p className="text-sm text-muted-foreground">
          Nhập dữ liệu từ file backup hoặc bắt đầu nhập liệu mới.
        </p>
      </div>

      <div className="grid gap-3">
        <label className="group relative cursor-pointer">
          <input
            type="file"
            accept=".zip"
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="flex items-start gap-4 rounded-xl border-2 border-dashed border-muted-foreground/30 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Upload className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold">Nhập từ file backup</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Khôi phục dữ liệu từ file{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  .zip
                </code>{' '}
                đã xuất trước đó.
              </p>
            </div>
          </div>
        </label>

        <button
          type="button"
          onClick={onStartFresh}
          className="flex items-start gap-4 rounded-xl border-2 border-dashed border-muted-foreground/30 p-4 text-left transition-all hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
        >
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold">Bắt đầu mới</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Tạo gia phả mới từ đầu. Bạn có thể thêm thành viên sau.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
