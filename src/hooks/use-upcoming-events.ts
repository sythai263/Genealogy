/**
 * @project AncestorTree
 * @file src/hooks/use-upcoming-events.ts
 * @description Computes the merged upcoming-events list for the events page —
 *              explicit recurring events (lunar or solar dates) plus
 *              auto-generated giỗ entries for deceased people who have no
 *              explicit event, sorted by days-until
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { UPCOMING_EVENTS_WINDOW_DAYS } from '@constants';
import {
  formatLunarDate,
  getNextLunarOccurrence,
  parseLunarString,
  solarToLunar,
} from '@lib';
import type { Event, MemorialPerson, Person, UpcomingEvent } from '@types';

interface UseUpcomingEventsParams {
  events: Event[] | undefined;
  people: Person[] | undefined;
  memorialPeople: MemorialPerson[] | undefined;
}

export function useUpcomingEvents({
  events,
  people,
  memorialPeople,
}: UseUpcomingEventsParams): UpcomingEvent[] {
  const t = useTranslations('Events');

  const upcomingEvents = useMemo<UpcomingEvent[]>(() => {
    if (!events || !people) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const results: UpcomingEvent[] = [];

    for (const event of events) {
      let nextDate: Date | null = null;
      let lunarDisplay = '';

      if (event.event_lunar) {
        const parsed = parseLunarString(event.event_lunar);
        if (parsed) {
          nextDate = getNextLunarOccurrence(parsed.day, parsed.month, now);
          lunarDisplay = formatLunarDate(parsed.day, parsed.month);
        }
      } else if (event.event_date) {
        nextDate = new Date(event.event_date);
        const lunar = solarToLunar(
          nextDate.getDate(),
          nextDate.getMonth() + 1,
          nextDate.getFullYear()
        );
        lunarDisplay = formatLunarDate(lunar.day, lunar.month);
      }

      if (!nextDate) continue;

      const daysUntil = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil > UPCOMING_EVENTS_WINDOW_DAYS) continue;

      const person = event.person_id
        ? people.find((item) => item.id === event.person_id)
        : undefined;
      results.push({
        event,
        person,
        nextDate,
        daysUntil,
        lunarDisplay,
        isAuto: false,
      });
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [events, people]);

  const autoGioEvents = useMemo<UpcomingEvent[]>(() => {
    if (!memorialPeople || !events) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const existingPersonIds = new Set(
      events.filter((event) => event.person_id).map((event) => event.person_id)
    );
    const results: UpcomingEvent[] = [];

    for (const person of memorialPeople) {
      if (
        person.is_living ||
        !person.death_lunar ||
        existingPersonIds.has(person.id)
      ) {
        continue;
      }

      const parsed = parseLunarString(person.death_lunar);
      if (!parsed) continue;

      const nextDate = getNextLunarOccurrence(parsed.day, parsed.month, now);
      const daysUntil = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil > UPCOMING_EVENTS_WINDOW_DAYS) continue;

      results.push({
        event: {
          id: `gio-auto-${person.id}`,
          title: t('autoGioTitle', { name: person.display_name }),
          event_type: 'gio',
          event_lunar: person.death_lunar,
          person_id: person.id,
          recurring: true,
          created_at: new Date().toISOString(),
        },
        person,
        nextDate,
        daysUntil,
        lunarDisplay: formatLunarDate(parsed.day, parsed.month),
        isAuto: true,
      });
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [memorialPeople, events, t]);

  return useMemo(() => {
    return [...upcomingEvents, ...autoGioEvents].sort(
      (a, b) => a.daysUntil - b.daysUntil
    );
  }, [upcomingEvents, autoGioEvents]);
}
