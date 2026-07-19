/**
 * @project AncestorTree
 * @file src/lib/tree-hierarchy.ts
 * @description Patrilineal hierarchy builder with children/_children collapse
 * @version 1.1.0
 * @updated 2026-07-19
 */

import {
  TREE_DEFAULT_COLLAPSE_DEPTH,
  TREE_VIRTUAL_ROOT_ID,
} from '@constants';
import type { HierarchyPersonNode, Person } from '@types';
import type { TreeData } from './supabase-data';

interface BuildHierarchyOptions {
  filterChi?: number | null;
  focusRootId?: string | null;
  collapseDepth?: number;
}

function isPersonInChiFilter(
  person: Person,
  filterChi: number | null | undefined
): boolean {
  if (filterChi == null) return true;
  return person.chi === filterChi;
}

/**
 * Build a mutable patrilineal hierarchy (father → children).
 * Optional chi filter and search-focus root (person + descendants only).
 */
export function buildPersonHierarchy(
  data: TreeData,
  options: BuildHierarchyOptions = {}
): HierarchyPersonNode | null {
  const {
    filterChi = null,
    focusRootId = null,
    collapseDepth = TREE_DEFAULT_COLLAPSE_DEPTH,
  } = options;

  const { people, families, children } = data;
  if (people.length === 0) return null;

  const peopleById = new Map(people.map((p) => [p.id, p]));

  const fatherToFamilies = new Map<string, typeof families>();
  for (const family of families) {
    if (!family.father_id) continue;
    const list = fatherToFamilies.get(family.father_id) || [];
    list.push(family);
    fatherToFamilies.set(family.father_id, list);
  }

  const familyToChildren = new Map<string, typeof children>();
  for (const child of children) {
    const list = familyToChildren.get(child.family_id) || [];
    list.push(child);
    familyToChildren.set(child.family_id, list);
  }

  const childToFather = new Map<string, string>();
  for (const family of families) {
    if (!family.father_id) continue;
    const kids = familyToChildren.get(family.id) || [];
    for (const kid of kids) {
      if (!childToFather.has(kid.person_id)) {
        childToFather.set(kid.person_id, family.father_id);
      }
    }
  }

  function getSpouse(fatherId: string): Person | null {
    const fams = fatherToFamilies.get(fatherId) || [];
    for (const fam of fams) {
      if (fam.mother_id) {
        const mother = peopleById.get(fam.mother_id);
        if (mother) return mother;
      }
    }
    return null;
  }

  function getChildIds(fatherId: string): string[] {
    const fams = fatherToFamilies.get(fatherId) || [];
    const result: string[] = [];
    const seen = new Set<string>();
    for (const fam of fams) {
      const kids = [...(familyToChildren.get(fam.id) || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );
      for (const kid of kids) {
        if (seen.has(kid.person_id)) continue;
        const childPerson = peopleById.get(kid.person_id);
        if (!childPerson) continue;
        // Patrilineal tree: skip daughters-as-wives already positioned elsewhere;
        // include all children of this father that pass chi filter when building full tree.
        if (
          filterChi != null &&
          !focusRootId &&
          !isPersonInChiFilter(childPerson, filterChi)
        ) {
          continue;
        }
        seen.add(kid.person_id);
        result.push(kid.person_id);
      }
    }
    return result;
  }

  const building = new Set<string>();

  function buildNode(personId: string): HierarchyPersonNode | null {
    const person = peopleById.get(personId);
    if (!person) return null;
    if (building.has(personId)) return null;
    building.add(personId);

    const childIds = getChildIds(personId);
    const childNodes: HierarchyPersonNode[] = [];
    for (const childId of childIds) {
      const childNode = buildNode(childId);
      if (childNode) childNodes.push(childNode);
    }

    building.delete(personId);

    return {
      id: personId,
      person,
      spouse: getSpouse(personId),
      children: childNodes.length > 0 ? childNodes : undefined,
    };
  }

  // Search focus: root at selected person + descendants only
  if (focusRootId) {
    if (!peopleById.has(focusRootId)) return null;
    const focused = buildNode(focusRootId);
    if (!focused) return null;
    collapseBelowDepth(focused, collapseDepth);
    return focused;
  }

  const fatherIds = new Set(
    families.map((f) => f.father_id).filter((id): id is string => Boolean(id))
  );
  const motherIds = new Set(
    families.map((f) => f.mother_id).filter((id): id is string => Boolean(id))
  );

  function isSpouseOnly(personId: string): boolean {
    return motherIds.has(personId) && !fatherIds.has(personId);
  }

  let rootIds: string[] = [];

  if (filterChi == null) {
    // Tất cả chi → root is the generation-1 ancestor (clan founder)
    const gen1 = people
      .filter(
        (p) => (p.generation || 1) === 1 && !isSpouseOnly(p.id)
      )
      .sort((a, b) => {
        const score = (p: Person) =>
          (p.is_patrilineal ? 2 : 0) + (p.gender === 1 ? 1 : 0);
        return score(b) - score(a);
      });
    // One founder head for the full tree
    if (gen1.length > 0) rootIds = [gen1[0].id];
  } else {
    // Single chi → heads with no father inside that chi
    const candidateIds = people
      .filter((p) => isPersonInChiFilter(p, filterChi))
      .map((p) => p.id);
    const candidateSet = new Set(candidateIds);

    for (const id of candidateIds) {
      if (isSpouseOnly(id)) continue;
      const fatherId = childToFather.get(id);
      const fatherVisible =
        fatherId != null &&
        candidateSet.has(fatherId) &&
        peopleById.has(fatherId) &&
        !isSpouseOnly(fatherId);
      if (!fatherVisible) rootIds.push(id);
    }

    // Drop unlinked orphans that are deeper than the chi's true head generation.
    // Without this, Gen-8 people with no family mapping become sibling "roots"
    // and attach under the virtual/Gen-1 root next to the branch founder.
    // Keep later-gen people only when they have a father outside this chi
    // (so their subtree remains visible under a secondary root).
    if (rootIds.length > 1) {
      const rootPeople = rootIds
        .map((id) => peopleById.get(id))
        .filter((p): p is Person => p != null);
      const minGen = Math.min(
        ...rootPeople.map((p) => p.generation || 1)
      );
      rootIds = rootPeople
        .filter((p) => {
          const gen = p.generation || 1;
          if (gen === minGen) return true;
          const fatherId = childToFather.get(p.id);
          // Father exists in data but outside this chi filter → keep as local root
          return (
            fatherId != null &&
            peopleById.has(fatherId) &&
            !candidateSet.has(fatherId)
          );
        })
        .map((p) => p.id);
    }

    // Fallback: earliest generation within the chi
    if (rootIds.length === 0 && candidateIds.length > 0) {
      const chiPeople = candidateIds
        .map((id) => peopleById.get(id))
        .filter((p): p is Person => p != null && !isSpouseOnly(p.id));
      const minGen = Math.min(
        ...chiPeople.map((p) => p.generation || 1)
      );
      rootIds = chiPeople
        .filter((p) => (p.generation || 1) === minGen)
        .map((p) => p.id);
    }
  }

  if (rootIds.length === 0) return null;

  const roots: HierarchyPersonNode[] = [];
  for (const id of rootIds) {
    const node = buildNode(id);
    if (node) roots.push(node);
  }

  if (roots.length === 0) return null;

  if (roots.length === 1) {
    collapseBelowDepth(roots[0], collapseDepth);
    return roots[0];
  }

  // Multiple gen-1 / chi heads → visible virtual root
  const virtualRoot: HierarchyPersonNode = {
    id: TREE_VIRTUAL_ROOT_ID,
    person: {
      id: TREE_VIRTUAL_ROOT_ID,
      handle: 'clan-root',
      display_name: 'Gốc dòng họ',
      first_name: 'Gốc',
      middle_name: 'dòng',
      surname: 'Họ',
      gender: 1,
      generation: 0,
      is_living: true,
      is_patrilineal: true,
      privacy_level: 0,
      created_at: '',
      updated_at: '',
    },
    children: roots,
  };
  collapseBelowDepth(virtualRoot, collapseDepth);
  return virtualRoot;
}

/** Move children → _children for nodes at depth >= maxDepth (0-based). */
export function collapseBelowDepth(
  node: HierarchyPersonNode,
  maxDepth: number,
  depth = 0
): void {
  if (node.children) {
    for (const child of node.children) {
      collapseBelowDepth(child, maxDepth, depth + 1);
    }
  }

  if (depth >= maxDepth && node.children && node.children.length > 0) {
    node._children = node.children;
    node.children = undefined;
  }
}

/** Expand all collapsed branches recursively. */
export function expandAllNodes(node: HierarchyPersonNode): void {
  if (node._children && node._children.length > 0) {
    node.children = node._children;
    node._children = undefined;
  }
  if (node.children) {
    for (const child of node.children) {
      expandAllNodes(child);
    }
  }
}

/** Classic D3 toggle: swap children ↔ _children. Returns true if toggled. */
export function toggleHierarchyNode(node: HierarchyPersonNode): boolean {
  if (node.children) {
    node._children = node.children;
    node.children = undefined;
    return true;
  }
  if (node._children) {
    node.children = node._children;
    node._children = undefined;
    return true;
  }
  return false;
}

export function hierarchyHasKids(node: HierarchyPersonNode): boolean {
  return (
    (node.children != null && node.children.length > 0) ||
    (node._children != null && node._children.length > 0)
  );
}

export function hierarchyIsCollapsed(node: HierarchyPersonNode): boolean {
  return node._children != null && node._children.length > 0;
}
