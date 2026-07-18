/**
 * @project AncestorTree
 * @file src/components/setup/setup-welcome-step.tsx
 * @description Welcome step for desktop first-run wizard
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { ArrowRight, TreePine } from 'lucide-react';
import { Button } from '@components/ui';

interface SetupWelcomeStepProps {
  onContinue: () => void;
}

export function SetupWelcomeStep({ onContinue }: SetupWelcomeStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <TreePine className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gia Phả Điện Tử</h1>
        <p className="text-muted-foreground">
          Chào mừng! Đây là lần đầu tiên bạn sử dụng ứng dụng.
        </p>
      </div>
      <Button size="lg" className="w-full" onClick={onContinue}>
        Bắt đầu <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
