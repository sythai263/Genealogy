/**
 * @project AncestorTree
 * @file src/constants/users.ts
 * @description Shared constants for admin user management (labels via Admin.users.roles / Layout.roles)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { UserRole } from '@types';

export const USER_ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  editor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export const USER_ROLE_ORDER: UserRole[] = ['admin', 'editor', 'viewer'];
