/**
 * @project AncestorTree
 * @file src/constants/settings.ts
 * @description Shared constants for profile and security settings (role labels via Layout.roles)
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { UserRole } from '@types';

/** Role badge colors — labels from Layout.roles / Settings.roles */
export const PROFILE_ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-800',
  editor: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export const APP_VERSION = process.env.npm_package_version ?? '2.5.0';
export const APP_VERSION_DISPLAY = `v${APP_VERSION}`;

export const MFA_ISSUER = 'AncestorTree';
export const MFA_FRIENDLY_NAME = 'Google Authenticator';
export const MFA_TOTP_CODE_LENGTH = 6;
export const MFA_FACTORS_QUERY_KEY = ['mfa-totp-factors'] as const;
