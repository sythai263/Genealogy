/**
 * @project AncestorTree
 * @file src/lib/gedcom-export.ts
 * @description GEDCOM 7.0 export utility with Vietnamese extension tags
 * @version 2.0.0
 * @updated 2026-03-09
 */

import {
  GEDCOM_MONTHS,
  buildFamilyRecord,
  buildPersonRecord,
} from './gedcom-export-builder';
import type { TreeData } from './supabase-data-stats';

export function generateGedcom(data: TreeData): string {
  // Filter out private people (privacy_level === 2) — PII fields (phone, email, etc.) NOT exported
  const people = data.people.filter(p => p.privacy_level !== 2);
  const peopleSet = new Set(people.map(p => p.id));

  // Build family lookup maps
  const familyMap = new Map<string, string[]>();
  const childFamilyMap = new Map<string, string[]>();
  const familyChildrenMap = new Map<string, string[]>();

  for (const family of data.families) {
    if (family.father_id && peopleSet.has(family.father_id)) {
      const existing = familyMap.get(family.father_id) || [];
      existing.push(family.id);
      familyMap.set(family.father_id, existing);
    }
    if (family.mother_id && peopleSet.has(family.mother_id)) {
      const existing = familyMap.get(family.mother_id) || [];
      existing.push(family.id);
      familyMap.set(family.mother_id, existing);
    }
  }

  for (const child of data.children) {
    if (peopleSet.has(child.person_id)) {
      const existing = childFamilyMap.get(child.person_id) || [];
      existing.push(child.family_id);
      childFamilyMap.set(child.person_id, existing);
    }
    const famChildren = familyChildrenMap.get(child.family_id) || [];
    famChildren.push(child.person_id);
    familyChildrenMap.set(child.family_id, famChildren);
  }

  // Build GEDCOM 7.0 content
  const now = new Date();
  const dateStr = `${now.getDate()} ${GEDCOM_MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  const sections: string[] = [];

  // Header — GEDCOM 7.0 format
  sections.push([
    '0 HEAD',
    '1 GEDC',
    '2 VERS 7.0',
    '1 SOUR AncestorTree',
    '2 VERS 2.6.0',
    '2 NAME Gia Pha Dien Tu',
    `1 DATE ${dateStr}`,
    '1 SUBM @SUB1@',
    '1 SCHMA',
    '2 TAG _GENER https://ancestortree.info/gedcom/generation',
    '2 TAG _CHI https://ancestortree.info/gedcom/chi-branch',
  ].join('\n'));

  // Submitter
  sections.push([
    '0 @SUB1@ SUBM',
    '1 NAME AncestorTree Export',
  ].join('\n'));

  // Individual records
  for (const person of people) {
    sections.push(buildPersonRecord(person, familyMap, childFamilyMap));
  }

  // Family records
  for (const family of data.families) {
    const hasVisibleParent =
      (family.father_id && peopleSet.has(family.father_id)) ||
      (family.mother_id && peopleSet.has(family.mother_id));
    if (!hasVisibleParent) continue;

    const childrenIds = familyChildrenMap.get(family.id) || [];
    sections.push(buildFamilyRecord(family, childrenIds, peopleSet));
  }

  // Trailer
  sections.push('0 TRLR');

  // GEDCOM 7.0: UTF-8 with BOM
  return '\uFEFF' + sections.join('\n') + '\n';
}

export interface GedcomValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateGedcom(content: string): GedcomValidationResult {
  const errors: string[] = [];
  const stripped = content.replace(/^\uFEFF/, '');

  if (!stripped.startsWith('0 HEAD')) {
    errors.push('Missing HEAD record');
  }
  if (!stripped.trimEnd().endsWith('0 TRLR')) {
    errors.push('Missing TRLR record');
  }

  const indiRefs = new Set<string>();
  const famRefs = new Set<string>();
  const lines = stripped.split('\n');

  for (const line of lines) {
    const indiMatch = line.match(/^0 (@I[^@]+@) INDI/);
    if (indiMatch) indiRefs.add(indiMatch[1]);

    const famMatch = line.match(/^0 (@F[^@]+@) FAM/);
    if (famMatch) famRefs.add(famMatch[1]);
  }

  for (const line of lines) {
    const husbMatch = line.match(/^1 HUSB (@I[^@]+@)/);
    if (husbMatch && !indiRefs.has(husbMatch[1])) {
      errors.push(`HUSB reference ${husbMatch[1]} not found`);
    }
    const wifeMatch = line.match(/^1 WIFE (@I[^@]+@)/);
    if (wifeMatch && !indiRefs.has(wifeMatch[1])) {
      errors.push(`WIFE reference ${wifeMatch[1]} not found`);
    }
    const chilMatch = line.match(/^1 CHIL (@I[^@]+@)/);
    if (chilMatch && !indiRefs.has(chilMatch[1])) {
      errors.push(`CHIL reference ${chilMatch[1]} not found`);
    }
    const famsMatch = line.match(/^1 FAMS (@F[^@]+@)/);
    if (famsMatch && !famRefs.has(famsMatch[1])) {
      errors.push(`FAMS reference ${famsMatch[1]} not found`);
    }
    const famcMatch = line.match(/^1 FAMC (@F[^@]+@)/);
    if (famcMatch && !famRefs.has(famcMatch[1])) {
      errors.push(`FAMC reference ${famcMatch[1]} not found`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function downloadGedcom(content: string, filename?: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const name = filename || `ancestortree-${date}.ged`;
  const blob = new Blob([content], { type: 'text/x-gedcom;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
