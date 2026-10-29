/**
 * @project AncestorTree
 * @file src/components/tree/tree-d3-helpers.ts
 * @description D3 geometry + DOM helpers for the family tree canvas — node
 *              sizing, orientation-aware point mapping, link endpoints and
 *              the collapse button element
 * @version 1.0.0
 * @updated 2026-10-29
 */

import {
  COUPLE_GAP,
  NODE_HEIGHT,
  NODE_WIDTH,
  TREE_COLLAPSE_BTN_RADIUS,
  TREE_SIBLING_GAP,
} from '@constants';
import { hierarchyIsCollapsed } from '@lib';
import type {
  HierarchyPersonNode,
  TreeOrientation,
} from '@types';
import {
  linkHorizontal,
  linkVertical,
  type BaseType,
  type HierarchyPointLink,
  type HierarchyPointNode,
  type Selection,
} from 'd3';

export type HierarchyPoint = HierarchyPointNode<HierarchyPersonNode>;

export interface LinkPoint {
  x: number;
  y: number;
}

export interface LinkShape {
  source: LinkPoint;
  target: LinkPoint;
}

/**
 * Total width of a node: the person plus every spouse placed beside them,
 * separated by the couple connector.
 */
export function cardWidth(data: HierarchyPersonNode): number {
  const spouseCount = data.spouses.length;
  return NODE_WIDTH * (spouseCount + 1) + COUPLE_GAP * spouseCount;
}

/** Screen X: depth along X when horizontal, sibling along X when vertical */
export function pointX(
  d: HierarchyPoint,
  orientation: TreeOrientation
): number {
  return orientation === 'horizontal' ? d.y : d.x;
}

/** Screen Y: sibling along Y when horizontal, depth along Y when vertical */
export function pointY(
  d: HierarchyPoint,
  orientation: TreeOrientation
): number {
  return orientation === 'horizontal' ? d.x : d.y;
}

export function collapseBtnTransform(
  orientation: TreeOrientation,
  width: number
): string {
  return orientation === 'horizontal'
    ? `translate(${width}, ${NODE_HEIGHT / 2})`
    : `translate(${width / 2}, ${NODE_HEIGHT})`;
}

export function createLinkPath(orientation: TreeOrientation) {
  const link =
    orientation === 'horizontal'
      ? linkHorizontal<LinkShape, LinkPoint>()
      : linkVertical<LinkShape, LinkPoint>();
  return link.x((p) => p.x).y((p) => p.y);
}

/**
 * Anchor parent-child links to the card edges rather than the layout point, so
 * the line leaves the outer edge of a couple instead of starting under a card.
 */
export function linkEndpoints(
  link: HierarchyPointLink<HierarchyPersonNode>,
  orientation: TreeOrientation
): LinkShape {
  const { source, target } = link;
  if (orientation === 'horizontal') {
    return {
      source: {
        x: pointX(source, orientation) + cardWidth(source.data) / 2,
        y: pointY(source, orientation),
      },
      target: {
        x: pointX(target, orientation) - cardWidth(target.data) / 2,
        y: pointY(target, orientation),
      },
    };
  }
  return {
    source: {
      x: pointX(source, orientation),
      y: pointY(source, orientation) + NODE_HEIGHT / 2,
    },
    target: {
      x: pointX(target, orientation),
      y: pointY(target, orientation) - NODE_HEIGHT / 2,
    },
  };
}

/**
 * Minimum tree-layout separation between two sibling columns — a couple needs
 * room for both cards plus the sibling gap.
 */
export function coupleAwareSeparation(nodeSizeX: number) {
  return (
    a: HierarchyPoint,
    b: HierarchyPoint
  ): number => {
    const needed =
      (cardWidth(a.data) + cardWidth(b.data)) / 2 + TREE_SIBLING_GAP;
    const units = needed / nodeSizeX;
    return a.parent === b.parent ? units : units * 1.5;
  };
}

export function appendCollapseButton(
  g: Selection<SVGGElement, HierarchyPoint, BaseType, unknown>,
  d: HierarchyPoint,
  orientation: TreeOrientation,
  onToggle: () => void
) {
  const btn = g
    .append('g')
    .attr('class', 'collapse-btn cursor-pointer')
    .attr('transform', collapseBtnTransform(orientation, cardWidth(d.data)))
    .on('click', (event) => {
      event.stopPropagation();
      onToggle();
    });

  btn
    .append('circle')
    .attr('r', TREE_COLLAPSE_BTN_RADIUS)
    .attr(
      'class',
      'fill-background stroke-border transition-colors hover:fill-muted'
    )
    .attr('stroke-width', 1);

  btn
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('class', 'fill-foreground select-none text-xs font-bold')
    .text(hierarchyIsCollapsed(d.data) ? '+' : '−');
}
