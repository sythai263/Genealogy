/**
 * @project AncestorTree
 * @file src/lib/pdf-export.ts
 * @description PDF export for family tree — SVG serialisation + html2canvas for text pages
 * @version 3.0.0
 * @updated 2026-03-13
 */

import { vi } from '@messages/vi';
import type { ClanSettings, Family, Person } from '@types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  A4_H_PX,
  A4_W_PX,
  biographyPageHtml,
  coverPageHtml,
  historyPageHtml,
} from './pdf-templates';

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

const PAGE_SIZES = {
  a4: { width: 297, height: 210 },
  a3: { width: 420, height: 297 },
  a2: { width: 594, height: 420 },
} as const;

const HTML2CANVAS_SCALE = 2;

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

async function htmlToCanvas(html: string, widthPx: number): Promise<HTMLCanvasElement> {
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
function sliceCanvasToPages(
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

// ─── HTML templates ───────────────────────────────────────────────────────────

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

// ─── Full genealogy PDF export ────────────────────────────────────────────────

/**
 * Render the family tree SVG into an off-screen canvas (shared by both exports).
 */
export async function svgToCanvas(
  svgEl: SVGSVGElement,
  treeWidth: number,
  treeHeight: number,
  offsetX: number,
  offsetY: number = 0,
): Promise<HTMLCanvasElement> {
  const padding = 60;
  const fullW   = Math.max(treeWidth + padding * 2, 400);
  const fullH   = Math.max(treeHeight + padding * 2, 300);

  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width',   String(fullW));
  clone.setAttribute('height',  String(fullH));
  clone.setAttribute('viewBox', `0 0 ${fullW} ${fullH}`);

  const outerG = clone.querySelector('g') as SVGGElement | null;
  if (outerG) {
    outerG.setAttribute('transform', 'translate(0,0) scale(1)');
    const innerG = outerG.querySelector('g') as SVGGElement | null;
    if (innerG) {
      innerG.setAttribute('transform', `translate(${offsetX + padding},${offsetY + padding})`);
    }
  }
  clone.querySelectorAll('[data-html2canvas-ignore]').forEach((el) => el.remove());

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
  bg.setAttribute('width', String(fullW)); bg.setAttribute('height', String(fullH));
  bg.setAttribute('fill', '#ffffff');
  clone.insertBefore(bg, clone.firstChild);

  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url    = URL.createObjectURL(blob);

  const DPR    = 2;
  const canvas = document.createElement('canvas');
  canvas.width  = fullW * DPR;
  canvas.height = fullH * DPR;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = new Image();
  img.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload  = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(); };
      img.onerror = () => reject(new Error('Không thể render SVG thành ảnh.'));
      setTimeout(() => reject(new Error('Render SVG bị hết giờ (>15s).')), 15_000);
    });
  } finally {
    URL.revokeObjectURL(url);
  }

  return canvas;
}

/** Default section options — all sections enabled */
export const DEFAULT_FULL_OPTIONS: FullGiaPhaOptions = {
  includeCover: true,
  includeHistory: true,
  includeTree: true,
  includeBiographies: true,
};

/**
 * Export a complete genealogy document to PDF (A4):
 *  • Trang bìa (tuỳ chọn)
 *  • Lịch sử & nguồn gốc (tuỳ chọn, nếu có nội dung)
 *  • Cây gia phả A4 landscape (tuỳ chọn)
 *  • Lý lịch từng thành viên theo từng đời (tuỳ chọn)
 */
export interface FullGiaPhaExportParams {
  /** Element wrapping the rendered tree <svg>; null skips the tree section */
  containerElement: HTMLElement | null;
  treeWidth?: number;
  treeHeight?: number;
  offsetX?: number;
  offsetY?: number;
  treeData: TreeData;
  clanSettings: ClanSettings | null;
  sectionOptions?: FullGiaPhaOptions;
}

export async function exportFullGiaPha(
  params: FullGiaPhaExportParams,
): Promise<void> {
  const {
    containerElement,
    treeWidth = 0,
    treeHeight = 0,
    offsetX = 0,
    offsetY = 0,
    treeData,
    clanSettings,
    sectionOptions = DEFAULT_FULL_OPTIONS,
  } = params;
  const date     = new Date().toISOString().slice(0, 10);
  const clanName = clanSettings?.clan_full_name ?? clanSettings?.clan_name ?? 'Gia Phả';
  const filename = `gia-pha-day-du-${date}.pdf`;

  const { includeCover, includeHistory, includeTree, includeBiographies } = sectionOptions;
  let isFirstPage = true;

  // ── Helper: add page (skip addPage for the very first page) ──────────────
  const nextPage = (orientation: 'portrait' | 'landscape' = 'portrait') => {
    if (isFirstPage) { isFirstPage = false; return; }
    pdf.addPage('a4', orientation);
  };

  // ── Start PDF ─────────────────────────────────────────────────────────────
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'A4' });

  // ── Trang bìa ─────────────────────────────────────────────────────────────
  if (includeCover) {
    nextPage('portrait');
    const coverCanvas = await htmlToCanvas(coverPageHtml(clanSettings, date), A4_W_PX);
    pdf.addImage(coverCanvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
  }

  // ── Lịch sử & Nguồn gốc ──────────────────────────────────────────────────
  const hasHistoryContent = !!(
    clanSettings?.clan_description ||
    clanSettings?.clan_history ||
    clanSettings?.clan_mission ||
    clanSettings?.ancestral_hall_address ||
    clanSettings?.ancestral_hall_history
  );

  if (includeHistory && hasHistoryContent) {
    if (isFirstPage) isFirstPage = false; else pdf.addPage('a4', 'portrait');
    const histCanvas = await htmlToCanvas(historyPageHtml(clanSettings), A4_W_PX);
    // First slice goes on current page; remaining slices add pages themselves
    sliceCanvasToPages(pdf, histCanvas, true);
  }

  // ── Cây gia phả (A4 landscape) ───────────────────────────────────────────
  if (includeTree && containerElement) {
    const svgEl = containerElement.querySelector('svg') as SVGSVGElement | null;
    if (svgEl) {
      if (isFirstPage) isFirstPage = false; else pdf.addPage('a4', 'landscape');
      const treeCanvas = await svgToCanvas(svgEl, treeWidth, treeHeight, offsetX, offsetY);

      const margin   = 10;
      const footerH  = 8;
      const pageW    = 297, pageH = 210;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2 - footerH;

      const imgRatio  = treeCanvas.width / treeCanvas.height;
      const pageRatio = contentW / contentH;

      let drawW: number, drawH: number;
      if (imgRatio > pageRatio) {
        drawW = contentW; drawH = contentW / imgRatio;
      } else {
        drawH = contentH; drawW = contentH * imgRatio;
      }
      const dx = margin + (contentW - drawW) / 2;
      const dy = margin + (contentH - drawH) / 2;

      pdf.addImage(treeCanvas.toDataURL('image/png'), 'PNG', dx, dy, drawW, drawH);

      pdf.setFontSize(9);
      pdf.setTextColor(180, 83, 9);
      pdf.text('CÂY GIA PHẢ', pageW / 2, margin - 2, { align: 'center' });

      pdf.setFontSize(7);
      pdf.setTextColor(160, 160, 160);
      pdf.text(
        `${clanName} · Cây gia phả · Xuất ngày ${date}`,
        pageW / 2, pageH - 3,
        { align: 'center' },
      );
    }
  }

  // ── Lý lịch thành viên ────────────────────────────────────────────────────
  if (includeBiographies && treeData.people.length > 0) {
    if (isFirstPage) isFirstPage = false; else pdf.addPage('a4', 'portrait');
    const bioHtml   = biographyPageHtml(treeData.people, treeData.families, clanName);
    const bioCanvas = await htmlToCanvas(bioHtml, A4_W_PX);
    sliceCanvasToPages(pdf, bioCanvas, true);
  }

  if (isFirstPage) throw new Error('Không có trang nào được chọn để xuất.');
  pdf.save(filename);
}
