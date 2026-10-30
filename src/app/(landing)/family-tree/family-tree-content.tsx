/**
 * @project AncestorTree
 * @file src/app/(landing)/family-tree/family-tree-content.tsx
 * @description Public family tree viewer — mobile-first full-viewport layout
 * @version 1.3.0
 * @updated 2026-08-09
 */

'use client';

import { Skeleton } from '@components/ui';
import { useClanSettings } from '@hooks';
import { CLAN_FULL_NAME } from '@lib';
import { GitBranchPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const FamilyTree = dynamic(
  () =>
    import('@components/tree/family-tree').then((mod) => ({
      default: mod.FamilyTree,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[50vh] items-center justify-center p-4">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>
    ),
  }
);

export function FamilyTreeContent() {
  const t = useTranslations('Landing');
  const { data: clanSettings } = useClanSettings();
  const clanName =
    clanSettings?.clan_full_name ?? clanSettings?.clan_name ?? CLAN_FULL_NAME;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-muted/20">
      <header className="shrink-0 border-b bg-background">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <GitBranchPlus className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="truncate">{t('pages.familyTree.title')}</span>
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {clanName}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 sm:pt-3 sm:pb-4 lg:px-8">
        <Suspense
          fallback={
            <div className="flex h-full min-h-[50vh] items-center justify-center p-4">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          }
        >
          <FamilyTree variant="public" />
        </Suspense>
      </div>
    </div>
  );
}
