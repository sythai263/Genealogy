'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks';
import { Search, Star, Trophy } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from '@components/ui';
import { ListPagination } from '@components/shared';
import {
  ACHIEVEMENT_CATEGORIES,
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
  const [activeCategory, setActiveCategory] = useState<
    AchievementCategory | 'all'
  >('all');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${search}|${activeCategory}|${pageSize}`);

  const { data, isLoading } = useAchievements({
    category: activeCategory === 'all' ? undefined : activeCategory,
    search: search || undefined,
    page,
    pageSize,
  });
  const { data: featured = [] } = useFeaturedAchievements();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [
      ...new Set(
        [...items, ...featured].map((achievement) => achievement.person_id).filter(Boolean)
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
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Trophy className="h-6 w-6" />
          Vinh danh con cháu
        </h1>
        <p className="text-muted-foreground">
          Ghi nhận thành tích nổi bật của các thành viên trong dòng họ
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={
                  activeCategory === category.value ? 'default' : 'outline'
                }
                size="sm"
                onClick={() => setActiveCategory(category.value)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
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
              Thành tích nổi bật
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
          Danh sách vinh danh ({total})
        </h2>
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="thành tích"
        />
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Trophy className="mx-auto mb-2 h-10 w-10 opacity-50" />
              <p>Chưa có thành tích nào</p>
            </CardContent>
          </Card>
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
