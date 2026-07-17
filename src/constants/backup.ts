import type { BackupInterval, IncludeMedia } from '@types';

export const BACKUP_TABLE_NAMES: Record<string, string> = {
  people: 'Thành viên',
  families: 'Gia đình',
  children: 'Con cái',
  contributions: 'Đề xuất',
  events: 'Sự kiện',
  media: 'Hình ảnh',
  achievements: 'Vinh danh',
  fund_transactions: 'Giao dịch quỹ',
  scholarships: 'Học bổng',
  clan_articles: 'Hương ước',
  cau_duong_pools: 'Nhóm cầu đương',
  cau_duong_assignments: 'Lịch cầu đương',
  clan_documents: 'Tài liệu',
};

export const BACKUP_INTERVAL_LABELS: Record<BackupInterval, string> = {
  off: 'Tắt',
  daily: 'Hàng ngày',
  weekly: 'Hàng tuần',
  monthly: 'Hàng tháng',
};

export const BACKUP_MEDIA_OPTIONS: {
  value: IncludeMedia;
  label: string;
  description: string;
}[] = [
  { value: 'skip', label: 'Bỏ qua', description: 'Chỉ dữ liệu, không có ảnh' },
  {
    value: 'reference',
    label: 'Liên kết',
    description: 'Lưu đường dẫn ảnh (khuyến nghị)',
  },
  {
    value: 'inline',
    label: 'Nhúng ảnh',
    description: 'Đính kèm toàn bộ ảnh vào ZIP',
  },
];

export const IS_DESKTOP_MODE =
  process.env.NEXT_PUBLIC_DESKTOP_MODE === 'true';
