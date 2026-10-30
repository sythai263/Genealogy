/**
 * @project AncestorTree
 * @file src/lib/tree-hierarchy-collapse.ts
 * @description Hierarchy node collapse/expand ops — D3 children↔_children
 *              swap, depth-based collapse, expand-all, state predicates
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { HierarchyPersonNode } from '@types';

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
