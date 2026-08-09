/**
 * @project AncestorTree
 * @file src/components/home/stats-card.tsx
 * @description Homepage stats card with live data
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { useStats } from '@hooks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';

export function StatsCard() {
  const t = useTranslations('Stats');
  const { data: stats, isLoading } = useStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="mx-auto mb-1 h-9 w-16" />
            ) : (
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.totalPeople || 0}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {t('homeCard.members')}
            </div>
          </div>
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="mx-auto mb-1 h-9 w-12" />
            ) : (
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.totalGenerations || 0}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {t('homeCard.generations')}
            </div>
          </div>
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="mx-auto mb-1 h-9 w-12" />
            ) : (
              <div className="text-3xl font-bold text-emerald-600">
                {stats?.totalChi || 0}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {t('homeCard.branches')}
            </div>
          </div>
          <div className="text-center">
            {isLoading ? (
              <Skeleton className="mx-auto mb-1 h-9 w-12" />
            ) : (
              <div className="text-3xl font-bold text-amber-600">
                {stats?.livingCount || 0}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {t('homeCard.living')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
