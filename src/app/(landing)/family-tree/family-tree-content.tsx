/**
 * @project AncestorTree
 * @file src/app/(landing)/family-tree/family-tree-content.tsx
 * @description Public family tree viewer — mobile-first full-viewport layout
 * @version 1.2.0
 * @updated 2026-07-19
 */

'use client';

import { LandingAuthCta } from '@components/layout';
import { Skeleton } from '@components/ui';
import { useClanSettings } from '@hooks';
import { CLAN_FULL_NAME } from '@lib';
import { GitBranchPlus } from 'lucide-react';
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
  const { data: clanSettings } = useClanSettings();
  const clanName =
    clanSettings?.clan_full_name ?? clanSettings?.clan_name ?? CLAN_FULL_NAME;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-muted/20">
      <header className="shrink-0 border-b bg-background px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <GitBranchPlus className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="truncate">Cây gia phả</span>
            </h1>
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
              {clanName}
            </p>
            <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
              <span className="text-blue-500">Viền xanh</span> = Nam ·{' '}
              <span className="text-pink-500">Viền hồng</span> = Nữ · Kéo để di
              chuyển · Nút +/- để zoom
            </p>
            <p className="mt-1 text-[11px] leading-snug text-muted-foreground sm:hidden">
              Kéo để di chuyển · Dùng nút +/- để zoom · Chạm nút ± trên nhánh để
              thu/mở
            </p>
          </div>
          <LandingAuthCta variant="header" />
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col sm:px-4 sm:pb-4 sm:pt-3">
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
