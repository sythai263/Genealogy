/**
 * @project AncestorTree
 * @file src/messages/en/settings.ts
 * @description Profile and security settings
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Settings = {
  profile: {
    title: 'Profile',
    subtitle: 'Your account information',
    fullName: 'Display name',
    fullNamePlaceholder: 'Jane Doe',
    nameUnset: 'Name not set',
    email: 'Email',
    emailVerified: 'Email verified',
    emailReadonly: 'Email cannot be changed from this screen.',
    role: 'Role',
    roleHint: '— assigned by an administrator',
    avatar: 'Avatar',
    save: 'Save changes',
    toastSuccess: 'Profile saved',
    toastError: 'Failed to save',
    language: 'Language',
    languageDesc: 'Choose interface language',
    createdAt: 'Created',
    updatedAt: 'Last updated',
  },
  password: {
    title: 'Change password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    newPasswordPlaceholder: 'At least 8 characters',
    confirmPasswordPlaceholder: 'Re-enter new password',
    submit: 'Change password',
    submitting: 'Changing...',
    toastSuccess: 'Password changed successfully',
    toastError: 'Failed to change password',
  },
  security: {
    title: 'Security (MFA)',
    pageTitle: 'Account security',
    subtitle: 'Two-factor authentication with an authenticator app',
    pageSubtitle: 'Manage two-factor authentication (MFA)',
    totpTitle: 'Two-factor authentication (TOTP)',
    totpDescription:
      'Protect your account with codes from Google Authenticator or a similar app.',
    mfaEnabled: 'Two-factor authentication is on',
    mfaEnabledActive: 'Two-factor authentication is enabled',
    mfaDisabled: 'Two-factor authentication is off',
    mfaDisabledHint:
      'Two-factor authentication is not enabled. Turn it on to better protect your account.',
    enable: 'Enable two-factor authentication',
    disable: 'Disable two-factor authentication',
    disableShort: 'Disable',
    active: 'Active',
    enrolling: 'Starting...',
    verifying: 'Verifying...',
    confirmEnable: 'Confirm & enable',
    scanQr: 'Scan the QR code with Google Authenticator',
    step1Title: 'Step 1: Scan QR code',
    step1Body:
      'Open Google Authenticator → Add account → Scan the QR code below.',
    step2Label: 'Step 2: Enter authentication code ({count} digits)',
    manualEntry: "Can't scan the QR code? Enter manually",
    qrAlt: 'QR code for Google Authenticator',
    enterCode: 'Enter the 6-digit code to confirm',
    verify: 'Confirm',
    info: 'When two-factor authentication is on, each sign-in requires a 6-digit code from your authenticator app (Google Authenticator, Authy, ...) in addition to your password.',
    unenrollTitle: 'Disable two-factor authentication?',
    unenrollDescription:
      'After disabling, the account is protected by password only. You can turn it back on anytime.',
    unenrolling: 'Disabling...',
    toastEnableSuccess: 'Two-factor authentication enabled!',
    toastEnableError: 'Failed to start enrollment',
    toastInvalidCode: 'Incorrect code. Please try again.',
    toastDisableSuccess: 'Two-factor authentication disabled.',
    toastDisableError: 'Failed to disable authentication',
  },
  roles: {
    admin: 'Administrator',
    editor: 'Editor',
    viewer: 'Viewer',
  },
  version: 'Version {version}',
} as const satisfies AppMessages['Settings'];
