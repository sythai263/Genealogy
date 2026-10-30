/**
 * @project AncestorTree
 * @file src/lib/supabase-data-spouse-families.ts
 * @description Supabase data access — spouse/couple family creation with
 *              half-family absorption and parent role column mapping
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type {
    Family,
    Person,
} from '@types';
import { supabase } from './supabase';
import { removeChildFromFamily } from './supabase-data-families';

function parentRoleColumns(gender: 1 | 2): { own: 'father_id' | 'mother_id'; other: 'father_id' | 'mother_id' } {
  return gender === 1
    ? { own: 'father_id', other: 'mother_id' }
    : { own: 'mother_id', other: 'father_id' };
}

/** Families where this person is a parent and the other parent is already set. */
async function countCompleteSpouseFamilies(personId: string, personGender: 1 | 2): Promise<number> {
  const { own, other } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('id')
    .eq(own, personId)
    .not(other, 'is', null);
  if (error) throw error;
  return data?.length ?? 0;
}

/** Single-parent family for this person (other parent still null). */
async function findHalfFamily(personId: string, personGender: 1 | 2): Promise<Family | null> {
  const { own, other } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq(own, personId)
    .is(other, null)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Family | null) ?? null;
}

async function fillMissingParent(
  familyId: string,
  fatherId: string,
  motherId: string
): Promise<Family> {
  const { data, error } = await supabase
    .from('families')
    .update({ father_id: fatherId, mother_id: motherId })
    .eq('id', familyId)
    .select()
    .single();
  if (error) throw error;
  return data as Family;
}

async function nextFamilySortOrder(personId: string, personGender: 1 | 2): Promise<number> {
  const { own } = parentRoleColumns(personGender);
  const { data, error } = await supabase
    .from('families')
    .select('sort_order')
    .eq(own, personId)
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.length ? data[0].sort_order + 1 : 0;
}

async function insertCoupleFamily(
  fatherId: string,
  motherId: string,
  sortOrder: number
): Promise<Family> {
  const handle = `fam-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from('families')
    .insert({
      handle,
      father_id: fatherId,
      mother_id: motherId,
      sort_order: sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Family;
}

/** Move children from a half-family into the couple family, then drop the empty half-family. */
async function migrateChildrenBetweenFamilies(
  fromFamilyId: string,
  toFamilyId: string
): Promise<void> {
  if (fromFamilyId === toFamilyId) return;

  const [{ data: sourceChildren, error: sourceError }, { data: targetChildren, error: targetError }] =
    await Promise.all([
      supabase
        .from('children')
        .select('person_id, sort_order')
        .eq('family_id', fromFamilyId)
        .order('sort_order', { ascending: true }),
      supabase
        .from('children')
        .select('person_id, sort_order')
        .eq('family_id', toFamilyId)
        .order('sort_order', { ascending: true }),
    ]);
  if (sourceError) throw sourceError;
  if (targetError) throw targetError;

  const targetPersonIds = new Set((targetChildren || []).map((r) => r.person_id));
  let nextSort =
    (targetChildren || []).reduce((max, r) => Math.max(max, r.sort_order), -1) + 1;

  for (const row of sourceChildren || []) {
    if (targetPersonIds.has(row.person_id)) {
      await removeChildFromFamily(fromFamilyId, row.person_id);
      continue;
    }

    const { error: moveError } = await supabase
      .from('children')
      .update({ family_id: toFamilyId, sort_order: nextSort })
      .eq('family_id', fromFamilyId)
      .eq('person_id', row.person_id);
    if (moveError) throw moveError;
    targetPersonIds.add(row.person_id);
    nextSort += 1;
  }

  const { error: deleteError } = await supabase.from('families').delete().eq('id', fromFamilyId);
  if (deleteError) throw deleteError;
}

/**
 * Attach any remaining single-parent families of this person into the couple family
 * so existing children become children of the new husband/wife pair.
 */
async function absorbHalfFamilyChildren(
  personId: string,
  personGender: 1 | 2,
  coupleFamilyId: string
): Promise<void> {
  const { own, other } = parentRoleColumns(personGender);
  const { data: halfFamilies, error } = await supabase
    .from('families')
    .select('id')
    .eq(own, personId)
    .is(other, null)
    .neq('id', coupleFamilyId);
  if (error) throw error;

  for (const half of halfFamilies || []) {
    await migrateChildrenBetweenFamilies(half.id, coupleFamilyId);
  }
}

export interface CreateSpouseFamilyOptions {
  /** When set, fill this specific half-family instead of auto-picking. */
  targetFamilyId?: string;
}

/**
 * Link personId (as father if gender=1, mother if gender=2) with spouseId.
 *
 * - First spouse (no complete couple yet): reuse/update a half-family when
 *   possible, create a couple family, and auto-attach existing children from
 *   either side's single-parent families.
 * - Additional spouse (already has ≥1 complete couple): create a separate
 *   family only — do not move children from prior marriages.
 */
export async function createSpouseFamily(
  personId: string,
  personGender: 1 | 2,
  spouseId: string,
  options?: CreateSpouseFamilyOptions
): Promise<Family> {
  const fatherId = personGender === 1 ? personId : spouseId;
  const motherId = personGender === 2 ? personId : spouseId;
  const spouseGender: 1 | 2 = personGender === 1 ? 2 : 1;

  // Return existing family if one already links these two people (prevents duplicates on double-submit)
  const { data: existing } = await supabase
    .from('families')
    .select('*')
    .eq('father_id', fatherId)
    .eq('mother_id', motherId)
    .maybeSingle();
  if (existing) return existing as Family;

  const completeCount = await countCompleteSpouseFamilies(personId, personGender);

  // Second (or later) marriage: always a new separate family — do not touch prior children
  if (completeCount >= 1 && !options?.targetFamilyId) {
    const sortOrder = await nextFamilySortOrder(personId, personGender);
    return insertCoupleFamily(fatherId, motherId, sortOrder);
  }

  // Explicit half-family update (e.g. "Thêm vợ/chồng" on a family missing spouse)
  if (options?.targetFamilyId) {
    const { data: target, error: targetError } = await supabase
      .from('families')
      .select('*')
      .eq('id', options.targetFamilyId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) throw new Error('Không tìm thấy gia đình');

    const belongsToPerson =
      (personGender === 1 && target.father_id === personId) ||
      (personGender === 2 && target.mother_id === personId);
    if (!belongsToPerson) {
      throw new Error('Gia đình không thuộc về thành viên này');
    }

    const missingOther =
      (personGender === 1 && !target.mother_id) || (personGender === 2 && !target.father_id);
    if (!missingOther) {
      throw new Error('Gia đình này đã có vợ/chồng');
    }

    const updated = await fillMissingParent(target.id, fatherId, motherId);
    await absorbHalfFamilyChildren(spouseId, spouseGender, updated.id);
    return updated;
  }

  // First spouse: prefer filling a half-family so existing children stay with the couple
  const personHalf = await findHalfFamily(personId, personGender);
  if (personHalf) {
    const updated = await fillMissingParent(personHalf.id, fatherId, motherId);
    await absorbHalfFamilyChildren(spouseId, spouseGender, updated.id);
    return updated;
  }

  const spouseHalf = await findHalfFamily(spouseId, spouseGender);
  if (spouseHalf) {
    const updated = await fillMissingParent(spouseHalf.id, fatherId, motherId);
    await absorbHalfFamilyChildren(personId, personGender, updated.id);
    return updated;
  }

  // No half-family on either side — create couple, then pull in any stray single-parent kids
  const sortOrder = await nextFamilySortOrder(personId, personGender);
  const created = await insertCoupleFamily(fatherId, motherId, sortOrder);
  await absorbHalfFamilyChildren(personId, personGender, created.id);
  await absorbHalfFamilyChildren(spouseId, spouseGender, created.id);
  return created;
}
