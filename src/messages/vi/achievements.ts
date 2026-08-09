/**
 * @project AncestorTree
 * @file src/messages/vi/achievements.ts
 * @description Achievements / vinh danh
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Achievements = {
  title: 'Vinh danh con cháu',
  subtitle: 'Ghi nhận thành tích nổi bật của các thành viên trong dòng họ',
  empty: 'Chưa có thành tích nào',
  add: 'Thêm thành tích',
  edit: 'Sửa thành tích',
  featured: 'Nổi bật',
  featuredSection: 'Thành tích nổi bật',
  listTitle: 'Danh sách vinh danh ({count})',
  searchPlaceholder: 'Tìm kiếm...',
  itemLabel: 'thành tích',
  personMeta: '{name} · Đời {generation}',
  personMetaChi: '{name} · Đời {generation} · Chi {chi}',
  categories: {
    all: 'Tất cả',
    hoc_tap: 'Học tập',
    su_nghiep: 'Sự nghiệp',
    cong_hien: 'Cống hiến',
    other: 'Khác',
  },
  form: {
    person: 'Thành viên',
    title: 'Tiêu đề',
    category: 'Danh mục',
    description: 'Mô tả',
    year: 'Năm',
    awardedBy: 'Trao bởi',
    isFeatured: 'Nổi bật (hiển thị trên trang chủ)',
    titlePlaceholder: 'Thủ khoa Đại học Bách Khoa',
    awardedByPlaceholder: 'Sở GD&ĐT Thanh Hóa',
  },
  toasts: {
    addSuccess: 'Đã thêm thành tích',
    addError: 'Lỗi khi thêm thành tích',
    updateSuccess: 'Đã cập nhật thành tích',
    updateError: 'Lỗi khi cập nhật',
    deleteSuccess: 'Đã xóa thành tích',
    deleteError: 'Lỗi khi xóa',
  },
  deleteConfirm: {
    title: 'Xóa thành tích?',
    description: 'Thành tích sẽ bị xóa vĩnh viễn.',
  },
} as const;
