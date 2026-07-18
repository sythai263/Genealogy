/**
 * @project AncestorTree
 * @file src/constants/contributions.ts
 * @description Shared constants for contribution (đề xuất chỉnh sửa) UI
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { ChangeType, ContributionStatus } from '@types';

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const CONTRIBUTION_STATUS_VARIANTS: Record<
  ContributionStatus,
  'default' | 'secondary' | 'destructive'
> = {
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
};

export const CONTRIBUTION_CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  create: 'Thêm mới',
  update: 'Cập nhật',
  delete: 'Xóa',
};

export const CONTRIBUTION_CHANGE_TYPE_FORM_LABELS: Record<ChangeType, string> = {
  create: 'Thêm thành viên mới',
  update: 'Cập nhật thông tin',
  delete: 'Xóa thành viên',
};

export const CONTRIBUTION_CHANGE_TYPE_ORDER: ChangeType[] = [
  'update',
  'create',
  'delete',
];

export const CONTRIBUTION_FIELD_OPTIONS = [
  { value: 'display_name', label: 'Họ tên' },
  { value: 'phone', label: 'Số điện thoại' },
  { value: 'email', label: 'Email' },
  { value: 'address', label: 'Địa chỉ' },
  { value: 'birth_year', label: 'Năm sinh' },
  { value: 'death_year', label: 'Năm mất' },
  { value: 'death_lunar', label: 'Ngày giỗ (ÂL)' },
  { value: 'occupation', label: 'Nghề nghiệp' },
  { value: 'biography', label: 'Tiểu sử' },
  { value: 'notes', label: 'Ghi chú' },
] as const;

export type ContributionFieldKey =
  (typeof CONTRIBUTION_FIELD_OPTIONS)[number]['value'];

export function getContributionFieldLabel(key: string): string {
  const option = CONTRIBUTION_FIELD_OPTIONS.find((field) => field.value === key);
  return option?.label ?? key;
}

export function isChangeType(value: string): value is ChangeType {
  for (const changeType of CONTRIBUTION_CHANGE_TYPE_ORDER) {
    if (changeType === value) return true;
  }
  return false;
}
