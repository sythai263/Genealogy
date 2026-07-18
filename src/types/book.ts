/**
 * @project AncestorTree
 * @file src/types/book.ts
 * @description Types for printable family chronicle book view
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { Person } from './person';

export interface BookPerson {
  person: Person;
  father?: Person;
  mother?: Person;
  spouses: Person[];
  children: Person[];
  zodiacYear?: string;
}

export interface BookBranch {
  chi: number | null;
  people: BookPerson[];
}

export interface BookChapter {
  generation: number;
  title: string;
  branches: BookBranch[];
}
