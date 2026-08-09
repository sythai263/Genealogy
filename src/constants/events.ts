/**
 * @project AncestorTree
 * @file src/constants/events.ts
 * @description Shared constants for memorial calendar / events (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { CalendarDays, Flame, PartyPopper, Users, type LucideIcon } from 'lucide-react';
import type { EventType } from '@types';

export const UPCOMING_EVENTS_WINDOW_DAYS = 60;

export const EVENT_TYPE_ORDER: EventType[] = [
  'gio',
  'hop_ho',
  'le_tet',
  'other',
];

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  gio: 'text-red-600 bg-red-50',
  hop_ho: 'text-blue-600 bg-blue-50',
  le_tet: 'text-amber-600 bg-amber-50',
  other: 'text-gray-600 bg-gray-50',
};

export const EVENT_TYPE_ICONS: Record<EventType, LucideIcon> = {
  gio: Flame,
  hop_ho: Users,
  le_tet: PartyPopper,
  other: CalendarDays,
};

/** Combined meta used by calendar / list UI (labels resolved via Events.types.*) */
export const EVENT_TYPE_META: Record<
  EventType,
  { icon: LucideIcon; color: string }
> = {
  gio: {
    icon: EVENT_TYPE_ICONS.gio,
    color: EVENT_TYPE_COLORS.gio,
  },
  hop_ho: {
    icon: EVENT_TYPE_ICONS.hop_ho,
    color: EVENT_TYPE_COLORS.hop_ho,
  },
  le_tet: {
    icon: EVENT_TYPE_ICONS.le_tet,
    color: EVENT_TYPE_COLORS.le_tet,
  },
  other: {
    icon: EVENT_TYPE_ICONS.other,
    color: EVENT_TYPE_COLORS.other,
  },
};

export function isEventType(value: string): value is EventType {
  for (const eventType of EVENT_TYPE_ORDER) {
    if (eventType === value) return true;
  }
  return false;
}
