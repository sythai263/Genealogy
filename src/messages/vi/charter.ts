/**
 * @project AncestorTree
 * @file src/messages/vi/charter.ts
 * @description Clan charter / hương ước
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Charter = {
  title: 'Hương ước Dòng họ',
  subtitle: 'Gia huấn, quy ước và lời dặn dò từ tổ tiên',
  empty: 'Chưa có bài viết',
  add: 'Thêm bài viết',
  edit: 'Sửa bài viết',
  featured: 'Nổi bật',
  featuredTitle: 'Hương ước dòng họ',
  featuredSubtitle: 'Gia huấn và quy ước truyền thống',
  viewAll: 'Xem tất cả',
  categories: {
    gia_huan: 'Gia huấn',
    quy_uoc: 'Quy ước',
    loi_dan: 'Lời dặn con cháu',
  },
  form: {
    title: 'Tiêu đề',
    category: 'Danh mục',
    content: 'Nội dung',
    isFeatured: 'Nổi bật',
    version: 'Phiên bản',
    sortOrder: 'Thứ tự',
    titlePlaceholder: 'Về đạo Hiếu',
    contentPlaceholder: 'Nội dung bài viết...',
  },
  toasts: {
    fieldsRequired: 'Vui lòng điền tiêu đề và nội dung',
    addSuccess: 'Đã thêm bài viết',
    addError: 'Lỗi khi thêm bài viết',
    updateSuccess: 'Đã cập nhật bài viết',
    updateError: 'Lỗi khi cập nhật',
    deleteSuccess: 'Đã xóa bài viết',
    deleteError: 'Lỗi khi xóa',
  },
  deleteConfirm: {
    title: 'Xóa bài viết?',
    description: 'Bài viết sẽ bị xóa vĩnh viễn.',
  },
} as const;
