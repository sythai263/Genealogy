/**
 * @project AncestorTree
 * @file src/components/stats/stats-view.tsx
 * @description Statistics dashboard with summary cards and charts
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { PageSkeleton } from '@components/shared';
import { Skeleton } from '@components/ui';
import { useTreeData } from '@hooks';
import { calculateDetailedStats } from '@lib';
import { BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { StatsSummaryCards } from './stats-summary-cards';

const StatsCharts = dynamic(
  () => import('./stats-charts').then((mod) => ({ default: mod.StatsCharts })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-100 w-full rounded-lg" />,
  }
);

export function StatsView() {
  const t = useTranslations('Stats');
  const { data: treeData, isLoading } = useTreeData();

  const stats = useMemo(() => {
    if (!treeData) return null;
    return calculateDetailedStats(treeData);
  }, [treeData]);

  if (isLoading) {
    return <PageSkeleton variant="grid" />;
  }

  if (!stats) return null;

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-6 w-6" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <StatsSummaryCards stats={stats} />
      <StatsCharts stats={stats} />
    </div>
  );
}
