/**
 * @project AncestorTree
 * @file src/constants/notifications.ts
 * @description Shared constants for notification types
 * @version 1.0.0
 * @updated 2026-07-18
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

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  post_comment: 'Bình luận',
  post_like: 'Thích',
  new_post: 'Bài mới',
  account_verified: 'Xác nhận',
  event_reminder: 'Sự kiện',
  new_member: 'Thành viên',
  system: 'Hệ thống',
};

export const NOTIFICATION_FALLBACK_ICON = '🔔';
