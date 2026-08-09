/**
 * @project AncestorTree
 * @file src/types/notification.ts
 * @description Type definitions for in-app notifications
 * @version 1.1.0
 * @updated 2026-07-18
 */

export type NotificationType =
  | 'post_comment'
  | 'post_like'
  | 'new_post'
  | 'account_verified'
  | 'event_reminder'
  | 'new_member'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  actor_id: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface NotificationsListFilters {
  page: number;
  pageSize: 20 | 30 | 50;
}
