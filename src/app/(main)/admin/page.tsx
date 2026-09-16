/**
 * @project AncestorTree
 * @file src/app/(main)/admin/page.tsx
 * @description Admin dashboard with overview stats and quick actions
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@components/ui';
import { isChangeType } from '@constants';
import { useFamiliesCount, useRecentActivity, useStats } from '@hooks';
import type { ActivityItem } from '@types';
import {
    Activity,
    ClipboardList,
    FileEdit,
    GitBranchPlus,
    Heart,
    Newspaper,
    Settings,
    Shield,
    TrendingUp,
    UserPlus,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

const ACTIVITY_ICONS: Record<ActivityItem['kind'], LucideIcon> = {
  contribution: FileEdit,
  registration: ClipboardList,
  post: Newspaper,
};

export default function AdminPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: familiesCount, isLoading: familiesLoading } = useFamiliesCount();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();

  const isLoading = statsLoading || familiesLoading;

  function activityLabel(item: ActivityItem): string {
    if (item.kind === 'contribution') {
      const detail = isChangeType(item.detail)
        ? t(`dashboard.activityChangeTypes.${item.detail}`)
        : item.detail;
      return t('dashboard.activityKinds.contribution', { detail });
    }
    return t(`dashboard.activityKinds.${item.kind}`);
  }

  function activityTime(createdAt: string): string {
    return new Date(createdAt).toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Button asChild>
          <Link href="/admin/settings">
            <Settings className="h-4 w-4 mr-2" />
            {t('dashboard.settings')}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('dashboard.stats.people')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalPeople || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('dashboard.stats.generations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalGenerations || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GitBranchPlus className="h-4 w-4" />
              {t('dashboard.stats.chi')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalChi || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              {t('dashboard.stats.families')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold">{familiesCount || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.quickLinks')}</CardTitle>
            <CardDescription>{t('dashboard.quickLinksDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/people/new">
                <UserPlus className="h-5 w-5 mb-2" />
                <span>{t('dashboard.actions.addPerson')}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/admin/users">
                <Users className="h-5 w-5 mb-2" />
                <span>{t('dashboard.actions.manageUsers')}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/tree">
                <GitBranchPlus className="h-5 w-5 mb-2" />
                <span>{t('dashboard.actions.viewTree')}</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <Link href="/people">
                <Activity className="h-5 w-5 mb-2" />
                <span>{t('dashboard.actions.peopleList')}</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.statsDetail')}</CardTitle>
            <CardDescription>{t('dashboard.statsDetailDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('dashboard.stats.living')}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span className="font-semibold text-green-600">{stats?.livingCount || 0}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('dashboard.stats.deceased')}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span className="font-semibold text-gray-500">{stats?.deceasedCount || 0}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t('dashboard.stats.families')}</span>
              {isLoading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span className="font-semibold">{familiesCount || 0}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
          <CardDescription>{t('dashboard.recentActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !activity || activity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('dashboard.activityEmpty')}</p>
            </div>
          ) : (
            <ul className="divide-y">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.kind];
                return (
                  <li key={item.id}>
                    <Link
                      href={item.link}
                      className="flex items-center gap-3 py-2.5 hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <span className="font-medium">{activityLabel(item)}</span>
                          {item.name ? (
                            <span className="text-muted-foreground">
                              {' '}
                              — {item.name}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {activityTime(item.created_at)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
