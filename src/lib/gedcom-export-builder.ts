/**
 * @project AncestorTree
 * @file src/lib/gedcom-export-builder.ts
 * @description GEDCOM record builders — xref helpers, date formatting,
 *              INDI/FAM record emission with Vietnamese extension tags
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { Family, Person } from '@types';

export const GEDCOM_MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function personXref(id: string): string {
  return `@I${id.replace(/-/g, '')}@`;
}

function familyXref(id: string): string {
  return `@F${id.replace(/-/g, '')}@`;
}

function formatGedcomDate(dateStr?: string, year?: number): string {
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${GEDCOM_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
  }
  if (year) {
    return String(year);
  }
  return '';
}

/** GEDCOM 7.0 line builder — uses CONT for newlines only (CONC removed in 7.0, max line 4096) */
function gedcomLine(level: number, tag: string, value?: string): string {
  if (value == null) return `${level} ${tag}`;

  const textLines = value.split('\n');
  const output: string[] = [];

  for (let i = 0; i < textLines.length; i++) {
    if (i === 0) {
      output.push(`${level} ${tag} ${textLines[i]}`);
    } else {
      output.push(`${level + 1} CONT ${textLines[i]}`);
    }
  }

  return output.join('\n');
}

/** Split Vietnamese display_name into Given /Surname/ (last-space heuristic) */
function splitVietnameseName(person: Person): { given: string; surname: string } {
  if (person.surname) {
    const given = [person.first_name, person.middle_name].filter(Boolean).join(' ') || person.display_name;
    return { given, surname: person.surname };
  }
  const parts = person.display_name.trim().split(' ');
  if (parts.length <= 1) return { given: person.display_name, surname: '' };
  const surname = parts[0];
  const given = parts.slice(1).join(' ');
  return { given, surname };
}

export function buildPersonRecord(
  person: Person,
  familyMap: Map<string, string[]>,
  childFamilyMap: Map<string, string[]>,
): string {
  const lines: string[] = [];
  const xref = personXref(person.id);

  lines.push(`0 ${xref} INDI`);

  // Name
  const { given, surname } = splitVietnameseName(person);
  lines.push(gedcomLine(1, 'NAME', `${given} /${surname}/`));
  if (given) lines.push(gedcomLine(2, 'GIVN', given));
  if (surname) lines.push(gedcomLine(2, 'SURN', surname));

  // Sex
  lines.push(gedcomLine(1, 'SEX', person.gender === 1 ? 'M' : person.gender === 2 ? 'F' : 'U'));

  // Birth
  const birthDate = formatGedcomDate(person.birth_date, person.birth_year);
  if (birthDate || person.birth_place) {
    lines.push('1 BIRT');
    if (birthDate) lines.push(gedcomLine(2, 'DATE', birthDate));
    if (person.birth_place) lines.push(gedcomLine(2, 'PLAC', person.birth_place));
  }

  // Death
  if (!person.is_living) {
    const deathDate = formatGedcomDate(person.death_date, person.death_year);
    if (deathDate || person.death_place) {
      lines.push('1 DEAT');
      if (deathDate) lines.push(gedcomLine(2, 'DATE', deathDate));
      if (person.death_place) lines.push(gedcomLine(2, 'PLAC', person.death_place));
    } else {
      lines.push('1 DEAT Y');
    }
  }

  // Occupation
  if (person.occupation) {
    lines.push(gedcomLine(1, 'OCCU', person.occupation));
  }

  // Notes (biography + notes)
  const noteText = [person.biography, person.notes].filter(Boolean).join('\n\n');
  if (noteText) {
    lines.push(gedcomLine(1, 'NOTE', noteText));
  }

  // Extension tags — generation and chi branch
  if (person.generation != null) {
    lines.push(gedcomLine(1, '_GENER', String(person.generation)));
  }
  if (person.chi != null) {
    lines.push(gedcomLine(1, '_CHI', String(person.chi)));
  }

  // Family links: as spouse/parent (FAMS)
  const spouseFamilies = familyMap.get(person.id) || [];
  for (const fid of spouseFamilies) {
    lines.push(gedcomLine(1, 'FAMS', familyXref(fid)));
  }

  // Family links: as child (FAMC)
  const childFamilies = childFamilyMap.get(person.id) || [];
  for (const fid of childFamilies) {
    lines.push(gedcomLine(1, 'FAMC', familyXref(fid)));
  }

  return lines.join('\n');
}

export function buildFamilyRecord(
  family: Family,
  childrenIds: string[],
  peopleSet: Set<string>,
): string {
  const lines: string[] = [];
  const xref = familyXref(family.id);

  lines.push(`0 ${xref} FAM`);

  if (family.father_id && peopleSet.has(family.father_id)) {
    lines.push(gedcomLine(1, 'HUSB', personXref(family.father_id)));
  }
  if (family.mother_id && peopleSet.has(family.mother_id)) {
    lines.push(gedcomLine(1, 'WIFE', personXref(family.mother_id)));
  }

  // Marriage
  const marriageDate = formatGedcomDate(family.marriage_date);
  if (marriageDate || family.marriage_place) {
    lines.push('1 MARR');
    if (marriageDate) lines.push(gedcomLine(2, 'DATE', marriageDate));
    if (family.marriage_place) lines.push(gedcomLine(2, 'PLAC', family.marriage_place));
  }

  // Divorce
  if (family.divorce_date) {
    lines.push('1 DIV');
    lines.push(gedcomLine(2, 'DATE', formatGedcomDate(family.divorce_date)));
  }

  // Children (sorted by sort_order via data.children ordering)
  for (const childId of childrenIds) {
    if (peopleSet.has(childId)) {
      lines.push(gedcomLine(1, 'CHIL', personXref(childId)));
    }
  }

  return lines.join('\n');
}

