/**
 * @project AncestorTree
 * @file src/components/tree/tree-camera.ts
 * @description Camera work for the tree render pass — pans/zooms to a
 *              pending-focus node after expand, or fits the whole tree on
 *              first layout / orientation change
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { MutableRefObject, RefObject } from 'react';
import {
  zoomIdentity,
  zoomTransform,
  type BaseType,
  type Selection,
  type ZoomBehavior,
} from 'd3';
import {
  TREE_FOCUS_TRANSITION_MS,
  TREE_MOBILE_BREAKPOINT,
  TREE_TRANSITION_MS,
  TREE_ZOOM_INITIAL_SCALE,
  TREE_ZOOM_MOBILE_SCALE,
} from '@constants';
import type { TreeOrientation, TreeSvgDatum } from '@types';
import type { HierarchyPoint } from './tree-d3-helpers';

interface TreeCameraParams {
  svg: Selection<SVGSVGElement, TreeSvgDatum, BaseType, unknown>;
  descendants: HierarchyPoint[];
  orientation: TreeOrientation;
  /** Screen-space point mappers for the current orientation */
  px: (d: HierarchyPoint) => number;
  py: (d: HierarchyPoint) => number;
  orientationRef: MutableRefObject<TreeOrientation>;
  /** Node id to pan/zoom to after expand — consumed if found */
  pendingFocusNodeIdRef: MutableRefObject<string | null>;
  didInitialZoomRef: MutableRefObject<boolean>;
  zoomBehaviorRef: RefObject<ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
}

export function applyTreeCamera({
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
}: TreeCameraParams): void {
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
      const current = zoomTransform(svgRef.current);
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
          zoomIdentity
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
        zoomIdentity
          .translate(clientWidth / 2, clientHeight / 2)
          .scale(scale)
          .translate(-midX, -midY)
      );
  }
}
