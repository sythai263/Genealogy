/**
 * @project AncestorTree
 * @file src/hooks/use-tree-zoom.ts
 * @description D3 zoom controls for the family tree canvas — zoom in/out/reset
 *              animated via the shared zoom behavior
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import type { RefObject } from 'react';
import { select, type ZoomBehavior } from 'd3';
import {
  TREE_ZOOM_IN_FACTOR,
  TREE_ZOOM_OUT_FACTOR,
} from '@constants';
import type { TreeSvgDatum } from '@types';

interface UseTreeZoomParams {
  svgRef: RefObject<SVGSVGElement | null>;
  zoomBehaviorRef: RefObject<ZoomBehavior<
    SVGSVGElement,
    TreeSvgDatum
  > | null>;
}

export function useTreeZoom({ svgRef, zoomBehaviorRef }: UseTreeZoomParams) {
  function handleZoomIn() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_IN_FACTOR);
  }

  function handleZoomOut() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleBy, TREE_ZOOM_OUT_FACTOR);
  }

  function handleResetZoom() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select<SVGSVGElement, TreeSvgDatum>(svgRef.current)
      .transition()
      .call(zoomBehaviorRef.current.scaleTo, 1);
  }

  return { handleZoomIn, handleZoomOut, handleResetZoom };
}
