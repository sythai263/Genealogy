/**
 * @project AncestorTree
 * @file src/components/stats/stats-summary-cards.tsx
 * @description Summary metric cards for stats dashboard
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Heart, Layers, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import type { DetailedStats } from '@lib';

interface StatsSummaryCardsProps {
  stats: DetailedStats;
}

export function StatsSummaryCards({ stats }: StatsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Tổng thành viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalPeople}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Layers className="h-4 w-4" />
            Số đời
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalGenerations}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Heart className="h-4 w-4" />
            Số gia đình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalFamilies}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            TB con/gia đình
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.avgChildrenPerFamily}</p>
          <p className="text-xs text-muted-foreground">
            Tuyệt tự: {stats.childlessRate}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
