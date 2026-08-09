/**
 * @project AncestorTree
 * @file src/messages/en/stats.ts
 * @description Statistics dashboard
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Stats = {
  title: 'Family tree statistics',
  subtitle: 'Distribution charts and summary figures',
  empty: 'Not enough data for statistics',
  cards: {
    totalPeople: 'Total people',
    generations: 'Generations',
    families: 'Families',
    living: 'Living',
    deceased: 'Deceased',
    avgChildren: 'Avg children/family',
    childlessRate: 'Childless: {rate}%',
  },
  homeCard: {
    members: 'Members',
    generations: 'Generations',
    branches: 'Branches',
    living: 'Living',
  },
  charts: {
    byGeneration: 'By generation',
    byChi: 'By branch',
    byGender: 'Gender ratio',
    livingStatus: 'Living / deceased ratio',
    peopleCount: 'People',
    male: 'Male',
    female: 'Female',
  },
} as const satisfies AppMessages['Stats'];
