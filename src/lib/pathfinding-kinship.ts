/**
 * @project AncestorTree
 * @file src/lib/pathfinding-kinship.ts
 * @description Relationship pathfinding — LCA + Vietnamese kinship titles
 *              (tổ tông 18 đời), collateral seniority labeling
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { Person } from '@types';

export function findLCA(
  parentMap: Map<string, string[]>,
  personMap: Map<string, Person>,
  personAId: string,
  personBId: string,
): Person | null {
  // Ancestors of A, including A (so direct ancestor cases resolve to A/B themselves)
  const ancestorsA = new Set<string>();
  const queueA: string[] = [personAId];
  while (queueA.length > 0) {
    const current = queueA.shift()!;
    if (ancestorsA.has(current)) continue;
    ancestorsA.add(current);
    const parents = parentMap.get(current) || [];
    for (const p of parents) queueA.push(p);
  }

  const visitedB = new Set<string>();
  const queueB: string[] = [personBId];
  while (queueB.length > 0) {
    const current = queueB.shift()!;
    if (visitedB.has(current)) continue;
    visitedB.add(current);

    // First common ancestor — may be A or B when one is trực hệ of the other
    // (e.g. ông nội: must return the grandfather, not his father)
    if (ancestorsA.has(current)) {
      return personMap.get(current) || null;
    }

    const parents = parentMap.get(current) || [];
    for (const p of parents) queueB.push(p);
  }

  return null;
}

// ─── Vietnamese Kinship — Tổ tông 18 đời (Nhĩ Nhã / Gia lễ) ─────────────────
// 9 đời trên + 9 đời dưới. Danh xưng Hán-Việt kèm diễn giải dân gian trong ngoặc.
// UI bôi đậm các cụm được đánh dấu bằng **...**.

/** Đánh dấu danh xưng để UI render đậm: **Hán Việt (diễn giải)**. */
export function markKinship(hanViet: string, gloss: string): string {
  return `**${hanViet} (${gloss})**`;
}

export interface KinshipTitle {
  hanViet: string;
  gloss: string;
}

/** 9 đời trên — nam (từ bản thân trở lên). */
export const ANCESTOR_UP_MALE: Record<number, KinshipTitle> = {
  1: { hanViet: 'Thân Phụ', gloss: 'cha đẻ' },
  2: { hanViet: 'Tổ Phụ', gloss: 'ông' },
  3: { hanViet: 'Tằng Tổ', gloss: 'ông cố' },
  4: { hanViet: 'Cao Tổ', gloss: 'ông sơ / kỵ' },
  5: { hanViet: 'Thiên Tổ', gloss: 'tổ tiên đời thứ 5' },
  6: { hanViet: 'Liệt Tổ', gloss: 'tổ tiên đời thứ 6' },
  7: { hanViet: 'Thái Tổ', gloss: 'tổ tiên đời thứ 7' },
  8: { hanViet: 'Viễn Tổ', gloss: 'tổ tiên đời thứ 8' },
  9: { hanViet: 'Tị Tổ', gloss: 'thủy tổ — cụ tổ rất xa' },
};

/** 9 đời trên — nữ. */
export const ANCESTOR_UP_FEMALE: Record<number, KinshipTitle> = {
  1: { hanViet: 'Thân Mẫu', gloss: 'mẹ đẻ' },
  2: { hanViet: 'Tổ Mẫu', gloss: 'bà' },
  3: { hanViet: 'Tằng Tổ Mẫu', gloss: 'bà cố' },
  4: { hanViet: 'Cao Tổ Mẫu', gloss: 'bà sơ / kỵ' },
  5: { hanViet: 'Thiên Tổ Mẫu', gloss: 'tổ tiên đời thứ 5' },
  6: { hanViet: 'Liệt Tổ Mẫu', gloss: 'tổ tiên đời thứ 6' },
  7: { hanViet: 'Thái Tổ Mẫu', gloss: 'tổ tiên đời thứ 7' },
  8: { hanViet: 'Viễn Tổ Mẫu', gloss: 'tổ tiên đời thứ 8' },
  9: { hanViet: 'Tị Tổ Mẫu', gloss: 'thủy tổ mẫu — cụ tổ rất xa' },
};

/** 9 đời dưới — nam. */
export const DESCENDANT_DOWN_MALE: Record<number, KinshipTitle> = {
  1: { hanViet: 'Nhân Tử', gloss: 'con trai' },
  2: { hanViet: 'Tôn Tử', gloss: 'cháu trai' },
  3: { hanViet: 'Tằng Tôn', gloss: 'chắt trai' },
  4: { hanViet: 'Huyền Tôn', gloss: 'chút trai' },
  5: { hanViet: 'Lai Tôn', gloss: 'chít trai' },
  6: { hanViet: 'Côn Tôn', gloss: 'cháu đời thứ 6' },
  7: { hanViet: 'Nhưng Tôn', gloss: 'cháu đời thứ 7' },
  8: { hanViet: 'Vân Tôn', gloss: 'cháu đời thứ 8' },
  9: { hanViet: 'Nhĩ Tôn', gloss: 'cháu đời thứ 9' },
};

/** 9 đời dưới — nữ. */
export const DESCENDANT_DOWN_FEMALE: Record<number, KinshipTitle> = {
  1: { hanViet: 'Nữ Nhi', gloss: 'con gái' },
  2: { hanViet: 'Tôn Nữ', gloss: 'cháu gái' },
  3: { hanViet: 'Tằng Tôn Nữ', gloss: 'chắt gái' },
  4: { hanViet: 'Huyền Tôn Nữ', gloss: 'chút gái' },
  5: { hanViet: 'Lai Tôn Nữ', gloss: 'chít gái' },
  6: { hanViet: 'Côn Tôn Nữ', gloss: 'cháu đời thứ 6' },
  7: { hanViet: 'Nhưng Tôn Nữ', gloss: 'cháu đời thứ 7' },
  8: { hanViet: 'Vân Tôn Nữ', gloss: 'cháu đời thứ 8' },
  9: { hanViet: 'Nhĩ Tôn Nữ', gloss: 'cháu đời thứ 9' },
};

export function titleToMarked(title: KinshipTitle, sideSuffix?: string): string {
  const gloss = sideSuffix ? `${title.gloss} ${sideSuffix}` : title.gloss;
  return markKinship(title.hanViet, gloss);
}

export function getGenerationDiff(parentMap: Map<string, string[]>, ancestorId: string, descendantId: string): number {
  const visited = new Map<string, number>();
  const queue: Array<{ id: string; depth: number }> = [{ id: descendantId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.set(id, depth);

    if (id === ancestorId) return depth;

    const parents = parentMap.get(id) || [];
    for (const p of parents) {
      queue.push({ id: p, depth: depth + 1 });
    }
  }

  return -1;
}

export function isPaternalLine(
  ancestor: Person,
  descendant: Person,
  path: Person[],
  parentMap: Map<string, string[]>,
): boolean {
  const ancestorIdx = path.findIndex((p) => p.id === ancestor.id);
  if (ancestorIdx >= 0 && ancestorIdx < path.length - 1) {
    const next = path[ancestorIdx + 1];
    const parentsOfNext = parentMap.get(next.id) || [];
    if (parentsOfNext.includes(ancestor.id)) {
      return next.gender === 1;
    }
  }

  const genDiff = getGenerationDiff(parentMap, ancestor.id, descendant.id);
  if (genDiff <= 1) return true;

  for (const [childId, parents] of parentMap) {
    if (!parents.includes(ancestor.id)) continue;
    if (getGenerationDiff(parentMap, childId, descendant.id) >= 0) {
      const child = path.find((p) => p.id === childId);
      if (child) return child.gender === 1;
    }
  }

  return true;
}

/**
 * Danh xưng trực hệ đời trên (Thân Phụ → … → Tị Tổ), kèm nội/ngoại khi gần.
 */
export function getAncestorLabel(
  ancestor: Person,
  diff: number,
  descendant: Person,
  path: Person[],
  parentMap: Map<string, string[]>,
): string {
  if (diff < 1) return markKinship('Bản thân', 'cùng một người');

  const table = ancestor.gender === 1 ? ANCESTOR_UP_MALE : ANCESTOR_UP_FEMALE;
  const title = table[diff];
  if (!title) {
    return markKinship('Tổ tiên', `đời thứ ${diff} — ngoài cửu huyền`);
  }

  if (diff >= 2 && diff <= 4) {
    const paternal = isPaternalLine(ancestor, descendant, path, parentMap);
    return titleToMarked(title, paternal ? 'nội' : 'ngoại');
  }

  return titleToMarked(title);
}

/**
 * Danh xưng trực hệ đời dưới (Nhân Tử → … → Nhĩ Tôn).
 */
export function getDescendantLabel(descendant: Person, diff: number): string {
  if (diff < 1) return markKinship('Bản thân', 'cùng một người');
  if (diff > 9) {
    return markKinship('Viễn tôn', `cháu đời thứ ${diff} — ngoài cửu huyền`);
  }

  const table = descendant.gender === 1 ? DESCENDANT_DOWN_MALE : DESCENDANT_DOWN_FEMALE;
  const title = table[diff];
  return title ? titleToMarked(title) : markKinship('Hậu duệ', `đời thứ ${diff}`);
}

/** So sánh tuổi để phân anh/chị vs em (năm sinh nhỏ hơn = lớn tuổi hơn). */
export function isOlder(a: Person, b: Person): boolean | null {
  if (a.birth_year != null && b.birth_year != null && a.birth_year !== b.birth_year) {
    return a.birth_year < b.birth_year;
  }
  return null;
}

export function siblingLabel(from: Person, to: Person, blood: 'ruột' | 'họ', generationDepth: number): string {
  const older = isOlder(from, to);
  let hanViet: string;
  let gloss: string;

  if (older === true) {
    hanViet = from.gender === 1 ? 'Huynh' : 'Tỷ';
    gloss = from.gender === 1 ? 'anh' : 'chị';
  } else if (older === false) {
    hanViet = from.gender === 1 ? 'Đệ' : 'Muội';
    gloss = 'em';
  } else {
    hanViet = from.gender === 1 ? 'Huynh/Đệ' : 'Tỷ/Muội';
    gloss = from.gender === 1 ? 'anh/em trai' : 'chị/em gái';
  }

  if (blood === 'ruột') {
    return markKinship(hanViet, `${gloss} ruột`);
  }

  if (generationDepth === 2) return markKinship(`Đường ${hanViet}`, `${gloss} họ (cùng ông/bà)`);
  if (generationDepth === 3) return markKinship(`Tộc ${hanViet}`, `${gloss} họ (cùng cụ — Tằng Tổ)`);
  if (generationDepth === 4) return markKinship(`Tộc ${hanViet}`, `${gloss} họ (cùng kỵ — Cao Tổ)`);
  return markKinship(`Tộc ${hanViet}`, `${gloss} họ (cùng tổ đời thứ ${generationDepth})`);
}

/**
 * Vai bàng hệ đời trên (chú/bác/cậu/cô/dì…) theo khoảng cách thế hệ + nội/ngoại.
 */
export function getCollateralSeniorLabel(
  senior: Person,
  diff: number,
  paternal: boolean,
  birthOrderVsConnecting: boolean | null,
): string {
  if (diff === 1) {
    if (paternal) {
      if (senior.gender === 1) {
        if (birthOrderVsConnecting === true) return markKinship('Bá Phụ', 'bác — anh trai của cha');
        if (birthOrderVsConnecting === false) return markKinship('Thúc Phụ', 'chú — em trai của cha');
        return markKinship('Thúc/Bá', 'chú/bác — anh em trai của cha');
      }
      return markKinship('Cô Mẫu', 'cô — chị/em gái của cha');
    }
    if (senior.gender === 1) return markKinship('Cữu Phụ', 'cậu — anh/em trai của mẹ');
    return markKinship('Di Mẫu', 'dì — chị/em gái của mẹ');
  }

  if (diff === 2) {
    if (paternal) {
      if (senior.gender === 1) {
        if (birthOrderVsConnecting === true) {
          return markKinship('Tổ Bá', 'ông bác — bác của cha');
        }
        if (birthOrderVsConnecting === false) {
          return markKinship('Tổ Thúc', 'ông chú — chú của cha');
        }
        return markKinship('Tổ Thúc/Bá', 'ông chú/ông bác');
      }
      return markKinship('Tổ Cô', 'bà cô — cô của cha');
    }
    if (senior.gender === 1) return markKinship('Tổ Cữu', 'ông cậu — cậu của mẹ');
    return markKinship('Tổ Di', 'bà dì — dì của mẹ');
  }

  if (diff === 3) {
    const side = paternal ? 'họ nội' : 'họ ngoại';
    return senior.gender === 1
      ? markKinship('Tằng Tổ (họ)', `cụ ông ${side}`)
      : markKinship('Tằng Tổ Mẫu (họ)', `cụ bà ${side}`);
  }

  if (diff === 4) {
    const side = paternal ? 'họ nội' : 'họ ngoại';
    return senior.gender === 1
      ? markKinship('Cao Tổ (họ)', `kỵ ông ${side}`)
      : markKinship('Cao Tổ Mẫu (họ)', `kỵ bà ${side}`);
  }

  if (diff <= 9) {
    const table = senior.gender === 1 ? ANCESTOR_UP_MALE : ANCESTOR_UP_FEMALE;
    const title = table[diff];
    if (title) return markKinship(`${title.hanViet} (họ)`, `${title.gloss} — bàng hệ`);
  }

  return markKinship('Tôn trưởng họ', `bậc bề trên họ (cách ${diff} đời)`);
}

/**
 * Hậu duệ bàng hệ nhìn từ chú/bác/cô/cậu/dì.
 * Khác trực hệ: người kém 1 bậc không phải "con" mà là "cháu" (Điệt).
 * diff 1 → Điệt (cháu); diff 2 → chắt họ; …
 */
export function getCollateralJuniorLabel(junior: Person, diff: number): string {
  if (diff < 1) return markKinship('Bản thân', 'cùng một người');

  // Cháu gọi chú/bác/cô/cậu/dì
  if (diff === 1) {
    return junior.gender === 1
      ? markKinship('Điệt Tử', 'cháu trai — con của anh/chị/em')
      : markKinship('Điệt Nữ', 'cháu gái — con của anh/chị/em');
  }

  // Đời xa hơn: lệch thêm 1 bậc so với trực hệ (không bao giờ dùng Nhân Tử)
  // diff 2 → Tằng Tôn (chắt); diff 3 → Huyền Tôn (chút); …
  const mappedDiff = diff + 1;
  if (mappedDiff > 9) {
    return markKinship('Viễn tôn (họ)', `cháu đời thứ ${mappedDiff} — bàng hệ`);
  }

  const table = junior.gender === 1 ? DESCENDANT_DOWN_MALE : DESCENDANT_DOWN_FEMALE;
  const title = table[mappedDiff];
  if (!title) return markKinship('Hậu duệ họ', `đời thứ ${mappedDiff}`);

  return markKinship(`${title.hanViet} (họ)`, `${title.gloss} — bàng hệ (cháu chú/bác)`);
}

/**
 * Nhánh nối từ LCA xuống junior: người con của LCA trên đường tới junior.
 * Giới tính người này = bố (nội) hay mẹ (ngoại) của các đời sau → bác/chú/cô vs cậu/dì.
 */
export function getBranchChildOfLca(
  parentMap: Map<string, string[]>,
  personMap: Map<string, Person>,
  lcaId: string,
  descendantId: string,
): Person | null {
  for (const [childId, parents] of parentMap) {
    if (!parents.includes(lcaId)) continue;
    if (childId === descendantId || getGenerationDiff(parentMap, childId, descendantId) >= 0) {
      const depthViaChild = getGenerationDiff(parentMap, childId, descendantId);
      const depthViaLca = getGenerationDiff(parentMap, lcaId, descendantId);
      if (depthViaChild >= 0 && depthViaLca === depthViaChild + 1) {
        return personMap.get(childId) || null;
      }
    }
  }
  return null;
}

