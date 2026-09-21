/**
 * @project AncestorTree
 * @file src/constants/features.ts
 * @description Compile-time feature flags — these override runtime settings
 *              (e.g. clan_settings.login_config) and hide/guard the related UI.
 * @version 1.0.0
 * @updated 2026-09-21
 */

export const FEATURES = {
  /**
   * Email + password sign-in. When false, the login page only offers
   * OTP/magic-link, the admin login-method checkbox is hidden, and
   * `signInWithPassword` calls are rejected in the auth provider.
   */
  passwordLogin: false,
} as const;
