import type { Person } from './person';

export interface Family {
  id: string;
  handle: string;
  father_id?: string;
  mother_id?: string;
  marriage_date?: string;
  marriage_place?: string;
  divorce_date?: string;
  notes?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyWithRelations extends Family {
  father?: Person;
  mother?: Person;
  children: Person[];
}

export interface Child {
  id: string;
  family_id: string;
  person_id: string;
  sort_order: number;
  created_at: string;
}

export interface PersonRelations {
  parentFamily: {
    family: Family;
    father: Person | null;
    mother: Person | null;
    siblings: Person[];
  } | null;
  ownFamilies: Array<{
    family: Family;
    spouse: Person | null;
    children: Person[];
  }>;
}

/** Half-family waiting for the other spouse (bulk entry worklist). */
export interface FamilyMissingSpouse {
  family_id: string;
  /** The parent already recorded on the family. */
  person: Person;
  /** Which side is filled in — the opposite side is the one to enter. */
  knownRole: 'father' | 'mother';
  childrenCount: number;
}

export interface FamiliesMissingSpouseFilters {
  chi?: number;
  generation?: number;
  page: number;
  pageSize: 20 | 30 | 50;
}
