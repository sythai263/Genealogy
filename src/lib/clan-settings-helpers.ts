/**
 * @project AncestorTree
 * @file src/lib/clan-settings-helpers.ts
 * @description Pure helpers for clan settings admin UI
 * @version 1.0.0
 * @updated 2026-08-09
 */

export function deriveClanInitial(name: string): string {
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[parts.length - 1][0] ?? '?')
    : (parts[0][0] ?? '?');
}

export function deriveClanSubtitle(fullName: string, shortName: string): string {
  return fullName.startsWith(shortName)
    ? fullName.slice(shortName.length).trim()
    : '';
}
