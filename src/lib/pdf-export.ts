/**
 * @project AncestorTree
 * @file src/lib/pdf-export.ts
 * @description PDF export for family tree — SVG serialisation + html2canvas for text pages
 * @version 3.0.0
 * @updated 2026-03-13
 */

import { jsPDF } from 'jspdf';
import { svgToCanvas } from './pdf-book-export';
import { PAGE_SIZES, type PdfExportOptions } from './pdf-shared';

// ─── Tree-only PDF export (existing functionality) ────────────────────────────

/**
 * Export the visible family-tree SVG to PDF.
 *
 * Strategy:
 *  1. Clone the container's <svg>, reset pan/zoom transform, set full-tree viewBox.
 *  2. Serialise to a Blob URL and draw via HTMLImageElement onto an off-screen canvas.
 *  3. Convert canvas to PNG and embed in jsPDF.
 *
 * This avoids html2canvas's known inability to render SVG <foreignObject> content.
 */
export async function exportTreeToPdf(
  containerElement: HTMLElement,
  treeWidth: number,
  treeHeight: number,
  offsetX: number,
  offsetY: number = 0,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    filename,
    orientation = 'landscape',
    pageSize = 'a3',
  } = options;

  const date = new Date().toISOString().slice(0, 10);
  const name = filename || `gia-pha-cay-${date}.pdf`;

  // ── 1. Find the SVG inside the container ─────────────────────────────────
  const svgEl = containerElement.querySelector('svg') as SVGSVGElement | null;
  if (!svgEl) throw new Error('Không tìm thấy phần tử SVG để xuất.');

  const svgCanvas = await svgToCanvas(svgEl, treeWidth, treeHeight, offsetX, offsetY);

  // ── 5. Build PDF ──────────────────────────────────────────────────────────
  const imgData = svgCanvas.toDataURL('image/png');
  const dims = PAGE_SIZES[pageSize];
  const pdf = new jsPDF({ orientation, unit: 'mm', format: pageSize.toUpperCase() });

  const pageW = orientation === 'landscape' ? dims.width : dims.height;
  const pageH = orientation === 'landscape' ? dims.height : dims.width;

  const margin   = 10;
  const footerH  = 8;
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2 - footerH;

  const imgRatio  = svgCanvas.width / svgCanvas.height;
  const pageRatio = contentW / contentH;

  let drawW: number, drawH: number;
  if (imgRatio > pageRatio) {
    drawW = contentW;
    drawH = contentW / imgRatio;
  } else {
    drawH = contentH;
    drawW = contentH * imgRatio;
  }

  const dx = margin + (contentW - drawW) / 2;
  const dy = margin + (contentH - drawH) / 2;

  pdf.addImage(imgData, 'PNG', dx, dy, drawW, drawH);

  pdf.setFontSize(7);
  pdf.setTextColor(160, 160, 160);
  pdf.text(
    `Gia Phả Điện Tử — AncestorTree — Xuất ngày ${date}`,
    pageW / 2,
    pageH - 4,
    { align: 'center' },
  );

  pdf.save(name);
}


// Re-export shared + book API so '@lib/pdf-export' callers keep working
export * from './pdf-shared';
export * from './pdf-book-export';
