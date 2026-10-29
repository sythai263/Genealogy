/**
 * @project AncestorTree
 * @file src/lib/pathfinding-inlaw.ts
 * @description Relationship pathfinding — in-law (dâu/rể) labeling through
 *              siblings and parents' siblings
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { Person } from '@types';
import { getSiblings } from './pathfinding-graph';
import { isOlder, markKinship } from './pathfinding-kinship';


/**
 * Quan hệ dâu/rể qua anh chị em ruột.
 * VD: Thái (em trai Mạnh) ↔ Trang (vợ Mạnh) → chị dâu / em chồng.
 */
export function describeSiblingInLaw(
  personA: Person,
  personB: Person,
  parentMap: Map<string, string[]>,
  spouseMap: Map<string, string[]>,
  personMap: Map<string, Person>,
): { description: string; detail: string } | null {
  // Case 1: B là vợ/chồng của anh/chị/em ruột của A
  for (const sibling of getSiblings(personA.id, parentMap, personMap)) {
    const spouses = spouseMap.get(sibling.id) || [];
    if (!spouses.includes(personB.id)) continue;

    const towardInLaw = labelSiblingSpouse(personA, sibling);
    const towardSibling = labelSpouseSibling(personB, sibling, personA);
    return {
      description: `${personA.display_name} gọi ${personB.display_name} là ${towardInLaw}`,
      detail: `${personB.display_name} gọi ${personA.display_name} là ${towardSibling}. Qua ${sibling.display_name} (anh/chị/em ruột)`,
    };
  }

  // Case 2: B là anh/chị/em ruột của vợ/chồng của A
  for (const spouseId of spouseMap.get(personA.id) || []) {
    const spouse = personMap.get(spouseId);
    if (!spouse) continue;
    const spouseSiblings = getSiblings(spouse.id, parentMap, personMap);
    if (!spouseSiblings.some((s) => s.id === personB.id)) continue;

    const towardSibling = labelSpouseSibling(personA, spouse, personB);
    const towardInLaw = labelSiblingSpouse(personB, spouse);
    return {
      description: `${personA.display_name} gọi ${personB.display_name} là ${towardSibling}`,
      detail: `${personB.display_name} gọi ${personA.display_name} là ${towardInLaw}. Qua ${spouse.display_name} (vợ/chồng)`,
    };
  }

  return null;
}

/** A gọi vợ/chồng của anh/chị/em (sibling) bằng gì. */
export function labelSiblingSpouse(ego: Person, sibling: Person): string {
  const siblingOlder = isOlder(sibling, ego);

  if (sibling.gender === 1) {
    // Vợ của anh/em trai
    if (siblingOlder === true) return markKinship('Tẩu', 'chị dâu — vợ của anh trai');
    if (siblingOlder === false) return markKinship('Đệ tức', 'em dâu — vợ của em trai');
    return markKinship('Tẩu/Đệ tức', 'chị dâu/em dâu — vợ anh em trai');
  }

  // Chồng của chị/em gái
  if (siblingOlder === true) return markKinship('Tỷ phu', 'anh rể — chồng của chị gái');
  if (siblingOlder === false) return markKinship('Muội phu', 'em rể — chồng của em gái');
  return markKinship('Tỷ/Muội phu', 'anh rể/em rể — chồng chị em gái');
}

/** In-law (đã kết hôn với spouse) gọi anh/chị/em của spouse bằng gì. */
export function labelSpouseSibling(inLaw: Person, spouse: Person, sibling: Person): string {
  const siblingOlder = isOlder(sibling, spouse);

  if (spouse.gender === 1) {
    // Anh/chị/em bên chồng
    if (sibling.gender === 1) {
      if (siblingOlder === true) return markKinship('Đại bá', 'anh chồng');
      if (siblingOlder === false) return markKinship('Tiểu thúc', 'em chồng');
      return markKinship('Huynh/Đệ (chồng)', 'anh/em chồng');
    }
    if (siblingOlder === true) return markKinship('Đại tỷ', 'chị chồng');
    if (siblingOlder === false) return markKinship('Tiểu muội', 'em gái chồng');
    return markKinship('Tỷ/Muội (chồng)', 'chị/em chồng');
  }

  // Anh/chị/em bên vợ
  if (sibling.gender === 1) {
    if (siblingOlder === true) return markKinship('Ngoại huynh', 'anh vợ');
    if (siblingOlder === false) return markKinship('Ngoại đệ', 'em vợ');
    return markKinship('Huynh/Đệ (vợ)', 'anh/em vợ');
  }
  if (siblingOlder === true) return markKinship('Ngoại tỷ', 'chị vợ');
  if (siblingOlder === false) return markKinship('Ngoại muội', 'em gái vợ');
  return markKinship('Tỷ/Muội (vợ)', 'chị/em vợ');
}

/**
 * Vợ/chồng của chú·bác·cô·cậu·dì.
 * VD: vợ của chú = thím (Thẩm); vợ của bác = bác gái (Bá mẫu);
 *     vợ của cậu = mợ; chồng của cô/dì = dượng.
 */
export function describeParentsSiblingSpouse(
  personA: Person,
  personB: Person,
  parentMap: Map<string, string[]>,
  spouseMap: Map<string, string[]>,
  personMap: Map<string, Person>,
): { description: string; detail: string } | null {
  // Case 1: B là vợ/chồng của anh/chị/em ruột của bố/mẹ A → thím/bác/mợ/dượng
  for (const parentId of parentMap.get(personA.id) || []) {
    const parent = personMap.get(parentId);
    if (!parent) continue;

    for (const uncle of getSiblings(parentId, parentMap, personMap)) {
      if (!(spouseMap.get(uncle.id) || []).includes(personB.id)) continue;

      const towardInLaw = labelParentsSiblingSpouse(parent, uncle);
      const towardJunior =
        personA.gender === 1
          ? markKinship('Điệt Tử', 'cháu trai')
          : markKinship('Điệt Nữ', 'cháu gái');
      const uncleRole = labelParentsSibling(parent, uncle);

      return {
        description: `${personA.display_name} gọi ${personB.display_name} là ${towardInLaw}`,
        detail: `${personB.display_name} gọi ${personA.display_name} là ${towardJunior}. ${towardInLaw} là vợ/chồng của ${uncle.display_name} (${uncleRole})`,
      };
    }
  }

  // Case 2: A là vợ/chồng của chú/bác/... của B
  for (const parentId of parentMap.get(personB.id) || []) {
    const parent = personMap.get(parentId);
    if (!parent) continue;

    for (const uncle of getSiblings(parentId, parentMap, personMap)) {
      if (!(spouseMap.get(uncle.id) || []).includes(personA.id)) continue;

      const towardInLaw = labelParentsSiblingSpouse(parent, uncle);
      const towardJunior =
        personB.gender === 1
          ? markKinship('Điệt Tử', 'cháu trai')
          : markKinship('Điệt Nữ', 'cháu gái');
      const uncleRole = labelParentsSibling(parent, uncle);

      return {
        description: `${personA.display_name} là ${towardInLaw} của ${personB.display_name}`,
        detail: `${personB.display_name} gọi ${personA.display_name} là ${towardInLaw}; ${personA.display_name} gọi ${personB.display_name} là ${towardJunior}. Qua ${uncle.display_name} (${uncleRole})`,
      };
    }
  }

  return null;
}

/** Danh xưng chú/bác/cô/cậu/dì — anh/chị/em của bố hoặc mẹ. */
export function labelParentsSibling(parent: Person, uncle: Person): string {
  const paternal = parent.gender === 1;
  const uncleOlder = isOlder(uncle, parent);

  if (paternal) {
    if (uncle.gender === 1) {
      if (uncleOlder === true) return markKinship('Bá Phụ', 'bác — anh trai của cha');
      if (uncleOlder === false) return markKinship('Thúc Phụ', 'chú — em trai của cha');
      return markKinship('Thúc/Bá', 'chú/bác — anh em trai của cha');
    }
    return markKinship('Cô Mẫu', 'cô — chị/em gái của cha');
  }

  if (uncle.gender === 1) return markKinship('Cữu Phụ', 'cậu — anh/em trai của mẹ');
  return markKinship('Di Mẫu', 'dì — chị/em gái của mẹ');
}

/** Danh xưng vợ/chồng của chú·bác·cô·cậu·dì. */
export function labelParentsSiblingSpouse(parent: Person, uncle: Person): string {
  const paternal = parent.gender === 1;
  const uncleOlder = isOlder(uncle, parent);

  if (paternal) {
    if (uncle.gender === 1) {
      // Vợ của bác / chú
      if (uncleOlder === true) return markKinship('Bá mẫu', 'bác gái — vợ của bác');
      if (uncleOlder === false) return markKinship('Thẩm', 'thím — vợ của chú');
      return markKinship('Bá mẫu/Thẩm', 'bác gái/thím — vợ chú bác');
    }
    // Chồng của cô
    return markKinship('Cô phu', 'dượng — chồng của cô');
  }

  // Bên ngoại
  if (uncle.gender === 1) {
    return markKinship('Cữu mẫu', 'mợ — vợ của cậu');
  }
  return markKinship('Di phu', 'dượng — chồng của dì');
}

