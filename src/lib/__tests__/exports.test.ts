import type { Family, Person } from '@types';
import { describe, expect, it } from 'vitest';
import { generateCsv } from '../csv-export';
import { generateGedcom, validateGedcom } from '../gedcom-export';
import { generateMarkdown } from '../markdown-export';
import type { TreeData } from '../supabase-data';

function makePerson(overrides: Partial<Person> & Pick<Person, 'id' | 'display_name'>): Person {
  return {
    handle: overrides.id,
    gender: 1,
    generation: 1,
    is_living: true,
    is_patrilineal: true,
    privacy_level: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeFamily(overrides: Partial<Family> & Pick<Family, 'id'>): Family {
  return {
    handle: overrides.id,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const FATHER = makePerson({
  id: 'p-father',
  display_name: 'Nguyễn Văn Cha',
  birth_year: 1950,
});
const MOTHER = makePerson({
  id: 'p-mother',
  display_name: 'Trần Thị Mẹ',
  gender: 2,
  birth_year: 1955,
});
const CHILD = makePerson({
  id: 'p-child',
  display_name: 'Nguyễn Văn Con',
  generation: 2,
  birth_year: 1980,
});
const PRIVATE_PERSON = makePerson({
  id: 'p-private',
  display_name: 'Người Bí Mật',
  privacy_level: 2,
});

const FAMILY = makeFamily({
  id: 'f-1',
  father_id: FATHER.id,
  mother_id: MOTHER.id,
});

const TREE: TreeData = {
  people: [FATHER, MOTHER, CHILD, PRIVATE_PERSON],
  families: [FAMILY],
  children: [{ family_id: FAMILY.id, person_id: CHILD.id, sort_order: 1 }],
};

describe('generateGedcom', () => {
  it('produces a valid GEDCOM 7.0 document', () => {
    const gedcom = generateGedcom(TREE);
    expect(gedcom).toContain('HEAD');
    expect(gedcom).toContain('GEDC');
    expect(gedcom).toContain('VERS 7.0');
    expect(gedcom).toContain('TRLR');
    expect(validateGedcom(gedcom).valid).toBe(true);
  });

  it('excludes privacy_level=2 people', () => {
    const gedcom = generateGedcom(TREE);
    expect(gedcom).toContain('/Nguyễn/');
    expect(gedcom).not.toContain('Bí Mật');
  });
});

describe('validateGedcom', () => {
  it('flags invalid content', () => {
    const result = validateGedcom('this is not gedcom');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('generateCsv', () => {
  it('emits a header row plus one line per non-private person', () => {
    const csv = generateCsv(TREE);
    const lines = csv.split('\n').filter((line) => line.trim());
    // privacy_level=2 rows are filtered out, same as GEDCOM export
    const publicCount = TREE.people.filter((p) => p.privacy_level !== 2).length;
    expect(lines.length).toBe(publicCount + 1);
    expect(lines[0]).toContain('Họ tên');
  });
});

describe('generateMarkdown', () => {
  it('groups members by generation', () => {
    const md = generateMarkdown(TREE);
    expect(md).toContain('Đời 1');
    expect(md).toContain('Đời 2');
    expect(md).toContain('Nguyễn Văn Cha');
    expect(md).toContain('Nguyễn Văn Con');
  });
});
