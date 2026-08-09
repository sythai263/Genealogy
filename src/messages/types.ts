/**
 * @project AncestorTree
 * @file src/messages/types.ts
 * @description AppMessages type derived from Vietnamese source of truth
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { vi } from './vi';

/**
 * Widen leaf string literals to `string` so other locales can translate
 * while keeping the exact nested key structure of `typeof vi`.
 */
type WidenMessages<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenMessages<U>[]
    : T extends object
      ? { [K in keyof T]: WidenMessages<T[K]> }
      : T;

/** Message tree shape — structure from Vietnamese (`vi`), values as `string`. */
export type AppMessages = WidenMessages<typeof vi>;
