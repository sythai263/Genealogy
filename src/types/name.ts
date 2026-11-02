/**
 * @project AncestorTree
 * @file src/types/name.ts
 * @description name_meanings row + related enums for the public name
 *              dictionary and community submissions
 * @version 1.0.0
 * @updated 2026-10-30
 */

export type NameGender = 'male' | 'female' | 'both';
export type NameStatus = 'pending' | 'approved';

export interface NameMeaning {
  id: string;
  name: string;
  gender: NameGender;
  meaning: string;
  /** 1 → 3-word full name, 2 → 4-word full name */
  name_word_count: 1 | 2;
  status: NameStatus;
  contributor_name: string | null;
  contributor_note: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for a community name submission (always pending). */
export interface NameSubmission {
  name: string;
  gender: NameGender;
  meaning: string;
  contributor_name?: string;
  contributor_note?: string;
}
