/**
 * @project AncestorTree
 * @file src/lib/spouse-utils.ts
 * @description Build a spouse person record from a Vietnamese full name
 * @version 1.0.0
 * @updated 2026-08-07
 */

import type { CreatePersonInput, Person } from '@types';
import { removeVietnameseTones } from './helper';

/** Vietnamese naming order: first token = họ, last token = tên, rest = đệm. */
export function splitVietnameseName(fullName: string): {
  surname?: string;
  middle_name?: string;
  first_name?: string;
} {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return {};
  if (tokens.length === 1) return { first_name: tokens[0] };
  return {
    surname: tokens[0],
    middle_name: tokens.slice(1, -1).join(' ') || undefined,
    first_name: tokens[tokens.length - 1],
  };
}

export function buildPersonHandle(fullName: string): string {
  const slug =
    removeVietnameseTones(fullName)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'nguoi';
  return `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

interface SpouseInputOptions {
  fullName: string;
  birthYear?: number;
  /** The person this spouse is being married to — inherits đời, chi, privacy. */
  marriedTo: Person;
}

/**
 * A spouse marries into the clan at the same generation as their partner and is
 * never patrilineal. Đời, chi and privacy are inherited so the new record does
 * not fall outside existing tree filters.
 */
export function buildSpousePersonInput({
  fullName,
  birthYear,
  marriedTo,
}: SpouseInputOptions): CreatePersonInput {
  const name = fullName.trim();
  return {
    handle: buildPersonHandle(name),
    display_name: name,
    ...splitVietnameseName(name),
    gender: marriedTo.gender === 1 ? 2 : 1,
    generation: marriedTo.generation,
    chi: marriedTo.chi,
    birth_year: birthYear,
    is_living: marriedTo.is_living,
    is_patrilineal: false,
    privacy_level: marriedTo.privacy_level,
  };
}
