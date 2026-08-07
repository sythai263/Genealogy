/**
 * @project AncestorTree
 * @file src/components/stats/stats-view.tsx
 * @description Statistics dashboard with summary cards and charts
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { Skeleton } from '@components/ui';
import { useTreeData } from '@hooks';
import { calculateDetailedStats } from '@lib';
import { BarChart3 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { StatsSummaryCards } from './stats-summary-cards';

// Dynamic import recharts to avoid SSR hydration issues (R-04)
const StatsCharts = dynamic(
  () => import('./stats-charts').then(mod => ({ default: mod.StatsCharts })),
  {
    ssr: false,
    loading: () => <Skeleton className='h-100 w-full rounded-lg' />,
  }
);

export function StatsView() {
  const { data: treeData, isLoading } = useTreeData();

  const stats = useMemo(() => {
    if (!treeData) return null;
    return calculateDetailedStats(treeData);
  }, [treeData]);

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 p-4'>
        <Skeleton className='h-8 w-48' />
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-24 rounded-lg' />
          ))}
        </div>
        <Skeleton className='h-75 rounded-lg' />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className='container mx-auto space-y-6 p-4'>
      <div>
        <h1 className='flex items-center gap-2 text-2xl font-bold'>
          <BarChart3 className='h-6 w-6' />
          Thống kê gia phả
        </h1>
        <p className='text-muted-foreground'>
          Biểu đồ phân bố và số liệu tổng hợp
        </p>
      </div>

      <StatsSummaryCards stats={stats} />

      {/* Charts (client-only) */}
      <StatsCharts stats={stats} />
    </div>
  );
}
