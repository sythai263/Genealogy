/**
 * @project AncestorTree
 * @file src/types/mfa.ts
 * @description MFA / TOTP factor types for security settings
 * @version 1.0.0
 * @updated 2026-07-18
 */

export interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: 'verified' | 'unverified';
}

export interface MfaEnrollState {
  factorId: string;
  qrCode: string;
  secret: string;
}
