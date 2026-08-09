/**
 * @project AncestorTree
 * @file src/messages/en/relationship.ts
 * @description Find relationship
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Relationship = {
  title: 'Find relationship between 2 people',
  subtitle:
    'Select 2 people to find kinship across 18 ancestral generations — Sino-Vietnamese terms with glosses (e.g. Tằng Tổ (great-grandfather), Huyền Tôn (great-great-grandson))',
  personA: 'Person 1',
  personB: 'Person 2',
  find: 'Find relationship',
  finding: 'Searching...',
  empty: 'Select two people to find their relationship',
  noPath: 'No relationship found between these two people',
  pathFound: 'Path ({steps} degrees):',
  samePerson: 'Please select two different people',
  selectTitle: 'Select people',
  selectHint: 'Type a name to search (at least 2 characters)',
  result: 'Result',
  commonAncestor: 'Common ancestor',
  viewOnTree: 'View on family tree',
  generationBadge: 'Gen. {generation}',
  relations: {
    father: 'Father',
    mother: 'Mother',
    child: 'Child',
    spouse: 'Spouse',
    sibling: 'Sibling',
  },
} as const satisfies AppMessages['Relationship'];
