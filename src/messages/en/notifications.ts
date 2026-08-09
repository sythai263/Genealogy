/**
 * @project AncestorTree
 * @file src/messages/en/notifications.ts
 * @description In-app notifications
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Notifications = {
  title: 'Notifications',
  subtitle: 'Recent activity updates',
  empty: 'No notifications yet',
  markAllRead: 'Mark all as read',
  markRead: 'Mark as read',
  viewAll: 'View all notifications',
  deleteError: 'Failed to delete notification',
  unreadCount: '{count} unread',
  itemLabel: 'notifications',
  bell: {
    ariaLabel: 'Notifications',
    unread: '{count} unread',
  },
  types: {
    post_comment: 'Comment',
    post_like: 'Like',
    new_post: 'New post',
    account_verified: 'Verified',
    event_reminder: 'Event',
    new_member: 'Member',
    system: 'System',
  },
} as const satisfies AppMessages['Notifications'];
