import type { Person } from './person';

export interface TreeNode {
  person: Person;
  x: number;
  y: number;
  generation: number;
}

export interface TreeConnection {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'parent-child' | 'couple';
}

export interface TreeLayout {
  nodes: TreeNode[];
  connections: TreeConnection[];
  width: number;
  height: number;
  generations: number;
}
