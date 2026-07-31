/**
 * @project AncestorTree
 * @file src/hooks/use-events.ts
 * @description React Query hooks for events data
 * @version 1.2.0
 * @updated 2026-07-27
 */

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PEOPLE_SEARCH_DEBOUNCE_MS } from '@constants';
import { getEvents, getEventsForCalendar, getEvent, getEventsByType, createEvent, updateEvent, deleteEvent } from '@lib';
import type { Event, EventType, EventsListFilters } from '@types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters: EventsListFilters) =>
    [
      ...eventKeys.lists(),
      {
        type: filters.type ?? null,
        search: filters.search ?? '',
        page: filters.page,
        pageSize: filters.pageSize,
      },
    ] as const,
  calendar: () => [...eventKeys.all, 'calendar'] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  byType: (type: EventType) => [...eventKeys.all, 'type', type] as const,
};

export function useEvents(filters: EventsListFilters) {
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, PEOPLE_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const queryFilters: EventsListFilters = {
    type: filters.type,
    search: debouncedSearch,
    page: filters.page,
    pageSize: filters.pageSize,
  };

  return useQuery({
    queryKey: eventKeys.list(queryFilters),
    queryFn: () => getEvents(queryFilters),
  });
}

/** Full events set for calendar grid + upcoming banner only. */
export function useEventsCalendar() {
  return useQuery({
    queryKey: eventKeys.calendar(),
    queryFn: getEventsForCalendar,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: eventKeys.detail(id!),
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });
}

export function useEventsByType(type: EventType) {
  return useQuery({
    queryKey: eventKeys.byType(type),
    queryFn: () => getEventsByType(type),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Event, 'id' | 'created_at'>) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<Event, 'id' | 'created_at'>> }) =>
      updateEvent(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.calendar() });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
