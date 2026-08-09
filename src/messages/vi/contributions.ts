/**
 * @project AncestorTree
 * @file src/messages/vi/contributions.ts
 * @description Contribution / đề xuất chỉnh sửa
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Contributions = {
  title: 'Đề xuất chỉnh sửa',
  subtitle: 'Gửi yêu cầu cập nhật thông tin thành viên',
  empty: 'Chưa có đề xuất nào',
  emptyOwn: 'Bạn chưa có đề xuất nào',
  submit: 'Gửi đề xuất',
  loginRequired: 'Vui lòng đăng nhập để gửi đề xuất chỉnh sửa',
  loginAction: 'Đăng nhập',
  newSuggestion: 'Đề xuất mới',
  dialogDescription:
    'Gửi yêu cầu cập nhật thông tin. Quản trị viên sẽ xem xét và phê duyệt.',
  count: '{count} đề xuất',
  itemLabel: 'đề xuất',
  reasonPrefix: 'Lý do: {reason}',
  reviewNotesPrefix: 'Ghi chú duyệt: {notes}',
  submitting: 'Đang gửi...',
  statuses: {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
  },
  changeTypes: {
    create: 'Thêm mới',
    update: 'Cập nhật',
    delete: 'Xóa',
  },
  changeTypeForm: {
    create: 'Thêm thành viên mới',
    update: 'Cập nhật thông tin',
    delete: 'Xóa thành viên',
  },
  fields: {
    display_name: 'Họ tên',
    phone: 'Số điện thoại',
    email: 'Email',
    address: 'Địa chỉ',
    birth_year: 'Năm sinh',
    death_year: 'Năm mất',
    death_lunar: 'Ngày giỗ (ÂL)',
    occupation: 'Nghề nghiệp',
    biography: 'Tiểu sử',
    notes: 'Ghi chú',
  },
  form: {
    changeType: 'Loại thay đổi',
    targetPerson: 'Thành viên liên quan',
    reason: 'Lý do thay đổi',
    changes: 'Thay đổi đề xuất',
    addChange: 'Thêm trường',
    field: 'Trường',
    newValue: 'Giá trị mới',
    fieldPlaceholder: 'Trường...',
    valuePlaceholder: 'Giá trị mới...',
    reasonPlaceholder: 'Giải thích tại sao cần thay đổi...',
  },
  toasts: {
    needLogin: 'Vui lòng đăng nhập',
    success: 'Đã gửi đề xuất chỉnh sửa',
    error: 'Lỗi khi gửi đề xuất',
  },
} as const;
