/**
 * @project AncestorTree
 * @file src/lib/format-utils.ts
 * @description Shared formatting utilities — relative time, initials
 * @version 1.0.0
 * @updated 2026-03-09
 */

import { removeVietnameseTones } from './helper';

export function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function getInitials(name: string): string {
  const normalizedName = removeVietnameseTones(name);

  const parts = normalizedName.trim().split(' ');
  return parts.length > 1
    ? (parts[parts.length - 1][0] ?? '?').toUpperCase()
    : (parts[0][0] ?? '?').toUpperCase();
}

/** Tree card: given name on top; surname + middle name below. */
export interface PersonTreeNameParts {
  givenName: string;
  familyLine: string;
}

export function getPersonTreeNameParts(person: {
  display_name: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
}): PersonTreeNameParts {
  const givenName =
    person.first_name?.trim() ||
    person.display_name.trim().split(/\s+/).at(-1) ||
    person.display_name;

  const familyParts = [person.surname, person.middle_name]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (familyParts.length > 0) {
    return { givenName, familyLine: familyParts.join(' ') };
  }

  const tokens = person.display_name.trim().split(/\s+/);
  if (tokens.length <= 1) {
    return { givenName, familyLine: '' };
  }
  return {
    givenName: tokens[tokens.length - 1],
    familyLine: tokens.slice(0, -1).join(' '),
  };
}

export function formatBackupDate(value: Date | string | null): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
