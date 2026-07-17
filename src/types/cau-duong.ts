import type { Person } from './person';

export interface CauDuongPool {
  id: string;
  name: string;
  ancestor_id: string;
  min_generation: number;
  max_age_lunar: number; // Tuổi âm tối đa (mặc định 70)
  require_married: boolean; // Bắt buộc đã lập gia đình (mặc định true)
  custom_order?: string[]; // Thứ tự xoay vòng tùy chỉnh (person IDs)
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CauDuongCeremonyType = 'tet' | 'ram_thang_gieng' | 'gio_to' | 'ram_thang_bay';
export type CauDuongStatus =
  | 'scheduled'
  | 'completed'
  | 'delegated'
  | 'rescheduled'
  | 'cancelled';

export const CAU_DUONG_CEREMONY_LABELS: Record<CauDuongCeremonyType, string> = {
  tet: 'Tết Nguyên Đán (1/1 AL)',
  ram_thang_gieng: 'Rằm tháng Giêng (15/1 AL)',
  gio_to: 'Giỗ tổ Can Thăng (15/3 AL)',
  ram_thang_bay: 'Rằm tháng Bảy (15/7 AL)',
};

export const CAU_DUONG_CEREMONY_ORDER: CauDuongCeremonyType[] = [
  'tet',
  'ram_thang_gieng',
  'gio_to',
  'ram_thang_bay',
];

export interface CauDuongAssignment {
  id: string;
  pool_id: string;
  year: number;
  ceremony_type: CauDuongCeremonyType;
  host_person_id?: string; // Người được phân công
  actual_host_person_id?: string; // Người thực sự thực hiện (nếu ủy quyền)
  status: CauDuongStatus;
  scheduled_date?: string; // Ngày dự kiến (dương lịch)
  actual_date?: string; // Ngày thực hiện (nếu đổi)
  reason?: string; // Lý do ủy quyền / đổi ngày
  notes?: string;
  rotation_index?: number; // Vị trí trong danh sách DFS khi phân công
  created_by?: string;
  created_at: string;
  updated_at: string;
}

/** Thành viên đủ điều kiện làm Cầu đương (kết quả DFS) */
export interface CauDuongEligibleMember {
  person: Person;
  dfsIndex: number; // Thứ tự trong danh sách DFS (0-based)
  ageLunar: number; // Tuổi âm hiện tại
  isMarried: boolean; // Đã lập gia đình (là cha trong bảng families)
}
