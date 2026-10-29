/**
 * @project AncestorTree
 * @file src/lib/pdf-shared.ts
 * @description Shared PDF export primitives — page sizes, canvas helpers,
 *              common types. Not in the lib barrel (jspdf/html2canvas lazy).
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { vi } from '@messages/vi';
import type { Family, Person } from '@types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { A4_H_PX, A4_W_PX } from './pdf-templates';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PdfExportOptions {
  filename?: string;
  orientation?: 'landscape' | 'portrait';
  pageSize?: 'a4' | 'a3' | 'a2';
}

/** Which sections to include in the full genealogy PDF */
export interface FullGiaPhaOptions {
  includeCover: boolean;
  includeHistory: boolean;
  includeTree: boolean;
  includeBiographies: boolean;
}

export interface TreeData {
  people: Person[];
  families: Family[];
  children: { family_id: string; person_id: string; sort_order: number }[];
}

type PdfLabels = typeof vi.Documents.pdf;

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_SIZES = {
  a4: { width: 297, height: 210 },
  a3: { width: 420, height: 297 },
  a2: { width: 594, height: 420 },
} as const;

export const HTML2CANVAS_SCALE = 2;

// Brand color palette

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Warn user when the tree is very large */
export function getExportWarning(
  nodeCount: number,
  labels: PdfLabels = vi.Documents.pdf
): string | null {
  if (nodeCount > 100) {
    return labels.warningHuge;
  }
  if (nodeCount > 50) {
    return labels.warningLarge;
  }
  return null;
}

export async function htmlToCanvas(html: string, widthPx: number): Promise<HTMLCanvasElement> {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `position:fixed;left:-99999px;top:0;width:${widthPx}px;height:200px;border:none;pointer-events:none;`;
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          color: #1c1917;
          width: ${widthPx}px;
        }
      </style>
    </head><body>${html}</body></html>`);
    doc.close();

    // Wait for the iframe to lay out its content
    await new Promise<void>((r) => setTimeout(r, 150));

    const fullH = doc.body.scrollHeight;
    iframe.style.height = `${fullH}px`;

    // One more tick for resize to propagate
    await new Promise<void>((r) => setTimeout(r, 50));

    return await html2canvas(doc.body, {
      scale: HTML2CANVAS_SCALE,
      useCORS: false,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: widthPx,
      height: fullH,
      windowWidth: widthPx,
      windowHeight: fullH,
    });
  } finally {
    document.body.removeChild(iframe);
  }
}

/**
 * Slice a tall canvas into A4-portrait-sized pages and add each to the PDF.
 * @param isFirst - if true the very first slice is added without addPage()
 */
export function sliceCanvasToPages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  isFirst: boolean,
): void {
  const pageW = A4_W_PX * HTML2CANVAS_SCALE;
  const pageH = A4_H_PX * HTML2CANVAS_SCALE;
  const totalSlices = Math.ceil(canvas.height / pageH);

  for (let i = 0; i < totalSlices; i++) {
    const srcY  = i * pageH;
    const srcH  = Math.min(pageH, canvas.height - srcY);

    // Draw slice onto a new A4-sized canvas (white background for partial last page)
    const slice = document.createElement('canvas');
    slice.width  = pageW;
    slice.height = pageH;
    const ctx = slice.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageW, pageH);
    ctx.drawImage(canvas, 0, srcY, pageW, srcH, 0, 0, pageW, srcH);

    if (!isFirst || i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
  }
}

