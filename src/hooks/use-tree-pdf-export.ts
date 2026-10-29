/**
 * @project AncestorTree
 * @file src/hooks/use-tree-pdf-export.ts
 * @description Exports the rendered tree SVG to PDF. The content bounding box
 *              is measured off `g.main-container` (zoom transform lives on
 *              that <g>, so getBBox() returns pre-zoom local coordinates) and
 *              passed as offsets so the export captures the full tree
 *              regardless of the current pan/zoom.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface UseTreePdfExportParams {
  svgRef: RefObject<SVGSVGElement | null>;
  wrapperRef: RefObject<HTMLDivElement | null>;
}

export function useTreePdfExport({
  svgRef,
  wrapperRef,
}: UseTreePdfExportParams) {
  const tTree = useTranslations('Tree');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  async function handleExportPdf() {
    const container = wrapperRef.current;
    const mainG = svgRef.current?.querySelector('g.main-container');
    if (!container || !mainG || !(mainG instanceof SVGGElement)) {
      toast.error(tTree('export.error'));
      return;
    }

    setIsExportingPdf(true);
    try {
      const bbox = mainG.getBBox();
      const { exportTreeToPdf } = await import('@lib/pdf-export');
      await exportTreeToPdf(
        container,
        Math.max(bbox.width, 1),
        Math.max(bbox.height, 1),
        -bbox.x,
        -bbox.y
      );
      toast.success(tTree('export.success'));
    } catch {
      toast.error(tTree('export.error'));
    } finally {
      setIsExportingPdf(false);
    }
  }

  return { isExportingPdf, handleExportPdf };
}
