/**
 * @project AncestorTree
 * @file src/messages/vi/feed.ts
 * @description Community feed / góc giao lưu
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const Feed = {
  title: 'Góc giao lưu',
  subtitle: 'Chia sẻ tin vui, kỷ niệm và thông báo',
  empty: 'Chưa có bài viết nào',
  emptyFiltered: 'Không có bài viết nào trong mục này',
  emptyCta: 'Hãy là người đầu tiên chia sẻ!',
  itemLabel: 'bài viết',
  anonymous: 'Ẩn danh',
  hidden: 'Đã ẩn',
  showPost: 'Hiện bài viết',
  hidePost: 'Ẩn bài viết',
  compose: {
    placeholder: 'Bạn đang nghĩ gì?',
    post: 'Đăng bài',
    posting: 'Đang đăng...',
    addPhotos: 'Thêm ảnh',
    photosCount: 'Ảnh ({count}/{max})',
    uploadError: 'Lỗi khi tải "{name}" lên',
  },
  types: {
    all: 'Tất cả',
    general: 'Chung',
    photo: 'Ảnh',
    milestone: 'Tin vui',
    memory: 'Kỷ niệm',
    announcement: 'Thông báo',
  },
  actions: {
    like: 'Thích',
    comment: 'Bình luận',
    commentCount: '{count} bình luận',
    delete: 'Xóa bài viết',
    pin: 'Ghim',
    unpin: 'Bỏ ghim',
  },
  comments: {
    placeholder: 'Viết bình luận...',
    empty: 'Chưa có bình luận',
    submit: 'Gửi',
    delete: 'Xóa bình luận',
  },
  toasts: {
    maxImages: 'Tối đa {count} ảnh',
    contentRequired: 'Vui lòng nhập nội dung bài viết',
    postSuccess: 'Đã đăng bài',
    postError: 'Lỗi khi đăng bài',
    likeError: 'Lỗi khi thả tim',
    deleteSuccess: 'Đã xóa bài viết',
    deleteError: 'Lỗi khi xóa bài viết',
    commentError: 'Lỗi khi gửi bình luận',
    commentDeleteError: 'Lỗi khi xóa bình luận',
    hideSuccess: 'Đã ẩn bài viết',
    showSuccess: 'Đã hiện bài viết',
    genericError: 'Lỗi',
  },
  deleteConfirm: {
    title: 'Xóa bài viết?',
    description: 'Bài viết và bình luận sẽ bị xóa vĩnh viễn.',
  },
} as const;
