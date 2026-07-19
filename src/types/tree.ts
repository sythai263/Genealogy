/**
 * @project AncestorTree
 * @file src/types/tree.ts
 * @description Family tree layout, hierarchy, and view-mode types
 * @version 3.0.0
 * @updated 2026-07-19
 */

import type { Person } from './person';

export type TreeViewMode = 'all' | 'ancestors' | 'descendants';

/** Mutable D3-style hierarchy node (children / _children collapse) */
export interface HierarchyPersonNode {
  id: string;
  person: Person;
  spouse?: Person | null;
  children?: HierarchyPersonNode[];
  _children?: HierarchyPersonNode[];
}

export interface TreeLayoutNode {
  person: Person;
  x: number;
  y: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isVisible: boolean;
}

export interface TreeLayoutConnection {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: 'parent-child' | 'couple';
  isVisible: boolean;
}

export interface TreeLayoutResult {
  nodes: TreeLayoutNode[];
  connections: TreeLayoutConnection[];
  width: number;
  height: number;
  offsetX: number;
}

/** Empty datum bound to the SVG root for typed D3 zoom */
export interface TreeSvgDatum {
  kind: 'tree-svg';
}

export const TREE_SVG_DATUM: TreeSvgDatum = { kind: 'tree-svg' };

/** @deprecated Prefer TreeLayoutNode — kept for older tree drafts */
export interface TreeNode {
  person: Person;
  x: number;
  y: number;
  generation: number;
}

/** @deprecated Prefer TreeLayoutConnection — kept for older tree drafts */
export interface TreeConnection {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'parent-child' | 'couple';
}

/** @deprecated Prefer TreeLayoutResult — kept for older tree drafts */
export interface TreeLayout {
  nodes: TreeNode[];
  connections: TreeConnection[];
  width: number;
  height: number;
  generations: number;
}
