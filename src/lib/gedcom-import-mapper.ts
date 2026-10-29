/**
 * @project AncestorTree
 * @file src/lib/gedcom-import-mapper.ts
 * @description Maps parsed GEDCOM records to AncestorTree person/family rows
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { Family, Person } from '@types';
import { parseGedcomDate, type GedcomParseResult } from './gedcom-parser';

// ─── Mapper ─────────────────────────────────────────────────────────────────

export interface ImportMapping {
  people: Omit<Person, 'id' | 'created_at' | 'updated_at'>[];
  families: Omit<Family, 'id' | 'created_at' | 'updated_at'>[];
  children: { family_handle: string; person_handle: string; sort_order: number }[];
  xrefToHandle: Map<string, string>;
}

export function xrefToHandle(xref: string): string {
  return xref.replace(/@/g, '').toLowerCase();
}

export function mapGedcomToAncestorTree(parseResult: GedcomParseResult): ImportMapping {
  const { individuals, families } = parseResult;

  const xrefMap = new Map<string, string>();
  for (const indi of individuals) {
    xrefMap.set(indi.xref, xrefToHandle(indi.xref));
  }
  for (const fam of families) {
    xrefMap.set(fam.xref, xrefToHandle(fam.xref));
  }

  // Auto-calculate generations via DFS
  // Build parent→child graph from families
  const childToParentXrefs = new Map<string, string[]>();
  for (const fam of families) {
    const parents: string[] = [];
    if (fam.husband) parents.push(fam.husband);
    if (fam.wife) parents.push(fam.wife);
    for (const childXref of fam.children) {
      const existing = childToParentXrefs.get(childXref) || [];
      childToParentXrefs.set(childXref, [...existing, ...parents]);
    }
  }

  // Find roots (no parents)
  const allXrefs = new Set(individuals.map(i => i.xref));
  const rootXrefs = [...allXrefs].filter(x => !childToParentXrefs.has(x));

  // BFS from roots to assign generations
  const generationMap = new Map<string, number>();
  const parentToChildXrefs = new Map<string, string[]>();
  for (const fam of families) {
    for (const childXref of fam.children) {
      if (fam.husband) {
        const list = parentToChildXrefs.get(fam.husband) || [];
        list.push(childXref);
        parentToChildXrefs.set(fam.husband, list);
      }
      if (fam.wife) {
        const list = parentToChildXrefs.get(fam.wife) || [];
        list.push(childXref);
        parentToChildXrefs.set(fam.wife, list);
      }
    }
  }

  const queue: Array<{ xref: string; gen: number }> = rootXrefs.map(x => ({ xref: x, gen: 1 }));
  while (queue.length > 0) {
    const { xref, gen } = queue.shift()!;
    if (generationMap.has(xref)) continue;
    generationMap.set(xref, gen);
    const childXrefs = parentToChildXrefs.get(xref) || [];
    for (const child of childXrefs) {
      if (!generationMap.has(child)) {
        queue.push({ xref: child, gen: gen + 1 });
      }
    }
  }
  // Assign gen 1 to anyone without a generation (isolated nodes)
  for (const indi of individuals) {
    if (!generationMap.has(indi.xref)) generationMap.set(indi.xref, 1);
  }

  // Map individuals → people
  const people: ImportMapping['people'] = individuals.map(indi => {
    const birth = parseGedcomDate(indi.birth.date);
    const death = parseGedcomDate(indi.death.date);
    const nameParts = indi.name.full.trim().split(/\s+/);
    const surname = indi.name.surname || (nameParts.length > 1 ? nameParts[0] : '');
    const firstName = indi.name.given || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : indi.name.full);

    return {
      handle: xrefToHandle(indi.xref),
      display_name: indi.name.full || `Unknown (${indi.xref})`,
      first_name: firstName,
      surname,
      gender: indi.sex === 'M' ? 1 : indi.sex === 'F' ? 2 : 1, // U/unknown defaults to male
      generation: generationMap.get(indi.xref) || 1,
      birth_date: birth.date,
      birth_year: birth.year,
      birth_place: indi.birth.place,
      death_date: death.date,
      death_year: death.year,
      death_place: indi.death.place,
      is_living: !indi.death.date && !indi.death.place,
      is_patrilineal: true,
      occupation: indi.occupation,
      biography: indi.note,
      privacy_level: 1,
    } as ImportMapping['people'][0];
  });

  // Map families
  const mappedFamilies: ImportMapping['families'] = families.map(fam => {
    const marriage = parseGedcomDate(fam.marriage.date);
    return {
      handle: xrefToHandle(fam.xref),
      father_id: fam.husband ? xrefMap.get(fam.husband) : undefined,
      mother_id: fam.wife ? xrefMap.get(fam.wife) : undefined,
      marriage_date: marriage.date,
      marriage_place: fam.marriage.place,
      sort_order: 0,
    } as ImportMapping['families'][0];
  });

  // Map children
  const mappedChildren: ImportMapping['children'] = [];
  for (const fam of families) {
    const famHandle = xrefToHandle(fam.xref);
    for (let i = 0; i < fam.children.length; i++) {
      const childHandle = xrefMap.get(fam.children[i]);
      if (childHandle) {
        mappedChildren.push({
          family_handle: famHandle,
          person_handle: childHandle,
          sort_order: i + 1,
        });
      }
    }
  }

  return { people, families: mappedFamilies, children: mappedChildren, xrefToHandle: xrefMap };
}

