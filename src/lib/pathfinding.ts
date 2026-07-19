/**
 * @project AncestorTree
 * @file src/lib/pathfinding.ts
 * @description Relationship pathfinding: BFS shortest path + LCA + Advanced Vietnamese Kinship
 * @version 1.1.0
 */

import type { Person } from '@/types';
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

    if (ancestorsA.has(current) && current !== personAId && current !== personBId) {
      return personMap.get(current) || null;
    }

    const parents = parentMap.get(current) || [];
    for (const p of parents) queueB.push(p);
  }

  if (ancestorsA.has(personBId)) return personMap.get(personBId) || null;
  if (visitedB.has(personAId)) return personMap.get(personAId) || null;

  return null;
}

// ─── Vietnamese Relationship Description ────────────────────────────────────

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

/**
 * Trả về danh xưng trực hệ chính xác (Ông nội/ngoại, Ông cố, Bà sơ...)
 */
function getAncestorLabel(
  ancestor: Person,
  diff: number,
  path: Person[],
  isAncestorFirst: boolean
): string {
  const gender = ancestor.gender;
  if (diff === 1) return gender === 1 ? 'cha' : 'mẹ';

  // Xác định Nội/Ngoại bằng cách xem người con (nối dõi) trong chuỗi đường đi là Nam hay Nữ
  const childInPath = isAncestorFirst ? path[1] : path[path.length - 2];
  const isPaternal = childInPath ? childInPath.gender === 1 : true; // Mặc định là Nội nếu không rõ
  const suffix = isPaternal ? 'nội' : 'ngoại';

  if (diff === 2) return gender === 1 ? `ông ${suffix}` : `bà ${suffix}`;
  if (diff === 3) return gender === 1 ? `ông cố ${suffix}` : `bà cố ${suffix}`;
  if (diff === 4) return gender === 1 ? `ông sơ ${suffix}` : `bà sơ ${suffix}`;

  return `tổ tiên đời thứ ${diff}`;
}

function describeRelationship(
  personA: Person,
  personB: Person,
  lca: Person | null,
  path: Person[],
  parentMap: Map<string, string[]>,
): { description: string; detail: string } {
  if (personA.id === personB.id) {
    return { description: 'Cùng một người', detail: '' };
  }

  // 1. Kiểm tra vợ chồng
  if (path.length === 2) {
    return {
      description: 'Vợ chồng',
      detail: `${personA.display_name} và ${personB.display_name} là vợ chồng`,
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

  // 2. Cùng thế hệ (Anh em ruột / họ)
  if (genA === genB) {
    if (genA === 1) {
      return {
        description: 'Anh/chị em ruột',
        detail: `Cùng ${lca.gender === 1 ? 'cha' : 'mẹ'}: ${lca.display_name}`,
      };
    }
    if (genA === 2) {
      return {
        description: 'Anh/chị em họ',
        detail: `Cùng ông/bà: ${lca.display_name}`,
      };
    }
    return {
      description: `Anh/chị em họ xa (đời thứ ${genA})`,
      detail: `Tổ tiên chung: ${lca.display_name}, cách nhau ${genA} đời`,
    };
  }

  // 3. Khác thế hệ
  if (genA < genB) {
    // A ở vai vế cao hơn B (A lớn thế hệ hơn)
    const diff = genB - genA;
    if (genA === 0) { // A là tổ tiên trực tiếp của B
      const label = getAncestorLabel(personA, diff, path, true);
      return {
        description: `${personA.display_name} là ${label} của ${personB.display_name}`,
        detail: `Quan hệ trực hệ, khoảng cách: ${diff} đời`,
      };
    }
    
    // Quan hệ bàng hệ (Họ hàng)
    let role = '';
    if (diff === 1) role = personA.gender === 1 ? 'chú/bác/cậu' : 'cô/dì/bác';
    else if (diff === 2) role = personA.gender === 1 ? 'ông chú/ông bác/ông cậu' : 'bà cô/bà dì/bà bác';
    else role = `bậc bề trên họ (cách ${diff} thế hệ)`;
    
    return {
      description: `${personA.display_name} là ${role} của ${personB.display_name}`,
      detail: `Tổ tiên chung: ${lca.display_name}. Vai vế chênh lệch: ${diff} đời`,
    };
  } else {
    // B ở vai vế cao hơn A
    const diff = genA - genB;
    if (genB === 0) { // B là tổ tiên trực tiếp của A
      const label = getAncestorLabel(personB, diff, path, false);
      return {
        description: `${personB.display_name} là ${label} của ${personA.display_name}`,
        detail: `Quan hệ trực hệ, khoảng cách: ${diff} đời`,
      };
    }

    // Quan hệ bàng hệ
    let role = '';
    if (diff === 1) role = personB.gender === 1 ? 'chú/bác/cậu' : 'cô/dì/bác';
    else if (diff === 2) role = personB.gender === 1 ? 'ông chú/ông bác/ông cậu' : 'bà cô/bà dì/bà bác';
    else role = `bậc bề trên họ (cách ${diff} thế hệ)`;

    return {
      description: `${personB.display_name} là ${role} của ${personA.display_name}`,
      detail: `Tổ tiên chung: ${lca.display_name}. Vai vế chênh lệch: ${diff} đời`,
    };
  }
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
  const { description, detail } = describeRelationship(personA, personB, lca, path, parentMap);

  return {
    found: true,
    path,
    lca,
    distance: path.length - 1,
    description,
    descriptionDetail: detail,
  };
}