/**
 * @project AncestorTree
 * @file src/messages/vi/directory.ts
 * @description Family directory / contact book
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Directory = {
  title: 'Danh bạ liên lạc',
  subtitle: 'Thông tin liên lạc của các thành viên trong dòng họ',
  empty: 'Chưa có thông tin liên lạc',
  noResults: 'Không tìm thấy thành viên phù hợp',
  searchPlaceholder: 'Tìm theo tên...',
  filterTitle: 'Bộ lọc',
  allGenerations: 'Tất cả đời',
  generationValue: 'Đời {generation}',
  memberCount: '{count} thành viên',
  loginPrompt: 'Đăng nhập để xem đầy đủ',
  maskedShort: 'Ẩn',
  loadError: 'Lỗi khi tải dữ liệu: {message}',
  filters: {
    gender: 'Giới tính',
    status: 'Trạng thái',
    all: 'Tất cả',
    male: 'Nam',
    female: 'Nữ',
    living: 'Còn sống',
    deceased: 'Đã mất',
  },
  fields: {
    phone: 'Điện thoại',
    email: 'Email',
    zalo: 'Zalo',
    facebook: 'Facebook',
    address: 'Địa chỉ',
    generation: 'Đời',
    name: 'Họ tên',
    links: 'Liên kết',
  },
  masked: 'Đăng nhập để xem thông tin liên lạc',
  copySuccess: 'Đã sao chép',
} as const;
