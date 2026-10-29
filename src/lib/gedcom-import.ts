/**
 * @project AncestorTree
 * @file src/lib/gedcom-import.ts
 * @description GEDCOM 7.0 / 5.5.1 import: parser, mapper, validator
 * @version 1.0.0
 * @updated 2026-03-09
 */

import type { TreeData } from './supabase-data-stats';
import {
  mapGedcomToAncestorTree,
  type ImportMapping,
} from './gedcom-import-mapper';
import {
  validateImport,
  type ImportValidation,
} from './gedcom-import-validator';
import { parseGedcom, type GedcomParseResult } from './gedcom-parser';

// ─── Import Summary ─────────────────────────────────────────────────────────

export interface ImportSummary {
  parseResult: GedcomParseResult;
  mapping: ImportMapping;
  validation: ImportValidation;
}

export function prepareImport(content: string, existingData?: TreeData): ImportSummary {
  const parseResult = parseGedcom(content);
  const mapping = mapGedcomToAncestorTree(parseResult);
  const validation = validateImport(parseResult, mapping, existingData);
  return { parseResult, mapping, validation };
}
