/**
 * @project AncestorTree
 * @file src/types/spouse.ts
 * @description Types for bulk spouse entry / linking
 * @version 1.0.0
 * @updated 2026-08-09
 */

/** Payload for saving a missing spouse — link existing or create new. */
export type SpouseSavePayload =
  | { existingPersonId: string; displayName: string }
  | { fullName: string; birthYear?: number };
