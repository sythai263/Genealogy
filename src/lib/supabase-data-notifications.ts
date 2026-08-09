/**
 * @project AncestorTree
 * @file src/lib/supabase-data-notifications.ts
 * @description Data layer for in-app notifications
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { supabase } from './supabase';
import { getPaginationRange } from '@constants';
import type { Notification, NotificationsListFilters, PaginatedResult } from '@types';

/** Paginated notifications list for the full `/notifications` page. */
export async function getNotifications(
  filters: NotificationsListFilters
): Promise<PaginatedResult<Notification>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: [], total: 0 };

  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/** Small, unbounded-page fetch for the header bell dropdown. */
export async function getRecentNotifications(limit = 10): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
