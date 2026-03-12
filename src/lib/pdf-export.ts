/**
 * @project AncestorTree
 * @file src/lib/pdf-export.ts
 * @description PDF export for family tree visualization using html2canvas + jsPDF
 * @version 1.0.0
 * @updated 2026-03-09
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  filename?: string;
  scale?: number;
  orientation?: 'landscape' | 'portrait';
  pageSize?: 'a4' | 'a3' | 'a2';
}

const PAGE_SIZES = {
  a4: { width: 297, height: 210 },   // landscape
  a3: { width: 420, height: 297 },
  a2: { width: 594, height: 420 },
} as const;

/** Estimate quality based on node count */
export function getExportWarning(nodeCount: number): string | null {
  if (nodeCount > 100) {
    return 'Cây quá lớn (>100 người). Vui lòng lọc theo nhánh trước khi xuất để đảm bảo chất lượng.';
  }
  if (nodeCount > 50) {
    return 'Cây khá lớn (>50 người). Chất lượng hình ảnh có thể bị giảm.';
  }
  return null;
}

export async function exportTreeToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {},
): Promise<void> {
  const {
    filename,
    scale = 2,
    orientation = 'landscape',
    pageSize = 'a3',
  } = options;

  const date = new Date().toISOString().slice(0, 10);
  const name = filename || `gia-pha-${date}.pdf`;

  // Capture the element as canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const dimensions = PAGE_SIZES[pageSize];

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize.toUpperCase(),
  });

  const pageWidth = orientation === 'landscape' ? dimensions.width : dimensions.height;
  const pageHeight = orientation === 'landscape' ? dimensions.height : dimensions.width;

  // Margins
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  // Scale image to fit
  const imgRatio = canvas.width / canvas.height;
  const pageRatio = contentWidth / contentHeight;

  let drawWidth: number;
  let drawHeight: number;

  if (imgRatio > pageRatio) {
    drawWidth = contentWidth;
    drawHeight = contentWidth / imgRatio;
  } else {
    drawHeight = contentHeight;
    drawWidth = contentHeight * imgRatio;
  }

  const x = margin + (contentWidth - drawWidth) / 2;
  const y = margin + (contentHeight - drawHeight) / 2;

  pdf.addImage(imgData, 'PNG', x, y, drawWidth, drawHeight);

  // Add footer
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(
    `Gia Phả Điện Tử — AncestorTree — Xuất ngày ${date}`,
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' },
  );

  pdf.save(name);
}
