/**
 * @project AncestorTree
 * @file src/constants/notifications.ts
 * @description Shared constants for notification types (labels via next-intl)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { NotificationType } from '@types';

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  post_comment: '💬',
  post_like: '❤️',
  new_post: '📝',
  account_verified: '✅',
  event_reminder: '📅',
  new_member: '👤',
  system: '🔔',
};

export const NOTIFICATION_FALLBACK_ICON = '🔔';
