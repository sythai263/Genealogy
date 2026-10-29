/**
 * @project AncestorTree
 * @file src/lib/supabase-data-events.ts
 * @description Supabase data access — memorial calendar events CRUD
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getPaginationRange } from '@constants';
import type {
    Event,
    EventsListFilters,
    EventType,
    PaginatedResult,
} from '@types';
import { supabase } from './supabase';
import { escapeIlikePattern } from './utils';

// ═══════════════════════════════════════════════════════════════════════════
// Events (Memorial Calendar)
// ═══════════════════════════════════════════════════════════════════════════

export async function getEvents(
  filters: EventsListFilters
): Promise<PaginatedResult<Event>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('event_date', { ascending: true });

  if (filters.type) {
    query = query.eq('event_type', filters.type);
  }

  const trimmed = filters.search?.trim();
  if (trimmed) {
    query = query.ilike('title', `%${escapeIlikePattern(trimmed)}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/**
 * Full events list for calendar / upcoming banner only.
 * List UIs must use paginated `getEvents` instead.
 */
export async function getEventsForCalendar(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getEvent(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function getEventsByType(eventType: EventType): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('event_type', eventType)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createEvent(input: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, input: Partial<Omit<Event, 'id' | 'created_at'>>): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

