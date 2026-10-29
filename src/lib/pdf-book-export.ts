/**
 * @project AncestorTree
 * @file src/lib/pdf-book-export.ts
 * @description Full genealogy book PDF — cover, clan history, biography
 *              pages via html2canvas. Not in the lib barrel (lazy deps).
 * @version 1.0.0
 * @updated 2026-10-29
 */

import type { ClanSettings } from '@types';
import { jsPDF } from 'jspdf';
import {
  A4_W_PX,
  biographyPageHtml,
  coverPageHtml,
  historyPageHtml,
} from './pdf-templates';
import {
  htmlToCanvas,
  sliceCanvasToPages,
  type FullGiaPhaOptions,
  type TreeData,
} from './pdf-shared';

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
