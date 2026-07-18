/**
 * @project AncestorTree
 * @file src/constants/settings.ts
 * @description Shared constants for profile and security settings
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { UserRole } from '@types';

export const PROFILE_ROLE_LABELS: Record<
  UserRole,
  { label: string; color: string }
> = {
  admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-800' },
  editor: { label: 'Biên tập viên', color: 'bg-blue-100 text-blue-800' },
  viewer: { label: 'Người xem', color: 'bg-gray-100 text-gray-800' },
};

export const MFA_ISSUER = 'AncestorTree';
export const MFA_FRIENDLY_NAME = 'Google Authenticator';
export const MFA_TOTP_CODE_LENGTH = 6;
