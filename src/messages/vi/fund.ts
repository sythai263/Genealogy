/**
 * @project AncestorTree
 * @file src/messages/vi/fund.ts
 * @description Education fund / quỹ khuyến học
 * @version 1.1.0
 * @updated 2026-08-09
 */

export const Fund = {
  title: 'Quỹ khuyến học',
  subtitle: 'Thu chi minh bạch, học bổng cho con cháu',
  empty: 'Chưa có giao dịch',
  balance: 'Số dư quỹ',
  transactions: 'Giao dịch',
  scholarships: 'Học bổng / Khen thưởng',
  addTransaction: 'Thêm giao dịch',
  addScholarship: 'Thêm đề cử',
  income: 'Thu',
  expense: 'Chi',
  exportCsv: 'Xuất CSV',
  exporting: 'Đang xuất...',
  printReport: 'In báo cáo',
  exportError: 'Lỗi khi xuất báo cáo',
  anonymous: 'Ẩn danh',
  unknown: 'Không rõ',
  tabs: {
    scholarships: 'Học bổng & Khen thưởng',
    donations: 'Đóng góp',
    history: 'Lịch sử',
  },
  stats: {
    balance: 'Số dư',
    income: 'Tổng thu',
    expense: 'Tổng chi',
    scholarshipCount: 'Suất học bổng',
  },
  scholarshipsSection: {
    title: 'Học bổng ({count})',
    empty: 'Chưa có học bổng nào',
    itemLabel: 'học bổng',
  },
  rewardsSection: {
    title: 'Khen thưởng ({count})',
    empty: 'Chưa có khen thưởng nào',
    itemLabel: 'khen thưởng',
  },
  donationsSection: {
    title: 'Danh sách đóng góp ({count})',
    empty: 'Chưa có đóng góp nào',
    itemLabel: 'đóng góp',
  },
  historySection: {
    title: 'Lịch sử giao dịch ({count})',
    empty: 'Chưa có giao dịch nào',
    itemLabel: 'giao dịch',
  },
  scholarshipStatuses: {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    paid: 'Đã cấp',
  },
  scholarshipTypes: {
    hoc_bong: 'Học bổng',
    khen_thuong: 'Khen thưởng',
  },
  form: {
    amount: 'Số tiền',
    amountRequired: 'Số tiền (VNĐ) *',
    type: 'Loại',
    category: 'Danh mục',
    description: 'Mô tả',
    note: 'Ghi chú',
    date: 'Ngày',
    person: 'Thành viên',
    status: 'Trạng thái',
    year: 'Năm học',
    donor: 'Người đóng góp',
    gradeLevel: 'Lớp / Cấp',
    school: 'Trường',
    reason: 'Lý do',
    categories: {
      dong_gop: 'Đóng góp',
      hoc_bong: 'Học bổng',
      khen_thuong: 'Khen thưởng',
      other: 'Khác',
    },
  },
  toasts: {
    amountInvalid: 'Số tiền phải lớn hơn 0',
    fieldsRequired: 'Vui lòng điền đủ thông tin (số tiền > 0)',
    txSuccess: 'Đã thêm giao dịch',
    txError: 'Lỗi khi thêm giao dịch',
    schSuccess: 'Đã thêm đề cử',
    schError: 'Lỗi khi thêm đề cử',
    updateError: 'Lỗi khi cập nhật',
    deleteSuccess: 'Đã xóa',
    deleteError: 'Lỗi',
  },
  report: {
    title: 'Báo cáo quỹ',
    clanName: 'CHI TỘC Lê Sỹ',
    header: 'BÁO CÁO QUỸ KHUYẾN HỌC - {clanName}',
    exportDate: 'Ngày xuất: {date}',
    overview: '=== TỔNG QUAN ===',
    totalIncome: 'Tổng thu: {amount}',
    totalExpense: 'Tổng chi: {amount}',
    balanceLine: 'Số dư: {amount}',
    scholarshipsHeading: '=== HỌC BỔNG & KHEN THƯỞNG ===',
    scholarshipColumns:
      'Họ tên,Loại,Số tiền,Năm học,Trường,Khối/Lớp,Trạng thái',
    transactionsHeading: '=== LỊCH SỬ GIAO DỊCH ===',
    transactionColumns: 'Ngày,Loại,Người/Mô tả,Số tiền,Năm học',
  },
} as const;
