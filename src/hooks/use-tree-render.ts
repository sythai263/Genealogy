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
import { useTranslations } from 'next-intl';
import {
  hierarchy,
  select,
  tree,
  zoom,
  zoomIdentity,
  type HierarchyPointLink,
  type ZoomBehavior,
  type ZoomTransform,
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
  const t = useTranslations('Tree');
  const onSelectPersonRef = useRef(onSelectPerson);
  /** Shared axis state — zoom handlers registered once must see fresh data. */
  const axisRowsRef = useRef<
    { depth: number; generation: number; coord: number }[]
  >([]);
  const currentTransformRef = useRef<ZoomTransform>(zoomIdentity);
  const renderAxisRef = useRef<() => void>(() => {});
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

    const AXIS_GUTTER = 64;

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
          currentTransformRef.current = event.transform;
          renderAxisRef.current();
        });

      svg.call(zoomBehavior);
      svg.on('dblclick.zoom', null);
      zoomBehaviorRef.current = zoomBehavior;
    }

    let axisRulesLayer = svg.select<SVGGElement>('g.axis-rules-layer');
    if (axisRulesLayer.empty()) {
      // Rules render beneath node cards; labels stay on top in axis-layer.
      axisRulesLayer = svg
        .insert('g', 'g.main-container')
        .attr('class', 'axis-rules-layer');
    }
    let axisLayer = svg.select<SVGGElement>('g.axis-layer');
    if (axisLayer.empty()) {
      axisLayer = svg.append('g').attr('class', 'axis-layer');
    }

    /** Đời rules pinned to the viewport edge — they pan/zoom with the tree. */
    function renderAxis() {
      const axisRows = axisRowsRef.current;
      const currentTransform = currentTransformRef.current;
      const width = svgRef.current?.clientWidth ?? 0;
      const height = svgRef.current?.clientHeight ?? 0;
      const isHoriz = orientation === 'horizontal';

      const lineSel = axisRulesLayer
        .selectAll<SVGLineElement, (typeof axisRows)[number]>('line.gen-rule')
        .data(axisRows, (d) => d.depth);
      lineSel
        .enter()
        .append('line')
        .attr('class', 'gen-rule')
        .attr('stroke', 'var(--border)')
        .attr('stroke-width', 1)
        .merge(lineSel)
        .attr('x1', (d) =>
          isHoriz ? currentTransform.applyX(d.coord) : AXIS_GUTTER
        )
        .attr('x2', (d) =>
          isHoriz ? currentTransform.applyX(d.coord) : width
        )
        .attr('y1', (d) =>
          isHoriz ? AXIS_GUTTER : currentTransform.applyY(d.coord)
        )
        .attr('y2', (d) =>
          isHoriz ? height : currentTransform.applyY(d.coord)
        );
      lineSel.exit().remove();

      const textSel = axisLayer
        .selectAll<SVGTextElement, (typeof axisRows)[number]>('text.gen-label')
        .data(axisRows, (d) => d.depth);
      textSel
        .enter()
        .append('text')
        .attr('class', 'gen-label fill-muted-foreground')
        .attr('font-size', 10)
        .merge(textSel)
        .attr('text-anchor', isHoriz ? 'middle' : 'end')
        .attr('x', (d) =>
          isHoriz ? currentTransform.applyX(d.coord) : AXIS_GUTTER - 8
        )
        .attr('y', (d) =>
          isHoriz ? AXIS_GUTTER - 8 : currentTransform.applyY(d.coord)
        )
        .attr('dominant-baseline', 'middle')
        .text((d) => t('node.generation', { n: d.generation }));
      textSel.exit().remove();
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

    // Collect each generation's world-space axis coordinate — rendered later
    // in screen space by renderAxis() so Đời labels pin to the viewport edge.
    const axisRowByDepth = new Map<
      number,
      (typeof axisRowsRef.current)[number]
    >();
    for (const node of descendants) {
      if (node.data.id === TREE_VIRTUAL_ROOT_ID) continue;
      if (!axisRowByDepth.has(node.depth)) {
        axisRowByDepth.set(node.depth, {
          depth: node.depth,
          generation: node.data.person.generation,
          coord:
            orientation === 'horizontal'
              ? px(node) + cardWidth(node.data) / 2
              : py(node) + NODE_HEIGHT / 2,
        });
      }
    }
    axisRowsRef.current = [...axisRowByDepth.values()].sort(
      (a, b) => a.depth - b.depth
    );
    renderAxisRef.current = renderAxis;
    renderAxis();

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
        toggleNode(d.data);
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

    // Refit when the canvas resizes (fullscreen toggle, window resize) —
    // otherwise the stale transform leaves the tree shifted off-center.
    const resizeObserver = new ResizeObserver(() => {
      didInitialZoomRef.current = false;
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
    });
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [
    hierarchyRoot,
    isPublic,
    layoutVersion,
    t,
    orientation,
    selectedPersonId,
    svgRef,
    wrapperRef,
    zoomBehaviorRef,
  ]);
}
