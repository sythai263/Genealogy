import type { Person } from './person';

export interface DuplicateScore {
  name: number; // 0-1
  father: number; // 0-1
  birthYear: number; // 0-1
  generation: number; // 0-1
  gender: number; // 0-1
  total: number; // weighted composite 0-1
}

export interface DuplicatePair {
  personA: Person;
  personB: Person;
  score: DuplicateScore;
  level: 'HIGH' | 'MEDIUM';
}
