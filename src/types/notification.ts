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
