/**
 * @project AncestorTree
 * @file src/lib/pathfinding-graph.ts
 * @description Relationship pathfinding — graph construction: edges, BFS,
 *              parent/spouse maps, sibling lookup
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { Person } from '@types';
import type { TreeData } from './supabase-data-stats';

export interface GraphEdge {
  to: string;
  type: 'parent' | 'child' | 'spouse';
}

// ─── Graph Construction ─────────────────────────────────────────────────────

export function buildGraph(data: TreeData): Map<string, GraphEdge[]> {
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

export function bfs(
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

export function buildParentMap(data: TreeData): Map<string, string[]> {
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

/** personId → spouse ids (from families with both parents). */
export function buildSpouseMap(data: TreeData): Map<string, string[]> {
  const spouseMap = new Map<string, string[]>();
  const add = (a: string, b: string) => {
    const list = spouseMap.get(a) || [];
    if (!list.includes(b)) list.push(b);
    spouseMap.set(a, list);
  };

  for (const f of data.families) {
    if (f.father_id && f.mother_id) {
      add(f.father_id, f.mother_id);
      add(f.mother_id, f.father_id);
    }
  }
  return spouseMap;
}

export function getSiblings(
  personId: string,
  parentMap: Map<string, string[]>,
  personMap: Map<string, Person>,
): Person[] {
  const parents = parentMap.get(personId) || [];
  if (parents.length === 0) return [];

  const siblingIds = new Set<string>();
  for (const [childId, childParents] of parentMap) {
    if (childId === personId) continue;
    if (childParents.some((p) => parents.includes(p))) {
      siblingIds.add(childId);
    }
  }

  return [...siblingIds]
    .map((id) => personMap.get(id))
    .filter((p): p is Person => p != null);
}
