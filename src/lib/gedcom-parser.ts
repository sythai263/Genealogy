/**
 * @project AncestorTree
 * @file src/lib/gedcom-parser.ts
 * @description GEDCOM 7.0 / 5.5.1 parser — line lexer, continuations,
 *              INDI/FAM record readers (pure, no app types)
 * @version 1.0.0
 * @updated 2026-10-29
 */

// ─── Parser Types ───────────────────────────────────────────────────────────

export interface GedcomIndividual {
  xref: string;
  name: { given: string; surname: string; full: string };
  sex: 'M' | 'F' | 'U';
  birth: { date?: string; place?: string };
  death: { date?: string; place?: string };
  occupation?: string;
  note?: string;
  familyAsChild: string[];
  familyAsSpouse: string[];
}

export interface GedcomFamily {
  xref: string;
  husband?: string;
  wife?: string;
  children: string[];
  marriage: { date?: string; place?: string };
}

export interface GedcomHeader {
  version: string;
  source?: string;
  charset?: string;
}

export interface GedcomParseResult {
  header: GedcomHeader;
  individuals: GedcomIndividual[];
  families: GedcomFamily[];
  errors: string[];
}

// ─── Parser ─────────────────────────────────────────────────────────────────

export interface GedcomLine {
  level: number;
  xref?: string;
  tag: string;
  value?: string;
}

export function parseLine(raw: string): GedcomLine | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // GEDCOM line: LEVEL [XREF] TAG [VALUE]
  const match = trimmed.match(/^(\d+)\s+(?:(@[^@]+@)\s+)?(\S+)(?:\s+(.*))?$/);
  if (!match) return null;

  return {
    level: parseInt(match[1], 10),
    xref: match[2],
    tag: match[3],
    value: match[4],
  };
}

export function collectContinuations(lines: GedcomLine[], startIdx: number, level: number): { text: string; nextIdx: number } {
  let text = lines[startIdx].value || '';
  let idx = startIdx + 1;

  while (idx < lines.length && lines[idx].level > level) {
    const line = lines[idx];
    if (line.tag === 'CONT') {
      text += '\n' + (line.value || '');
    } else if (line.tag === 'CONC') {
      // GEDCOM 5.5.1 continuation without newline
      text += (line.value || '');
    }
    idx++;
  }

  return { text, nextIdx: idx };
}

export function parseGedcomDate(dateStr?: string): { date?: string; year?: number } {
  if (!dateStr) return {};

  // Try full date: DD MMM YYYY
  const fullMatch = dateStr.match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{3,4})/);
  if (fullMatch) {
    const months: Record<string, string> = {
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
    };
    const month = months[fullMatch[2]] || '01';
    const day = fullMatch[1].padStart(2, '0');
    return { date: `${fullMatch[3]}-${month}-${day}`, year: parseInt(fullMatch[3], 10) };
  }

  // Year only
  const yearMatch = dateStr.match(/(\d{3,4})/);
  if (yearMatch) {
    return { year: parseInt(yearMatch[1], 10) };
  }

  return {};
}

export const MAX_GEDCOM_SIZE = 10 * 1024 * 1024; // 10MB — defense-in-depth (OWASP A05)

export function parseGedcom(content: string): GedcomParseResult {
  const errors: string[] = [];

  if (content.length > MAX_GEDCOM_SIZE) {
    errors.push(`File quá lớn (${(content.length / 1024 / 1024).toFixed(1)}MB, tối đa 10MB)`);
    return {
      header: { version: 'unknown' },
      individuals: [],
      families: [],
      errors,
    };
  }

  // Strip BOM
  const stripped = content.replace(/^\uFEFF/, '');
  const rawLines = stripped.split(/\r?\n/);

  const gedcomLines: GedcomLine[] = [];
  for (let i = 0; i < rawLines.length; i++) {
    const parsed = parseLine(rawLines[i]);
    if (parsed) gedcomLines.push(parsed);
  }

  if (gedcomLines.length === 0) {
    return { header: { version: 'unknown' }, individuals: [], families: [], errors: ['File rỗng hoặc không phải định dạng GEDCOM'] };
  }

  // Parse header
  const header: GedcomHeader = { version: 'unknown' };
  let idx = 0;

  // Find HEAD
  if (gedcomLines[0]?.tag === 'HEAD') {
    idx = 1;
    while (idx < gedcomLines.length && gedcomLines[idx].level > 0) {
      const line = gedcomLines[idx];
      if (line.tag === 'VERS' && line.level === 2) {
        header.version = line.value || 'unknown';
      }
      if (line.tag === 'SOUR' && line.level === 1) {
        header.source = line.value;
      }
      if (line.tag === 'CHAR' && line.level === 1) {
        header.charset = line.value;
      }
      idx++;
    }
  }

  // Parse records
  const individuals: GedcomIndividual[] = [];
  const families: GedcomFamily[] = [];

  while (idx < gedcomLines.length) {
    const line = gedcomLines[idx];

    if (line.level === 0 && line.tag === 'INDI' && line.xref) {
      const indi = parseIndividual(gedcomLines, idx, line.xref, errors);
      individuals.push(indi.individual);
      idx = indi.nextIdx;
      continue;
    }

    if (line.level === 0 && line.tag === 'FAM' && line.xref) {
      const fam = parseFamilyRecord(gedcomLines, idx, line.xref);
      families.push(fam.family);
      idx = fam.nextIdx;
      continue;
    }

    idx++;
  }

  return { header, individuals, families, errors };
}

export function parseIndividual(
  lines: GedcomLine[],
  startIdx: number,
  xref: string,
  errors: string[],
): { individual: GedcomIndividual; nextIdx: number } {
  const indi: GedcomIndividual = {
    xref,
    name: { given: '', surname: '', full: '' },
    sex: 'U',
    birth: {},
    death: {},
    familyAsChild: [],
    familyAsSpouse: [],
  };

  let idx = startIdx + 1;
  while (idx < lines.length && lines[idx].level > 0) {
    const line = lines[idx];

    switch (line.tag) {
      case 'NAME': {
        const nameStr = line.value || '';
        // Parse "Given /Surname/" format
        const nameMatch = nameStr.match(/^(.*?)\s*\/([^/]*)\//);
        if (nameMatch) {
          indi.name.given = nameMatch[1].trim();
          indi.name.surname = nameMatch[2].trim();
          indi.name.full = `${indi.name.surname} ${indi.name.given}`.trim();
        } else {
          indi.name.full = nameStr.trim();
        }
        // Check for GIVN/SURN sub-tags
        let j = idx + 1;
        while (j < lines.length && lines[j].level > line.level) {
          if (lines[j].tag === 'GIVN') indi.name.given = lines[j].value || '';
          if (lines[j].tag === 'SURN') indi.name.surname = lines[j].value || '';
          j++;
        }
        if (indi.name.surname && indi.name.given && !indi.name.full.includes(indi.name.surname)) {
          indi.name.full = `${indi.name.surname} ${indi.name.given}`;
        }
        idx = j;
        continue;
      }
      case 'SEX':
        indi.sex = (line.value === 'M' || line.value === 'F') ? line.value : 'U';
        break;
      case 'BIRT': {
        let j = idx + 1;
        while (j < lines.length && lines[j].level > line.level) {
          if (lines[j].tag === 'DATE') indi.birth.date = lines[j].value;
          if (lines[j].tag === 'PLAC') indi.birth.place = lines[j].value;
          j++;
        }
        idx = j;
        continue;
      }
      case 'DEAT': {
        let j = idx + 1;
        while (j < lines.length && lines[j].level > line.level) {
          if (lines[j].tag === 'DATE') indi.death.date = lines[j].value;
          if (lines[j].tag === 'PLAC') indi.death.place = lines[j].value;
          j++;
        }
        idx = j;
        continue;
      }
      case 'OCCU':
        indi.occupation = line.value;
        break;
      case 'NOTE': {
        const result = collectContinuations(lines, idx, line.level);
        indi.note = result.text;
        idx = result.nextIdx;
        continue;
      }
      case 'FAMC':
        if (line.value) indi.familyAsChild.push(line.value);
        break;
      case 'FAMS':
        if (line.value) indi.familyAsSpouse.push(line.value);
        break;
    }
    idx++;
  }

  if (!indi.name.full) {
    errors.push(`INDI ${xref}: tên trống`);
  }

  return { individual: indi, nextIdx: idx };
}

export function parseFamilyRecord(
  lines: GedcomLine[],
  startIdx: number,
  xref: string,
): { family: GedcomFamily; nextIdx: number } {
  const family: GedcomFamily = {
    xref,
    children: [],
    marriage: {},
  };

  let idx = startIdx + 1;
  while (idx < lines.length && lines[idx].level > 0) {
    const line = lines[idx];

    switch (line.tag) {
      case 'HUSB':
        family.husband = line.value;
        break;
      case 'WIFE':
        family.wife = line.value;
        break;
      case 'CHIL':
        if (line.value) family.children.push(line.value);
        break;
      case 'MARR': {
        let j = idx + 1;
        while (j < lines.length && lines[j].level > line.level) {
          if (lines[j].tag === 'DATE') family.marriage.date = lines[j].value;
          if (lines[j].tag === 'PLAC') family.marriage.place = lines[j].value;
          j++;
        }
        idx = j;
        continue;
      }
    }
    idx++;
  }

  return { family, nextIdx: idx };
}

