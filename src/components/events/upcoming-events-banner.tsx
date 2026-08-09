/**
 * @project AncestorTree
 * @file src/components/events/upcoming-events-banner.tsx
 * @description Banner listing upcoming events within the next 60 days
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { EVENT_TYPE_META, UPCOMING_EVENTS_WINDOW_DAYS } from '@constants';
import { cn } from '@lib';
import type { UpcomingEvent } from '@types';

interface UpcomingEventsBannerProps {
  events: UpcomingEvent[];
}

export function UpcomingEventsBanner({ events }: UpcomingEventsBannerProps) {
  const t = useTranslations('Events');

  if (events.length === 0) return null;

  return (
    <Card className='mb-6 border-amber-200 bg-amber-50/50'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <AlertCircle className='h-4 w-4 text-amber-600' />
          {t('upcomingBanner', {
            count: events.length,
            days: UPCOMING_EVENTS_WINDOW_DAYS,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {events.slice(0, 5).map(
            ({ event, person, nextDate, daysUntil, lunarDisplay, isAuto }) => {
              const typeInfo = EVENT_TYPE_META[event.event_type];
              const TypeIcon = typeInfo.icon;
              return (
                <div
                  key={event.id}
                  className='flex items-center gap-3 rounded-lg bg-background p-3'>
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      typeInfo.color
                    )}>
                    <TypeIcon className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='text-sm font-medium'>
                      {event.title}
                      {isAuto && (
                        <span className='ml-1 text-xs text-muted-foreground'>
                          {t('auto')}
                        </span>
                      )}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {nextDate.toLocaleDateString('vi-VN')} · {lunarDisplay}
                      {person && (
                        <>
                          {' · '}
                          <Link
                            href={`/people/${person.id}`}
                            className='hover:underline'>
                            {person.display_name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={
                      daysUntil <= 7
                        ? 'destructive'
                        : daysUntil <= 30
                          ? 'default'
                          : 'secondary'
                    }>
                    {daysUntil === 0
                      ? t('today')
                      : t('daysCount', { days: daysUntil })}
                  </Badge>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
