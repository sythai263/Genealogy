/**
 * @project AncestorTree
 * @file src/constants/users.ts
 * @description Shared constants for admin user management
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { UserRole } from '@types';

export interface UserRoleMeta {
  label: string;
  color: string;
  description: string;
}

export const USER_ROLE_META: Record<UserRole, UserRoleMeta> = {
  admin: {
    label: 'Quản trị viên',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Toàn quyền quản trị hệ thống',
  },
  editor: {
    label: 'Biên tập viên',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Thêm, sửa, xóa dữ liệu thành viên',
  },
  viewer: {
    label: 'Người xem',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    description: 'Chỉ xem thông tin, không chỉnh sửa',
  },
};
