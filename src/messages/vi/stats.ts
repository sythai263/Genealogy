/**
 * @project AncestorTree
 * @file src/messages/vi/stats.ts
 * @description Statistics dashboard
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Stats = {
  title: 'Thống kê gia phả',
  subtitle: 'Biểu đồ phân bố và số liệu tổng hợp',
  empty: 'Chưa đủ dữ liệu để thống kê',
  cards: {
    totalPeople: 'Tổng thành viên',
    generations: 'Số đời',
    families: 'Số gia đình',
    living: 'Còn sống',
    deceased: 'Đã mất',
    avgChildren: 'TB con/gia đình',
    childlessRate: 'Tuyệt tự: {rate}%',
  },
  homeCard: {
    members: 'Thành viên',
    generations: 'Thế hệ',
    branches: 'Chi/Nhánh',
    living: 'Còn sống',
  },
  charts: {
    byGeneration: 'Phân bố theo đời',
    byChi: 'Phân bố theo chi',
    byGender: 'Tỷ lệ giới tính',
    livingStatus: 'Tỷ lệ còn sống / đã mất',
    peopleCount: 'Số người',
    male: 'Nam',
    female: 'Nữ',
  },
} as const;
