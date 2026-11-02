/**
 * @project AncestorTree
 * @file src/constants/names.ts
 * @description Name dictionary constants — gender/word-length filters and
 *              quick surname-prefix choices for the clan
 * @version 1.0.0
 * @updated 2026-10-30
 */

/** Full-name word count filter: 3 = H + đệm + 1-word name, 4 = + 2-word name. */
export const NAME_WORD_COUNT_OPTIONS = [
  { value: '3', nameWordCount: 1 },
  { value: '4', nameWordCount: 2 },
] as const;

/** Quick surname prefixes, biased to the clan — user may also type freely. */
export const NAME_PREFIX_OPTIONS = {
  male: ['Lê Sỹ', 'Lê'],
  female: ['Lê Thị', 'Lê'],
  both: ['Lê', 'Lê Sỹ', 'Lê Thị'],
} as const;
