/**
 * @project AncestorTree
 * @file src/hooks/use-tree-render.ts
 * @description D3 render pass for the family tree canvas — layout, link/node
 *              enter-update-exit, collapse buttons, zoom behavior, and
 *              focus/initial-fit camera work
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  hierarchy,
  select,
  tree,
  zoom,
  type HierarchyPointLink,
  type ZoomBehavior,
} from 'd3';
import {
  NODE_HEIGHT,
  NODE_WIDTH,
  TREE_DEPTH_GAP,
  TREE_EXIT_TRANSITION_MS,
  TREE_NODE_SIZE_X,
  TREE_NODE_SIZE_Y,
  TREE_TRANSITION_MS,
  TREE_VERTICAL_NODE_SIZE_X,
  TREE_VERTICAL_NODE_SIZE_Y,
  TREE_VIRTUAL_ROOT_ID,
  TREE_ZOOM_MAX,
  TREE_ZOOM_MIN,
} from '@constants';
import {
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
import {
  appendCollapseButton,
  applyTreeCamera,
  buildNodeHtml,
  cardWidth,
  collapseBtnTransform,
  coupleAwareSeparation,
  createLinkPath,
  linkEndpoints,
  pointX,
  pointY,
  type HierarchyPoint,
} from '@components/tree';

interface UseTreeRenderParams {
  hierarchyRoot: HierarchyPersonNode | null;
  layoutVersion: number;
  orientation: TreeOrientation;
  selectedPersonId: string | null;
  onSelectPerson: (person: Person) => void;
  onHierarchyMutated: () => void;
  zoomBehaviorRef: RefObject<ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  /** Public landing view — mask living persons' years. */
  isPublic?: boolean;
}

export function useTreeRender({
  hierarchyRoot,
  layoutVersion,
  orientation,
  selectedPersonId,
  onSelectPerson,
  onHierarchyMutated,
  zoomBehaviorRef,
  wrapperRef,
  svgRef,
  isPublic = false,
}: UseTreeRenderParams) {
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

    const svg = select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
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

      const zoomBehavior = zoom<SVGSVGElement, TreeSvgDatum>()
        .scaleExtent([TREE_ZOOM_MIN, TREE_ZOOM_MAX])
        .on('zoom', (event) => {
          mainContainer.attr('transform', event.transform.toString());
        });

      svg.call(zoomBehavior);
      svg.on('dblclick.zoom', null);
      zoomBehaviorRef.current = zoomBehavior;
    }

    const nodeSize: [number, number] =
      orientation === 'horizontal'
        ? [TREE_NODE_SIZE_Y, TREE_NODE_SIZE_X]
        : [TREE_VERTICAL_NODE_SIZE_X, TREE_VERTICAL_NODE_SIZE_Y];

    const treeLayout = tree<HierarchyPersonNode>().nodeSize(nodeSize);

    if (orientation === 'vertical') {
      // Siblings run along X here, so a couple needs room for both cards.
      treeLayout.separation(coupleAwareSeparation(nodeSize[0]));
    }

    const root = hierarchy(hierarchyRoot, (d) => d.children);
    const treeRoot = treeLayout(root) as HierarchyPoint;

    const descendants = treeRoot.descendants();

    if (orientation === 'horizontal') {
      // Depth runs along X here. tree spaces every generation equally, which
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
      .selectAll<SVGPathElement, HierarchyPointLink<HierarchyPersonNode>>(
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
      .html((d) => buildNodeHtml(d.data, selectedPersonId, isPublic));

    nodeEnter.each(function (d) {
      if (!hierarchyHasKids(d.data)) return;
      const g = select<SVGGElement, HierarchyPoint>(this);
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
      .html((d) => buildNodeHtml(d.data, selectedPersonId, isPublic));

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
      const g = select<SVGGElement, HierarchyPoint>(this);
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

    applyTreeCamera({
      svg,
      descendants,
      orientation,
      px,
      py,
      orientationRef,
      pendingFocusNodeIdRef,
      didInitialZoomRef,
      zoomBehaviorRef,
      wrapperRef,
      svgRef,
    });
  }, [
    hierarchyRoot,
    isPublic,
    layoutVersion,
    orientation,
    selectedPersonId,
    svgRef,
    wrapperRef,
    zoomBehaviorRef,
  ]);
}
