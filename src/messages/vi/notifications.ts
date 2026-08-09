/**
 * @project AncestorTree
 * @file src/messages/vi/notifications.ts
 * @description In-app notifications
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Notifications = {
  title: 'Thông báo',
  subtitle: 'Cập nhật hoạt động gần đây',
  empty: 'Chưa có thông báo',
  markAllRead: 'Đã đọc tất cả',
  markRead: 'Đánh dấu đã đọc',
  viewAll: 'Xem tất cả thông báo',
  deleteError: 'Lỗi khi xóa thông báo',
  unreadCount: '{count} chưa đọc',
  itemLabel: 'thông báo',
  bell: {
    ariaLabel: 'Thông báo',
    unread: '{count} chưa đọc',
  },
  types: {
    post_comment: 'Bình luận',
    post_like: 'Thích',
    new_post: 'Bài mới',
    account_verified: 'Xác nhận',
    event_reminder: 'Sự kiện',
    new_member: 'Thành viên',
    system: 'Hệ thống',
  },
} as const;
