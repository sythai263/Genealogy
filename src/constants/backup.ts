import type { BackupInterval } from '@types';

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

/** 500 MB max backup import file */
export const BACKUP_MAX_IMPORT_SIZE = 500 * 1024 * 1024;

/** All tables exported in backup ZIP (profiles skipped — UUID remapping) */
export const BACKUP_EXPORT_TABLES = [
  'people',
  'families',
  'children',
  'contributions',
  'events',
  'media',
  'achievements',
  'fund_transactions',
  'scholarships',
  'clan_articles',
  'cau_duong_pools',
  'cau_duong_assignments',
  'clan_documents',
] as const;
