/**
 * @project AncestorTree
 * @file src/components/stats/stats-charts.tsx
 * @description Recharts chart components for stats dashboard (client-only)
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import {
  STATS_CHART_AMBER,
  STATS_CHART_BLUE,
  STATS_GENDER_COLORS,
  STATS_LIVING_COLORS,
} from '@constants';
import type { DetailedStats } from '@lib';

interface StatsChartsProps {
  stats: DetailedStats;
}

interface PieLabelProps {
  name?: string;
  value?: number;
}

function formatPieLabel({ name, value }: PieLabelProps): string {
  return `${name ?? ''}: ${value ?? 0}`;
}

export function StatsCharts({ stats }: StatsChartsProps) {
  const t = useTranslations('Stats');
  const tCommon = useTranslations('Common');

  const genderData = [
    { name: t('charts.male'), value: stats.genderStats[0]?.value ?? 0 },
    { name: t('charts.female'), value: stats.genderStats[1]?.value ?? 0 },
  ];

  const livingData = [
    { name: tCommon('living'), value: stats.livingStats[0]?.value ?? 0 },
    { name: tCommon('deceased'), value: stats.livingStats[1]?.value ?? 0 },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">{t('charts.byGeneration')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={stats.generationStats}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill={STATS_CHART_BLUE}
                name={t('charts.peopleCount')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {stats.chiStats.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('charts.byChi')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.chiStats}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill={STATS_CHART_AMBER}
                  name={t('charts.peopleCount')}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('charts.byGender')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={formatPieLabel}
              >
                {genderData.map((_, idx) => (
                  <Cell
                    key={`gender-${idx}`}
                    fill={
                      STATS_GENDER_COLORS[idx % STATS_GENDER_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('charts.livingStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={livingData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={formatPieLabel}
              >
                {livingData.map((_, idx) => (
                  <Cell
                    key={`living-${idx}`}
                    fill={
                      STATS_LIVING_COLORS[idx % STATS_LIVING_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
