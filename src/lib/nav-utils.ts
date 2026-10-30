/**
 * @project AncestorTree
 * @file src/lib/nav-utils.ts
 * @description Sidebar navigation helpers — active-route matching
 * @version 1.0.0
 * @updated 2026-10-30
 */

/** `/admin` matches exactly; every other entry also matches its sub-routes. */
export function isNavItemActive(url: string, pathname: string): boolean {
  if (url === '/admin') return pathname === '/admin';
  return pathname === url || pathname.startsWith(`${url}/`);
}
