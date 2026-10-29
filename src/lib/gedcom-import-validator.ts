/**
 * @project AncestorTree
 * @file src/lib/gedcom-import-validator.ts
 * @description Validates a mapped GEDCOM import — duplicate detection
 *              against existing tree data, structural sanity checks
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { DuplicatePair, Person } from '@types';
import { findDuplicates } from './duplicate-detection';
import type { ImportMapping } from './gedcom-import-mapper';
import type { GedcomParseResult } from './gedcom-parser';
import type { TreeData } from './supabase-data-stats';

// ─── Validator ──────────────────────────────────────────────────────────────

export interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    individualCount: number;
    familyCount: number;
    duplicateCount: number;
  };
  duplicates: DuplicatePair[];
}

export function validateImport(
  parseResult: GedcomParseResult,
  mapping: ImportMapping,
  existingData?: TreeData,
): ImportValidation {
  const errors: string[] = [...parseResult.errors];
  const warnings: string[] = [];

  // Check for empty import
  if (parseResult.individuals.length === 0) {
    errors.push('Không tìm thấy dữ liệu cá nhân (INDI) trong file');
  }

  // Validate names and gender
  const unknownSexCount = parseResult.individuals.filter(i => i.sex !== 'M' && i.sex !== 'F').length;
  if (unknownSexCount > 0) {
    warnings.push(`${unknownSexCount} cá nhân không rõ giới tính (SEX U) — mặc định là Nam`);
  }
  for (const person of mapping.people) {
    if (!person.display_name || person.display_name.startsWith('Unknown')) {
      warnings.push(`"${person.handle}": tên không xác định`);
    }
  }

  // Check for orphan references
  const indiXrefs = new Set(parseResult.individuals.map(i => i.xref));
  for (const fam of parseResult.families) {
    if (fam.husband && !indiXrefs.has(fam.husband)) {
      errors.push(`FAM ${fam.xref}: HUSB ${fam.husband} không tồn tại`);
    }
    if (fam.wife && !indiXrefs.has(fam.wife)) {
      errors.push(`FAM ${fam.xref}: WIFE ${fam.wife} không tồn tại`);
    }
    for (const child of fam.children) {
      if (!indiXrefs.has(child)) {
        errors.push(`FAM ${fam.xref}: CHIL ${child} không tồn tại`);
      }
    }
  }

  // Duplicate check against existing data
  let duplicates: DuplicatePair[] = [];
  if (existingData && existingData.people.length > 0) {
    // Create fake TreeData combining existing + import for duplicate detection
    const importIds = new Set<string>();
    const importPeople: Person[] = mapping.people.map((p) => {
      const id = crypto.randomUUID();
      importIds.add(id);
      return {
        ...p,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Person;
    });

    const combinedData: TreeData = {
      people: [...existingData.people, ...importPeople],
      families: existingData.families,
      children: existingData.children,
    };

    // Only keep duplicates that cross import/existing boundary
    const allDuplicates = findDuplicates(combinedData);
    duplicates = allDuplicates.filter(d =>
      (importIds.has(d.personA.id) && !importIds.has(d.personB.id)) ||
      (!importIds.has(d.personA.id) && importIds.has(d.personB.id))
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      individualCount: parseResult.individuals.length,
      familyCount: parseResult.families.length,
      duplicateCount: duplicates.length,
    },
    duplicates,
  };
}

