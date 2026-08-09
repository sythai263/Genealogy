/**
 * @project AncestorTree
 * @file src/components/layout/elderly-toggle.tsx
 * @description Toggle button for elderly mode (larger fonts, simplified UI)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { Button } from '@components/ui';
import { useElderly } from '@contexts';

export function ElderlyToggle() {
  const t = useTranslations('Layout');
  const { elderlyMode, toggleElderlyMode } = useElderly();

  return (
    <Button
      variant={elderlyMode ? 'default' : 'ghost'}
      size="sm"
      onClick={toggleElderlyMode}
      title={elderlyMode ? t('elderlyMode.toggleOff') : t('elderlyMode.toggleOn')}
      className="gap-1.5"
    >
      <Eye className="h-4 w-4" />
      <span className="hidden sm:inline text-xs">
        {elderlyMode ? t('elderlyMode.shortOn') : t('elderlyMode.shortOff')}
      </span>
    </Button>
  );
}
