/**
 * @project AncestorTree
 * @file src/components/achievements/achievement-card.tsx
 * @description Single achievement card for the public board
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Badge, Card, CardContent } from '@components/ui';
import type { Achievement, Person } from '@types';
import {
  ACHIEVEMENT_CATEGORY_ICONS,
  getAchievementCategoryIcon,
} from '@constants';

interface AchievementCardProps {
  achievement: Achievement;
  person?: Person;
}

export function AchievementCard({ achievement, person }: AchievementCardProps) {
  const t = useTranslations('Achievements');
  const CategoryIcon =
    getAchievementCategoryIcon(achievement.category) ??
    ACHIEVEMENT_CATEGORY_ICONS.other;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <CategoryIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold">{achievement.title}</h3>
            {person && (
              <p className="text-sm text-muted-foreground">
                {person.chi
                  ? t('personMetaChi', {
                      name: person.display_name,
                      generation: person.generation,
                      chi: person.chi,
                    })
                  : t('personMeta', {
                      name: person.display_name,
                      generation: person.generation,
                    })}
              </p>
            )}
            {achievement.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {achievement.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {t(`categories.${achievement.category}`)}
              </Badge>
              {achievement.year && (
                <Badge variant="secondary" className="text-xs">
                  {achievement.year}
                </Badge>
              )}
              {achievement.awarded_by && (
                <span className="text-xs text-muted-foreground">
                  {achievement.awarded_by}
                </span>
              )}
            </div>
          </div>
          {achievement.is_featured && (
            <Star className="h-4 w-4 shrink-0 text-amber-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
