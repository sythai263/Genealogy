/**
 * @project AncestorTree
 * @file src/types/name.ts
 * @description names + name_meanings rows for the public name dictionary
 *              and community submissions — one name, many meanings
 * @version 1.1.0
 * @updated 2026-10-30
 */

export type NameGender = 'male' | 'female' | 'both';
export type NameStatus = 'pending' | 'approved';

/** name_meanings row — one meaning variant of a name. */
export interface NameMeaningRow {
  id: string;
  name_id: string;
  meaning: string;
  status: NameStatus;
  contributor_name: string | null;
  contributor_note: string | null;
  created_at: string;
}

/** names row plus its meanings (approved only on public pages). */
export interface NameEntry {
  id: string;
  name: string;
  gender: NameGender;
  /** 1 → 3-word full name, 2 → 4-word full name */
  name_word_count: 1 | 2;
  status: NameStatus;
  contributor_name: string | null;
  contributor_note: string | null;
  name_search: string | null;
  created_at: string;
  updated_at: string;
  meanings: NameMeaningRow[];
}

/** Payload for a community name submission (always pending). */
export interface NameSubmission {
  name: string;
  gender: NameGender;
  meaning: string;
  contributor_name?: string;
  contributor_note?: string;
}
