/**
 * @project AncestorTree
 * @file src/constants/auth-paths.ts
 * @description Route policy for the auth proxy — public paths, auth pages,
 *              pending-verification, protected routes, post-login targets
 * @version 1.0.0
 * @updated 2026-10-29
 */

export const publicPaths = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/welcome', '/council', '/ancestral-hall', '/family-tree', '/register-member', '/api/debug', '/api/cron', '/api/ping'];
// Auth pages only: authenticated users are redirected away from these (not from landing or /api/*)
export const authPagePaths = ['/login', '/register', '/forgot-password', '/reset-password'];
// Accessible when authenticated but NOT yet verified by admin
export const pendingVerificationPath = '/pending-verification';
// All main app routes require authentication to protect personal data.
// Note: `/` is public (welcome landing). Do NOT list `/` here — startsWith('/') matches every path.
export const authRequiredPaths = [
  '/people', '/tree', '/directory', '/events',
  '/achievements', '/charter', '/cau-duong', '/contributions',
  '/documents', '/fund', '/admin', '/help', '/settings',
  '/relationship', '/stats', '/feed', '/notifications', '/setup',
];

/** Post-login / app home for authenticated users */
export const APP_HOME_PATH = '/admin';
/** Fallback when user cannot access admin */
export const APP_FALLBACK_PATH = '/tree';

