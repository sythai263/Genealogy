/**
 * @project AncestorTree
 * @file src/components/achievements/achievements-view.tsx
 * @description Public achievements board with category filters
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useResettablePage } from '@hooks';
import { Search, Star, Trophy } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@components/ui';
import {
  EmptyState,
  ListPagination,
  PageHeader,
  PageSkeleton,
} from '@components/shared';
import {
  ACHIEVEMENT_CATEGORY_ICONS,
  ACHIEVEMENT_FILTER_VALUES,
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useAchievements,
  useFeaturedAchievements,
  usePeopleByIds,
} from '@hooks';
import type { AchievementCategory, Person } from '@types';
import { AchievementCard } from './achievement-card';

export function AchievementsView() {
  const t = useTranslations('Achievements');
  const [activeCategory, setActiveCategory] = useState<
    AchievementCategory | 'all'
  >('all');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(
    `${search}|${activeCategory}|${pageSize}`
  );

  const { data, isLoading } = useAchievements({
    category: activeCategory === 'all' ? undefined : activeCategory,
    search: search || undefined,
    page,
    pageSize,
  });
  const { data: featured = [] } = useFeaturedAchievements();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [
      ...new Set(
        [...items, ...featured]
          .map((achievement) => achievement.person_id)
          .filter(Boolean)
      ),
    ],
    [items, featured]
  );
  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const person of people ?? []) {
      map.set(person.id, person);
    }
    return map;
  }, [people]);

  if (isLoading) {
    return <PageSkeleton variant="grid" />;
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <PageHeader
        icon={Trophy}
        title={t('title')}
        description={t('subtitle')}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENT_FILTER_VALUES.map((category) => {
            const Icon = ACHIEVEMENT_CATEGORY_ICONS[category];
            return (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {t(`categories.${category}`)}
              </Button>
            );
          })}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {featured.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4 text-amber-500" />
              {t('featuredSection')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  person={peopleMap.get(achievement.person_id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {t('listTitle', { count: total })}
        </h2>
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel={t('itemLabel')}
        />
        {items.length === 0 ? (
          <EmptyState icon={Trophy} title={t('empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                person={peopleMap.get(achievement.person_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
