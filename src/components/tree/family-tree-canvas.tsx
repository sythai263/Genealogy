/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-canvas.tsx
 * @description d3.tree canvas with horizontal/vertical orientation, collapse + zoom
 * @version 2.4.0
 * @updated 2026-08-09
 */

'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  COUPLE_GAP,
  NODE_HEIGHT,
  NODE_WIDTH,
  TREE_COLLAPSE_BTN_RADIUS,
  TREE_DEPTH_GAP,
  TREE_EXIT_TRANSITION_MS,
  TREE_FOCUS_TRANSITION_MS,
  TREE_MOBILE_BREAKPOINT,
  TREE_NODE_SIZE_X,
  TREE_NODE_SIZE_Y,
  TREE_SIBLING_GAP,
  TREE_TRANSITION_MS,
  TREE_VERTICAL_NODE_SIZE_X,
  TREE_VERTICAL_NODE_SIZE_Y,
  TREE_VIRTUAL_ROOT_ID,
  TREE_ZOOM_INITIAL_SCALE,
  TREE_ZOOM_MAX,
  TREE_ZOOM_MIN,
  TREE_ZOOM_MOBILE_SCALE,
} from '@constants';
import {
  cn,
  getInitials,
  getPersonTreeNameParts,
  hierarchyHasKids,
  hierarchyIsCollapsed,
  toggleHierarchyNode,
} from '@lib';
import {
  TREE_SVG_DATUM,
  type HierarchyPersonNode,
  type Person,
  type TreeOrientation,
  type TreeSvgDatum,
} from '@types';

interface FamilyTreeCanvasProps {
  hierarchyRoot: HierarchyPersonNode | null;
  layoutVersion: number;
  orientation: TreeOrientation;
  selectedPersonId: string | null;
  onSelectPerson: (person: Person) => void;
  onHierarchyMutated: () => void;
  zoomBehaviorRef: React.MutableRefObject<d3.ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  svgRef: React.RefObject<SVGSVGElement | null>;
  /** Override wrapper height / border (e.g. public full-bleed layout). */
  className?: string;
  /** Shorter mobile hint text. */
  compactHint?: boolean;
}

type HierarchyPoint = d3.HierarchyPointNode<HierarchyPersonNode>;

interface LinkPoint {
  x: number;
  y: number;
}

interface LinkShape {
  source: LinkPoint;
  target: LinkPoint;
}

/**
 * Total width of a node: the person plus every spouse placed beside them,
 * separated by the couple connector.
 */
function cardWidth(data: HierarchyPersonNode): number {
  const spouseCount = data.spouses.length;
  return NODE_WIDTH * (spouseCount + 1) + COUPLE_GAP * spouseCount;
}

/** Names come from user input and are interpolated into a raw HTML string. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildNodeCardClass(gender: number, isSelected: boolean): string {
  const genderColor = gender === 1 ? 'border-blue-400' : 'border-pink-400';
  const selectedRing = isSelected ? 'ring-2 ring-primary ring-offset-2' : '';
  return `h-full flex-1 min-w-0 bg-card border ${genderColor} ${selectedRing} rounded-md shadow-sm hover:shadow-md transition-all p-1.5 flex flex-col items-center justify-center relative select-none`;
}

function buildPersonCardHtml(person: Person, isSelected: boolean): string {
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const isDead = !person.is_living
    ? `<span class="text-xs text-muted-foreground pointer-events-none absolute top-0.5 right-1.5">†</span>`
    : '';
  const avatarHtml = person.avatar_url
    ? `<img src="${escapeHtml(person.avatar_url)}" class="h-5 w-5 mb-0.5 rounded-full object-cover pointer-events-none border border-muted shadow-sm" loading="lazy" />`
    : `<div class="h-5 w-5 mb-0.5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold border border-muted shadow-sm pointer-events-none">${escapeHtml(getInitials(givenName))}</div>`;
  const familyHtml = familyLine
    ? `<span class="text-[10px] text-muted-foreground text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${escapeHtml(familyLine)}</span>`
    : '';

  return `
    <div data-person-id="${escapeHtml(person.id)}" class="${buildNodeCardClass(person.gender, isSelected)}">
      ${avatarHtml}
      <span class="text-xs font-semibold text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${escapeHtml(givenName)}</span>
      ${familyHtml}
      ${isDead}
    </div>
  `;
}

/** Marriage link between two cards of the same couple. `w-4` must equal COUPLE_GAP. */
const COUPLE_CONNECTOR_HTML =
  '<div class="h-0.5 w-4 shrink-0 self-center bg-pink-400 pointer-events-none"></div>';

function buildNodeHtml(
  data: HierarchyPersonNode,
  selectedPersonId: string | null
): string {
  const cards = [buildPersonCardHtml(data.person, selectedPersonId === data.person.id)];
  for (const spouse of data.spouses) {
    cards.push(COUPLE_CONNECTOR_HTML);
    cards.push(buildPersonCardHtml(spouse, selectedPersonId === spouse.id));
  }
  return `<div class="flex h-full w-full items-stretch">${cards.join('')}</div>`;
}

/** Screen X: depth along X when horizontal, sibling along X when vertical */
function pointX(d: HierarchyPoint, orientation: TreeOrientation): number {
  return orientation === 'horizontal' ? d.y : d.x;
}

/** Screen Y: sibling along Y when horizontal, depth along Y when vertical */
function pointY(d: HierarchyPoint, orientation: TreeOrientation): number {
  return orientation === 'horizontal' ? d.x : d.y;
}

function collapseBtnTransform(
  orientation: TreeOrientation,
  width: number
): string {
  return orientation === 'horizontal'
    ? `translate(${width}, ${NODE_HEIGHT / 2})`
    : `translate(${width / 2}, ${NODE_HEIGHT})`;
}

function createLinkPath(orientation: TreeOrientation) {
  const link =
    orientation === 'horizontal'
      ? d3.linkHorizontal<LinkShape, LinkPoint>()
      : d3.linkVertical<LinkShape, LinkPoint>();
  return link.x((p) => p.x).y((p) => p.y);
}

/**
 * Anchor parent-child links to the card edges rather than the layout point, so
 * the line leaves the outer edge of a couple instead of starting under a card.
 */
function linkEndpoints(
  link: d3.HierarchyPointLink<HierarchyPersonNode>,
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

function appendCollapseButton(
  g: d3.Selection<SVGGElement, HierarchyPoint, d3.BaseType, unknown>,
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

export function FamilyTreeCanvas({
  hierarchyRoot,
  layoutVersion,
  orientation,
  selectedPersonId,
  onSelectPerson,
  onHierarchyMutated,
  zoomBehaviorRef,
  wrapperRef,
  svgRef,
  className,
  compactHint = false,
}: FamilyTreeCanvasProps) {
  const t = useTranslations('Tree');
  const onSelectPersonRef = useRef(onSelectPerson);
  const onHierarchyMutatedRef = useRef(onHierarchyMutated);
  const hierarchyRootRef = useRef(hierarchyRoot);
  const didInitialZoomRef = useRef(false);
  const orientationRef = useRef(orientation);
  /** After expand, pan/zoom to this node on the next layout pass. */
  const pendingFocusNodeIdRef = useRef<string | null>(null);

  useEffect(() => {
    onSelectPersonRef.current = onSelectPerson;
    onHierarchyMutatedRef.current = onHierarchyMutated;
    hierarchyRootRef.current = hierarchyRoot;
  }, [onSelectPerson, onHierarchyMutated, hierarchyRoot]);

  useEffect(() => {
    didInitialZoomRef.current = false;
  }, [hierarchyRoot?.id, orientation]);

  useEffect(() => {
    if (!svgRef.current || !hierarchyRoot) return;

    function toggleNode(node: HierarchyPersonNode) {
      if (!hierarchyHasKids(node)) return;
      if (hierarchyIsCollapsed(node)) {
        pendingFocusNodeIdRef.current = node.id;
      }
      toggleHierarchyNode(node);
      onHierarchyMutatedRef.current();
    }

    const svg = d3
      .select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .datum(TREE_SVG_DATUM);

    let mainContainer = svg.select<SVGGElement>('g.main-container');
    if (mainContainer.empty()) {
      svg
        .append('rect')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'transparent')
        .attr('class', 'zoom-capture');
      mainContainer = svg.append('g').attr('class', 'main-container');
      mainContainer.append('g').attr('class', 'links-layer');
      mainContainer.append('g').attr('class', 'nodes-layer');

      const zoom = d3
        .zoom<SVGSVGElement, TreeSvgDatum>()
        .scaleExtent([TREE_ZOOM_MIN, TREE_ZOOM_MAX])
        .on('zoom', (event) => {
          mainContainer.attr('transform', event.transform.toString());
        });

      svg.call(zoom);
      svg.on('dblclick.zoom', null);
      zoomBehaviorRef.current = zoom;
    }

    const nodeSize: [number, number] =
      orientation === 'horizontal'
        ? [TREE_NODE_SIZE_Y, TREE_NODE_SIZE_X]
        : [TREE_VERTICAL_NODE_SIZE_X, TREE_VERTICAL_NODE_SIZE_Y];

    const treeLayout = d3.tree<HierarchyPersonNode>().nodeSize(nodeSize);

    if (orientation === 'vertical') {
      // Siblings run along X here, so a couple needs room for both cards.
      treeLayout.separation((a, b) => {
        const needed =
          (cardWidth(a.data) + cardWidth(b.data)) / 2 + TREE_SIBLING_GAP;
        const units = needed / nodeSize[0];
        return a.parent === b.parent ? units : units * 1.5;
      });
    }

    const root = d3.hierarchy(hierarchyRoot, (d) => d.children);
    const treeRoot = treeLayout(root) as HierarchyPoint;

    const descendants = treeRoot.descendants();

    if (orientation === 'horizontal') {
      // Depth runs along X here. d3.tree spaces every generation equally, which
      // would either clip couples or pad the whole tree to the widest one, so
      // each generation column is sized to its own widest card.
      const widthByDepth = new Map<number, number>();
      for (const node of descendants) {
        widthByDepth.set(
          node.depth,
          Math.max(widthByDepth.get(node.depth) ?? NODE_WIDTH, cardWidth(node.data))
        );
      }
      const offsetByDepth = new Map<number, number>();
      let offset = 0;
      for (const depth of [...widthByDepth.keys()].sort((a, b) => a - b)) {
        offsetByDepth.set(depth, offset);
        offset += (widthByDepth.get(depth) ?? NODE_WIDTH) + TREE_DEPTH_GAP;
      }
      for (const node of descendants) {
        node.y = offsetByDepth.get(node.depth) ?? node.y;
      }
    }

    const links = treeRoot.links();

    const nodesLayer = mainContainer.select<SVGGElement>('g.nodes-layer');
    const linksLayer = mainContainer.select<SVGGElement>('g.links-layer');

    const linkPath = createLinkPath(orientation);
    const px = (d: HierarchyPoint) => pointX(d, orientation);
    const py = (d: HierarchyPoint) => pointY(d, orientation);

    const linkBinding = linksLayer
      .selectAll<SVGPathElement, d3.HierarchyPointLink<HierarchyPersonNode>>(
        'path.link'
      )
      .data(links, (d) => `${d.source.data.id}->${d.target.data.id}`);

    linkBinding
      .enter()
      .append('path')
      .attr('class', 'link fill-none stroke-current text-muted-foreground')
      .attr('stroke-width', 1.5)
      .attr('d', (d) => {
        const { source } = linkEndpoints(d, orientation);
        return linkPath({ source, target: source });
      })
      .style('opacity', 0)
      .merge(linkBinding)
      .transition()
      .duration(TREE_TRANSITION_MS)
      .style('opacity', 1)
      .attr('d', (d) => linkPath(linkEndpoints(d, orientation)));

    linkBinding
      .exit()
      .transition()
      .duration(TREE_EXIT_TRANSITION_MS)
      .style('opacity', 0)
      .remove();

    const nodeBinding = nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .data(descendants, (d) => d.data.id);

    const nodeEnter = nodeBinding
      .enter()
      .append('g')
      .attr('class', 'node cursor-pointer')
      .attr(
        'transform',
        (d) =>
          `translate(${px(d.parent ?? d) - cardWidth(d.data) / 2}, ${py(d.parent ?? d) - NODE_HEIGHT / 2})`
      )
      .style('opacity', 0)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.id === TREE_VIRTUAL_ROOT_ID) {
          toggleNode(d.data);
          return;
        }
        const cell = (event.target as Element | null)?.closest?.(
          '[data-person-id]'
        );
        const clickedId = cell?.getAttribute('data-person-id');
        const clickedSpouse = clickedId
          ? d.data.spouses.find((s) => s.id === clickedId)
          : undefined;
        onSelectPersonRef.current(clickedSpouse ?? d.data.person);
        // A spouse carries no branch of her own — only the main card collapses.
        if (!clickedSpouse) toggleNode(d.data);
      });

    nodeEnter
      .append('foreignObject')
      .attr('width', (d) => cardWidth(d.data))
      .attr('height', NODE_HEIGHT)
      .html((d) => buildNodeHtml(d.data, selectedPersonId));

    nodeEnter.each(function (d) {
      if (!hierarchyHasKids(d.data)) return;
      const g = d3.select<SVGGElement, HierarchyPoint>(this);
      appendCollapseButton(g, d, orientation, () => {
        toggleNode(d.data);
      });
    });

    nodeEnter
      .merge(nodeBinding)
      .transition()
      .duration(TREE_TRANSITION_MS)
      .attr(
        'transform',
        (d) =>
          `translate(${px(d) - cardWidth(d.data) / 2}, ${py(d) - NODE_HEIGHT / 2})`
      )
      .style('opacity', 1);

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('foreignObject')
      .attr('width', (d) => cardWidth(d.data))
      .html((d) => buildNodeHtml(d.data, selectedPersonId));

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('g.collapse-btn')
      .attr('transform', (d) =>
        collapseBtnTransform(orientation, cardWidth(d.data))
      );

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('g.collapse-btn text')
      .text((d) => (hierarchyIsCollapsed(d.data) ? '+' : '−'));

    nodesLayer.selectAll<SVGGElement, HierarchyPoint>('g.node').each(function (d) {
      const g = d3.select<SVGGElement, HierarchyPoint>(this);
      const hasBtn = !g.select('g.collapse-btn').empty();
      if (hierarchyHasKids(d.data) && !hasBtn) {
        appendCollapseButton(g, d, orientation, () => {
          toggleNode(d.data);
        });
      } else if (!hierarchyHasKids(d.data) && hasBtn) {
        g.select('g.collapse-btn').remove();
      }
    });

    nodeBinding
      .exit()
      .transition()
      .duration(TREE_EXIT_TRANSITION_MS)
      .style('opacity', 0)
      .remove();

    const orientationChanged = orientationRef.current !== orientation;
    orientationRef.current = orientation;

    const focusNodeId = pendingFocusNodeIdRef.current;
    if (
      focusNodeId &&
      zoomBehaviorRef.current &&
      wrapperRef.current &&
      svgRef.current
    ) {
      pendingFocusNodeIdRef.current = null;
      const target = descendants.find((d) => d.data.id === focusNodeId);
      if (target) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        const current = d3.zoomTransform(svgRef.current);
        const scale = current.k;

        // Prefer a point between the opened node and its children so the
        // newly revealed branch stays in view.
        let focusX = px(target);
        let focusY = py(target);
        if (target.children && target.children.length > 0) {
          const childXs = target.children.map((c) => px(c));
          const childYs = target.children.map((c) => py(c));
          const childMidX =
            (Math.min(...childXs) + Math.max(...childXs)) / 2;
          const childMidY =
            (Math.min(...childYs) + Math.max(...childYs)) / 2;
          focusX = (focusX + childMidX) / 2;
          focusY = (focusY + childMidY) / 2;
        }

        svg
          .transition()
          .duration(TREE_FOCUS_TRANSITION_MS)
          .call(
            zoomBehaviorRef.current.transform,
            d3.zoomIdentity
              .translate(clientWidth / 2, clientHeight / 2)
              .scale(scale)
              .translate(-focusX, -focusY)
          );
        didInitialZoomRef.current = true;
        return;
      }
    }

    if (
      (!didInitialZoomRef.current || orientationChanged) &&
      zoomBehaviorRef.current &&
      wrapperRef.current &&
      descendants.length > 0
    ) {
      didInitialZoomRef.current = true;
      const xs = descendants.map((d) => px(d));
      const ys = descendants.map((d) => py(d));
      const midX = (Math.min(...xs) + Math.max(...xs)) / 2;
      const midY = (Math.min(...ys) + Math.max(...ys)) / 2;
      const { clientWidth, clientHeight } = wrapperRef.current;
      const scale =
        clientWidth < TREE_MOBILE_BREAKPOINT
          ? TREE_ZOOM_MOBILE_SCALE
          : TREE_ZOOM_INITIAL_SCALE;
      svg
        .transition()
        .duration(TREE_TRANSITION_MS)
        .call(
          zoomBehaviorRef.current.transform,
          d3.zoomIdentity
            .translate(clientWidth / 2, clientHeight / 2)
            .scale(scale)
            .translate(-midX, -midY)
        );
    }
  }, [
    hierarchyRoot,
    layoutVersion,
    orientation,
    selectedPersonId,
    svgRef,
    wrapperRef,
    zoomBehaviorRef,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'relative h-[85vh] w-full overflow-hidden rounded-xl border bg-muted/30 shadow-inner touch-none',
        className
      )}
    >
      <svg
        ref={svgRef}
        className="h-full w-full touch-none cursor-grab outline-none active:cursor-grabbing"
      />
      <div
        className={cn(
          'pointer-events-none absolute bottom-3 left-3 select-none text-[11px] font-medium text-muted-foreground opacity-60 sm:bottom-4 sm:left-4 sm:text-xs sm:opacity-50',
          compactHint && 'max-w-[70%] leading-snug'
        )}
      >
        {compactHint
          ? t('canvas.hintCompact')
          : t('canvas.hintFull')}
      </div>
    </div>
  );
}
