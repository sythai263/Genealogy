/**
 * @project AncestorTree
 * @file src/lib/pathfinding.ts
 * @description Relationship pathfinding: BFS + LCA + tổ tông 18 đời (Vietnamese kinship)
 * @version 1.3.0
 * @updated 2026-08-09
 */

import type { Person } from '@types';
import type { TreeData } from './supabase-data-stats';
import {
  bfs,
  buildGraph,
  buildParentMap,
  buildSpouseMap,
} from './pathfinding-graph';
import {
  describeParentsSiblingSpouse,
  describeSiblingInLaw,
} from './pathfinding-inlaw';
import {
  findLCA,
  getAncestorLabel,
  getBranchChildOfLca,
  getCollateralJuniorLabel,
  getCollateralSeniorLabel,
  getDescendantLabel,
  getGenerationDiff,
  isOlder,
  markKinship,
  siblingLabel,
} from './pathfinding-kinship';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RelationshipResult {
  found: boolean;
  path: Person[];
  lca: Person | null;
  distance: number;
  description: string;
  descriptionDetail: string;
}

function describeRelationship(
  personA: Person,
  personB: Person,
  lca: Person | null,
  path: Person[],
  parentMap: Map<string, string[]>,
  personMap: Map<string, Person>,
  spouseMap: Map<string, string[]>,
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

  // 3. Chị dâu / em dâu / anh rể / em rể (và anh/em chồng, anh/em vợ)
  const inLaw = describeSiblingInLaw(personA, personB, parentMap, spouseMap, personMap);
  if (inLaw) return inLaw;

  // 4. Thím / bác gái / mợ / dượng — vợ/chồng của chú·bác·cô·cậu·dì
  const uncleAuntInLaw = describeParentsSiblingSpouse(
    personA,
    personB,
    parentMap,
    spouseMap,
    personMap,
  );
  if (uncleAuntInLaw) return uncleAuntInLaw;

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
  const spouseMap = buildSpouseMap(data);
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
    spouseMap,
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
