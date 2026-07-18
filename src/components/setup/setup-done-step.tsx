/**
 * @project AncestorTree
 * @file src/components/setup/setup-done-step.tsx
 * @description Completion step for desktop first-run wizard
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@components/ui';
import type { DesktopImportResponse } from '@schemas';

interface SetupDoneStepProps {
  importResult: DesktopImportResponse | null;
  onFinish: () => void;
}

export function SetupDoneStep({
  importResult,
  onFinish,
}: SetupDoneStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle2 className="h-20 w-20 text-emerald-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Sẵn sàng!</h2>
        {importResult ? (
          <p className="text-muted-foreground">
            Đã nhập{' '}
            <span className="font-semibold text-foreground">
              {importResult.total_inserted}
            </span>{' '}
            bản ghi thành công.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Ứng dụng đã được thiết lập. Bắt đầu thêm thành viên vào gia phả.
          </p>
        )}
      </div>
      <Button size="lg" className="w-full" onClick={onFinish}>
        Vào ứng dụng <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
