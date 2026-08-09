/**
 * @project AncestorTree
 * @file src/messages/en/metadata.ts
 * @description Root / page SEO metadata strings
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Metadata = {
  root: {
    titleDefault: 'Digital Family Tree - {clanFullName}',
    titleTemplate: '%s | {clanName} Family Tree',
    description:
      'Digital family tree software for {clanFullName}. Store clan records, interactive tree, and memorial calendar.',
    ogTitle: 'Digital Family Tree - {clanFullName}',
    ogDescription: 'Preserve the essence — Follow in our ancestors’ footsteps',
    keywords:
      'family tree, digital genealogy, clan, pedigree, ancestry',
  },
  landing: {
    title: 'AncestorTree — {clanFullName}',
    description:
      'Digital family tree for {clanFullName}. Interactive tree, lunar calendar, clan management.',
    ogDescription: 'Preserve the essence — Follow in our ancestors’ footsteps',
  },
} as const satisfies AppMessages['Metadata'];
