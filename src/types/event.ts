/**
 * @project AncestorTree
 * @file src/types/event.ts
 * @description Type definitions for clan events / memorial calendar
 * @version 1.1.0
 * @updated 2026-07-18
 */

import type { Person } from './person';

export type EventType = 'gio' | 'hop_ho' | 'le_tet' | 'other';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date?: string;
  event_lunar?: string;
  event_type: EventType;
  person_id?: string;
  location?: string;
  recurring: boolean;
  created_at: string;
}

export interface EventsListFilters {
  type?: EventType;
  search?: string;
  page: number;
  pageSize: 20 | 30 | 50;
}

export interface UpcomingEvent {
  event: Event;
  person?: Person;
  nextDate: Date;
  daysUntil: number;
  lunarDisplay: string;
  isAuto: boolean;
}
