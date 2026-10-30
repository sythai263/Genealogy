/**
 * @project AncestorTree
 * @file src/components/tree/tree-legend-dialog.tsx
 * @description Dialog listing every symbol used on the tree canvas
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import type { ReactNode } from 'react';
import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui';

interface LegendItem {
  swatch: ReactNode;
  label: string;
}

const MALE_SWATCH =
  'h-5 w-5 shrink-0 rounded border bg-sky-100/80 border-sky-300/70 dark:bg-sky-400/25 dark:border-sky-400/50';
const FEMALE_SWATCH =
  'h-5 w-5 shrink-0 rounded border bg-rose-100/80 border-rose-300/70 dark:bg-rose-400/25 dark:border-rose-400/50';

export function TreeLegendDialog() {
  const t = useTranslations('Tree');

  const items: LegendItem[] = [
    { swatch: <span className={MALE_SWATCH} />, label: t('legend.maleBg') },
    { swatch: <span className={FEMALE_SWATCH} />, label: t('legend.femaleBg') },
    {
      swatch: (
        <span className="h-5 w-5 shrink-0 rounded border border-dashed border-border bg-muted/40" />
      ),
      label: t('legend.inLawBorder'),
    },
    {
      swatch: <span className="h-0.5 w-5 shrink-0 bg-pink-400" />,
      label: t('legend.spouseLine'),
    },
    {
      swatch: (
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded border border-border bg-card">
          <span className="absolute -right-1 top-0.5 h-1 w-4 rotate-45 bg-foreground/80" />
        </span>
      ),
      label: t('legend.deceasedRibbon'),
    },
    {
      swatch: (
        <span className="h-5 w-5 shrink-0 rounded-full bg-muted-foreground/25" />
      ),
      label: t('legend.deceasedAvatar'),
    },
    {
      swatch: (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
          −
        </span>
      ),
      label: t('legend.collapseBtn'),
    },
    {
      swatch: <span className="h-px w-5 shrink-0 bg-border" />,
      label: t('legend.generationAxis'),
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
          aria-label={t('legend.title')}
          title={t('legend.title')}
        >
          <CircleHelp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-5">
        <DialogHeader>
          <DialogTitle>{t('legend.title')}</DialogTitle>
        </DialogHeader>
        <ul className="mt-2 space-y-3.5">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              {item.swatch}
              <span className="text-sm">{item.label}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
