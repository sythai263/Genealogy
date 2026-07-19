/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-canvas.tsx
 * @description d3.tree canvas with horizontal/vertical orientation, collapse + zoom
 * @version 2.2.0
 * @updated 2026-07-19
 */

'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  TREE_COLLAPSE_BTN_RADIUS,
  TREE_EXIT_TRANSITION_MS,
  TREE_MOBILE_BREAKPOINT,
  TREE_NODE_SIZE_X,
  TREE_NODE_SIZE_Y,
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

function buildNodeCardClass(gender: number, isSelected: boolean): string {
  const genderColor = gender === 1 ? 'border-blue-400' : 'border-pink-400';
  const selectedRing = isSelected
    ? 'ring-2 ring-primary ring-offset-2'
    : '';
  return `h-full bg-card border ${genderColor} ${selectedRing} rounded-md shadow-sm hover:shadow-md transition-all p-1.5 flex flex-col items-center justify-center relative select-none`;
}

function buildNodeHtml(
  data: HierarchyPersonNode,
  isSelected: boolean
): string {
  const { person, spouse } = data;
  const { givenName, familyLine } = getPersonTreeNameParts(person);
  const isDead = !person.is_living
    ? `<span class="text-xs text-muted-foreground pointer-events-none absolute top-0.5 right-1.5">†</span>`
    : '';
  const avatarHtml = person.avatar_url
    ? `<img src="${person.avatar_url}" class="h-5 w-5 mb-0.5 rounded-full object-cover pointer-events-none border border-muted shadow-sm" loading="lazy" />`
    : `<div class="h-5 w-5 mb-0.5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold border border-muted shadow-sm pointer-events-none">${getInitials(givenName)}</div>`;
  const familyHtml = familyLine
    ? `<span class="text-[10px] text-muted-foreground text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${familyLine}</span>`
    : '';
  const spouseHtml = spouse
    ? `<span class="text-[10px] text-muted-foreground/80 text-center line-clamp-1 leading-tight pointer-events-none px-0.5">· ${getPersonTreeNameParts(spouse).givenName}</span>`
    : '';

  return `
    <div class="${buildNodeCardClass(person.gender, isSelected)}">
      ${avatarHtml}
      <span class="text-xs font-semibold text-center line-clamp-1 leading-tight pointer-events-none px-0.5">${givenName}</span>
      ${familyHtml}
      ${spouseHtml}
      ${isDead}
    </div>
  `;
}

/** Screen X: depth along X when horizontal, sibling along X when vertical */
function pointX(d: HierarchyPoint, orientation: TreeOrientation): number {
  return orientation === 'horizontal' ? d.y : d.x;
}

/** Screen Y: sibling along Y when horizontal, depth along Y when vertical */
function pointY(d: HierarchyPoint, orientation: TreeOrientation): number {
  return orientation === 'horizontal' ? d.x : d.y;
}

function collapseBtnTransform(orientation: TreeOrientation): string {
  return orientation === 'horizontal'
    ? `translate(${NODE_WIDTH}, ${NODE_HEIGHT / 2})`
    : `translate(${NODE_WIDTH / 2}, ${NODE_HEIGHT})`;
}

function createLinkPath(orientation: TreeOrientation) {
  if (orientation === 'horizontal') {
    return d3
      .linkHorizontal<
        d3.HierarchyPointLink<HierarchyPersonNode>,
        HierarchyPoint
      >()
      .x((d) => pointX(d, orientation))
      .y((d) => pointY(d, orientation));
  }
  return d3
    .linkVertical<
      d3.HierarchyPointLink<HierarchyPersonNode>,
      HierarchyPoint
    >()
    .x((d) => pointX(d, orientation))
    .y((d) => pointY(d, orientation));
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
    .attr('transform', collapseBtnTransform(orientation))
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
  const onSelectPersonRef = useRef(onSelectPerson);
  const onHierarchyMutatedRef = useRef(onHierarchyMutated);
  const hierarchyRootRef = useRef(hierarchyRoot);
  const didInitialZoomRef = useRef(false);
  const orientationRef = useRef(orientation);

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

    const root = d3.hierarchy(hierarchyRoot, (d) => d.children);
    const treeRoot = treeLayout(root) as HierarchyPoint;

    const descendants = treeRoot.descendants();
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
        const o: HierarchyPoint = {
          ...d.source,
          x: d.source.x,
          y: d.source.y,
        } as HierarchyPoint;
        return linkPath({ source: o, target: o });
      })
      .style('opacity', 0)
      .merge(linkBinding)
      .transition()
      .duration(TREE_TRANSITION_MS)
      .style('opacity', 1)
      .attr('d', (d) => linkPath(d));

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
          `translate(${px(d.parent ?? d) - NODE_WIDTH / 2}, ${py(d.parent ?? d) - NODE_HEIGHT / 2})`
      )
      .style('opacity', 0)
      .on('click', (event, d) => {
        event.stopPropagation();
        if (d.data.id !== TREE_VIRTUAL_ROOT_ID) {
          onSelectPersonRef.current(d.data.person);
        }
        if (hierarchyHasKids(d.data)) {
          toggleHierarchyNode(d.data);
          onHierarchyMutatedRef.current();
        }
      });

    nodeEnter
      .append('foreignObject')
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .html((d) =>
        buildNodeHtml(d.data, selectedPersonId === d.data.person.id)
      );

    nodeEnter.each(function (d) {
      if (!hierarchyHasKids(d.data)) return;
      const g = d3.select<SVGGElement, HierarchyPoint>(this);
      appendCollapseButton(g, d, orientation, () => {
        if (hierarchyHasKids(d.data)) {
          toggleHierarchyNode(d.data);
          onHierarchyMutatedRef.current();
        }
      });
    });

    nodeEnter
      .merge(nodeBinding)
      .transition()
      .duration(TREE_TRANSITION_MS)
      .attr(
        'transform',
        (d) =>
          `translate(${px(d) - NODE_WIDTH / 2}, ${py(d) - NODE_HEIGHT / 2})`
      )
      .style('opacity', 1);

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('foreignObject')
      .html((d) =>
        buildNodeHtml(d.data, selectedPersonId === d.data.person.id)
      );

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('g.collapse-btn')
      .attr('transform', collapseBtnTransform(orientation));

    nodesLayer
      .selectAll<SVGGElement, HierarchyPoint>('g.node')
      .select('g.collapse-btn text')
      .text((d) => (hierarchyIsCollapsed(d.data) ? '+' : '−'));

    nodesLayer.selectAll<SVGGElement, HierarchyPoint>('g.node').each(function (d) {
      const g = d3.select<SVGGElement, HierarchyPoint>(this);
      const hasBtn = !g.select('g.collapse-btn').empty();
      if (hierarchyHasKids(d.data) && !hasBtn) {
        appendCollapseButton(g, d, orientation, () => {
          if (hierarchyHasKids(d.data)) {
            toggleHierarchyNode(d.data);
            onHierarchyMutatedRef.current();
          }
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
          ? 'Kéo để di chuyển · Dùng nút +/- để zoom'
          : 'Kéo để di chuyển · Cuộn để zoom · Click nút ± để thu/mở nhánh'}
      </div>
    </div>
  );
}
