/**
 * @project AncestorTree
 * @file src/lib/pathfinding.ts
 * @description Relationship pathfinding: BFS + LCA + tổ tông 18 đời (Vietnamese kinship)
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { Person } from '@types';
import type { TreeData } from './supabase-data';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RelationshipResult {
  found: boolean;
  path: Person[];
  lca: Person | null;
  distance: number;
  description: string;
  descriptionDetail: string;
}

interface GraphEdge {
  to: string;
  type: 'parent' | 'child' | 'spouse';
}

// ─── Graph Construction ─────────────────────────────────────────────────────

function buildGraph(data: TreeData): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  const addEdge = (from: string, to: string, type: GraphEdge['type']) => {
    if (!graph.has(from)) graph.set(from, []);
    graph.get(from)!.push({ to, type });
  };

  const { families, children } = data;

  const familyChildren = new Map<string, string[]>();
  for (const c of children) {
    const list = familyChildren.get(c.family_id) || [];
    list.push(c.person_id);
    familyChildren.set(c.family_id, list);
  }

  for (const family of families) {
    if (family.father_id && family.mother_id) {
      addEdge(family.father_id, family.mother_id, 'spouse');
      addEdge(family.mother_id, family.father_id, 'spouse');
    }

    const kids = familyChildren.get(family.id) || [];
    for (const childId of kids) {
      if (family.father_id) {
        addEdge(family.father_id, childId, 'child');
        addEdge(childId, family.father_id, 'parent');
      }
      if (family.mother_id) {
        addEdge(family.mother_id, childId, 'child');
        addEdge(childId, family.mother_id, 'parent');
      }
    }
  }

  return graph;
}

// ─── BFS Shortest Path ─────────────────────────────────────────────────────

function bfs(
  graph: Map<string, GraphEdge[]>,
  startId: string,
  endId: string,
  personMap: Map<string, Person>,
): Person[] | null {
  if (startId === endId) return null;

  const visited = new Set<string>();
  const parent = new Map<string, string>();
  const queue: string[] = [startId];
  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = graph.get(current) || [];

    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);
      parent.set(edge.to, current);

      if (edge.to === endId) {
        const path: Person[] = [];
        let node: string | undefined = endId;
        while (node !== undefined) {
          const person = personMap.get(node);
          if (person) path.unshift(person);
          node = parent.get(node);
        }
        return path;
      }
      queue.push(edge.to);
    }
  }

  return null;
}

// ─── LCA (Lowest Common Ancestor) ──────────────────────────────────────────

function buildParentMap(data: TreeData): Map<string, string[]> {
  const parentMap = new Map<string, string[]>();
  const { families, children } = data;

  const familyParents = new Map<string, string[]>();
  for (const f of families) {
    const parents: string[] = [];
    if (f.father_id) parents.push(f.father_id);
    if (f.mother_id) parents.push(f.mother_id);
    familyParents.set(f.id, parents);
  }

  for (const c of children) {
    const parents = familyParents.get(c.family_id) || [];
    const existing = parentMap.get(c.person_id) || [];
    parentMap.set(c.person_id, [...existing, ...parents]);
  }

  return parentMap;
}

function findLCA(
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

interface KinshipTitle {
  hanViet: string;
  gloss: string;
}

/** 9 đời trên — nam (từ bản thân trở lên). */
const ANCESTOR_UP_MALE: Record<number, KinshipTitle> = {
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
const ANCESTOR_UP_FEMALE: Record<number, KinshipTitle> = {
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
const DESCENDANT_DOWN_MALE: Record<number, KinshipTitle> = {
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
const DESCENDANT_DOWN_FEMALE: Record<number, KinshipTitle> = {
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

function titleToMarked(title: KinshipTitle, sideSuffix?: string): string {
  const gloss = sideSuffix ? `${title.gloss} ${sideSuffix}` : title.gloss;
  return markKinship(title.hanViet, gloss);
}

function getGenerationDiff(parentMap: Map<string, string[]>, ancestorId: string, descendantId: string): number {
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

function isPaternalLine(
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
function getAncestorLabel(
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
function getDescendantLabel(descendant: Person, diff: number): string {
  if (diff < 1) return markKinship('Bản thân', 'cùng một người');
  if (diff > 9) {
    return markKinship('Viễn tôn', `cháu đời thứ ${diff} — ngoài cửu huyền`);
  }

  const table = descendant.gender === 1 ? DESCENDANT_DOWN_MALE : DESCENDANT_DOWN_FEMALE;
  const title = table[diff];
  return title ? titleToMarked(title) : markKinship('Hậu duệ', `đời thứ ${diff}`);
}

/** So sánh tuổi để phân anh/chị vs em (năm sinh nhỏ hơn = lớn tuổi hơn). */
function isOlder(a: Person, b: Person): boolean | null {
  if (a.birth_year != null && b.birth_year != null && a.birth_year !== b.birth_year) {
    return a.birth_year < b.birth_year;
  }
  return null;
}

function siblingLabel(from: Person, to: Person, blood: 'ruột' | 'họ', generationDepth: number): string {
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
function getCollateralSeniorLabel(
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
function getCollateralJuniorLabel(junior: Person, diff: number): string {
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
function getBranchChildOfLca(
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

function describeRelationship(
  personA: Person,
  personB: Person,
  lca: Person | null,
  path: Person[],
  parentMap: Map<string, string[]>,
  personMap: Map<string, Person>,
): { description: string; detail: string } {
  if (personA.id === personB.id) {
    return { description: 'Cùng một người', detail: '' };
  }

  // 1. Cha/mẹ — con (path dài 2 cũng có thể là trực hệ, không phải vợ chồng)
  const aIsParentOfB = (parentMap.get(personB.id) || []).includes(personA.id);
  const bIsParentOfA = (parentMap.get(personA.id) || []).includes(personB.id);
  if (aIsParentOfB || bIsParentOfA) {
    const parent = aIsParentOfB ? personA : personB;
    const child = aIsParentOfB ? personB : personA;
    const upLabel = getAncestorLabel(parent, 1, child, path, parentMap);
    const downLabel = getDescendantLabel(child, 1);
    return {
      description: `${parent.display_name} là ${upLabel} của ${child.display_name}`,
      detail: `${child.display_name} là ${downLabel} của ${parent.display_name}`,
    };
  }

  // 2. Vợ chồng
  if (path.length === 2) {
    if (personA.gender !== personB.gender) {
      const husband = personA.gender === 1 ? personA : personB;
      const wife = personA.gender === 1 ? personB : personA;
      return {
        description: `${husband.display_name} là ${markKinship('Phu Quân', 'chồng')} của ${wife.display_name}`,
        detail: `${wife.display_name} là ${markKinship('Thê Tử', 'vợ')} của ${husband.display_name}`,
      };
    }
    return {
      description: `${personA.display_name} và ${personB.display_name} là ${markKinship('Phu Thê', 'vợ/chồng')}`,
      detail: 'Quan hệ hôn nhân',
    };
  }

  if (!lca) {
    if (path.length > 0) {
      return {
        description: 'Có quan hệ thông gia',
        detail: `Kết nối qua ${path.length - 1} bậc (có quan hệ hôn nhân)`,
      };
    }
    return { description: 'Không tìm thấy quan hệ trực tiếp', detail: '' };
  }

  const genA = getGenerationDiff(parentMap, lca.id, personA.id);
  const genB = getGenerationDiff(parentMap, lca.id, personB.id);

  if (genA === -1 || genB === -1) {
    return {
      description: 'Có quan hệ họ hàng',
      detail: `Tổ tiên chung: ${lca.display_name}`,
    };
  }

  // 3. Cùng thế hệ
  if (genA === genB) {
    if (genA === 0) {
      return { description: 'Cùng một người', detail: '' };
    }
    if (genA === 1) {
      const label = siblingLabel(personA, personB, 'ruột', 1);
      const reciprocal = siblingLabel(personB, personA, 'ruột', 1);
      return {
        description: `${personA.display_name} là ${label} của ${personB.display_name}`,
        detail: `${personB.display_name} là ${reciprocal} của ${personA.display_name}. Cùng ${lca.gender === 1 ? 'cha' : 'mẹ'}: ${lca.display_name}`,
      };
    }
    const label = siblingLabel(personA, personB, 'họ', genA);
    const reciprocal = siblingLabel(personB, personA, 'họ', genA);
    const ancestorWord =
      genA === 2 ? 'ông/bà' : genA === 3 ? 'cụ' : genA === 4 ? 'kỵ' : `tổ đời thứ ${genA}`;
    return {
      description: `${personA.display_name} là ${label} của ${personB.display_name}`,
      detail: `${personB.display_name} là ${reciprocal} của ${personA.display_name}. Cùng ${ancestorWord}: ${lca.display_name}`,
    };
  }

  // 4. Khác thế hệ
  const aIsSenior = genA < genB;
  const senior = aIsSenior ? personA : personB;
  const junior = aIsSenior ? personB : personA;
  const genSenior = aIsSenior ? genA : genB;
  const genJunior = aIsSenior ? genB : genA;
  const diff = genJunior - genSenior;

  // Trực hệ: senior là tổ tiên trực tiếp
  if (genSenior === 0) {
    const upLabel = getAncestorLabel(senior, diff, junior, path, parentMap);
    const downLabel = getDescendantLabel(junior, diff);
    return {
      description: `${senior.display_name} là ${upLabel} của ${junior.display_name}`,
      detail: `${junior.display_name} là ${downLabel} của ${senior.display_name} (trực hệ — tổ tông 18 đời)`,
    };
  }

  // Bàng hệ: nội/ngoại theo nhánh bố/mẹ của junior dưới LCA
  const juniorBranch = getBranchChildOfLca(parentMap, personMap, lca.id, junior.id);
  const seniorBranch = getBranchChildOfLca(parentMap, personMap, lca.id, senior.id);
  const paternal = juniorBranch ? juniorBranch.gender === 1 : true;
  const branchOrder =
    seniorBranch && juniorBranch && seniorBranch.id !== juniorBranch.id
      ? isOlder(seniorBranch, juniorBranch)
      : null;

  const upLabel = getCollateralSeniorLabel(senior, diff, paternal, branchOrder);
  const downLabel = getCollateralJuniorLabel(junior, diff);

  return {
    description: `${senior.display_name} là ${upLabel} của ${junior.display_name}`,
    detail: `${junior.display_name} là ${downLabel} của ${senior.display_name}. Tổ tiên chung: ${lca.display_name} (cách ${diff} đời)`,
  };
}

// ─── Main Export ────────────────────────────────────────────────────────────

export function findRelationship(
  data: TreeData,
  personAId: string,
  personBId: string,
): RelationshipResult {
  if (personAId === personBId) {
    return {
      found: false,
      path: [],
      lca: null,
      distance: 0,
      description: 'Vui lòng chọn 2 người khác nhau',
      descriptionDetail: '',
    };
  }

  const personMap = new Map<string, Person>();
  for (const p of data.people) personMap.set(p.id, p);

  const personA = personMap.get(personAId);
  const personB = personMap.get(personBId);
  if (!personA || !personB) {
    return {
      found: false,
      path: [],
      lca: null,
      distance: 0,
      description: 'Không tìm thấy thành viên',
      descriptionDetail: '',
    };
  }

  const graph = buildGraph(data);
  const parentMap = buildParentMap(data);
  const path = bfs(graph, personAId, personBId, personMap);

  if (!path) {
    return {
      found: false,
      path: [],
      lca: null,
      distance: 0,
      description: 'Không tìm thấy quan hệ trực tiếp',
      descriptionDetail: 'Hai người này không có liên kết nào trong dữ liệu gia phả',
    };
  }

  const lca = findLCA(parentMap, personMap, personAId, personBId);
  const { description, detail } = describeRelationship(
    personA,
    personB,
    lca,
    path,
    parentMap,
    personMap,
  );

  return {
    found: true,
    path,
    lca,
    distance: path.length - 1,
    description,
    descriptionDetail: detail,
  };
}