/**
 * @project AncestorTree
 * @file src/lib/word-export.ts
 * @description Word (DOCX) export — full genealogy document via `docx` +
 *              `file-saver`. Sections: cover, history, family tree (landscape,
 *              optional), member biographies.
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { ClanSettings } from '@types';
import {
    AlignmentType,
    Document,
    HeadingLevel,
    ImageRun,
    Packer,
    PageOrientation,
    Paragraph,
    TextRun,
    type ISectionOptions,
} from 'docx';
import { saveAs } from 'file-saver';
import {
    DEFAULT_FULL_OPTIONS,
    svgToCanvas,
} from './pdf-book-export';
import type { FullGiaPhaOptions, TreeData } from './pdf-shared';
import {
    buildBiographyChildren,
    buildCoverChildren,
    buildHistoryChildren,
} from './word-export-sections';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WordGiaPhaParams {
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

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Export a complete genealogy document to Word (.docx):
 *  • Trang bìa (tuỳ chọn)
 *  • Lịch sử & nguồn gốc (tuỳ chọn, nếu có nội dung)
 *  • Cây gia phả — trang landscape, ảnh PNG (tuỳ chọn, cần containerElement)
 *  • Lý lịch thành viên theo đời (tuỳ chọn)
 */
export async function exportFullGiaPhaWord(
  params: WordGiaPhaParams
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

  const date = new Date().toISOString().slice(0, 10);
  const clanName =
    clanSettings?.clan_full_name ?? clanSettings?.clan_name ?? 'Gia Phả';
  const filename = `gia-pha-day-du-${date}.docx`;

  const { includeCover, includeHistory, includeTree, includeBiographies } =
    sectionOptions;

  const sections: ISectionOptions[] = [];

  const portraitChildren: Paragraph[] = [];
  if (includeCover) portraitChildren.push(...buildCoverChildren(clanSettings, date));

  const hasHistoryContent = !!(
    clanSettings?.clan_description ||
    clanSettings?.clan_history ||
    clanSettings?.clan_mission ||
    clanSettings?.ancestral_hall_address ||
    clanSettings?.ancestral_hall_history
  );
  if (includeHistory && hasHistoryContent) {
    if (includeCover) {
      portraitChildren.push(new Paragraph({ children: [] }));
    }
    portraitChildren.push(...buildHistoryChildren(clanSettings));
  }
  if (portraitChildren.length > 0) {
    sections.push({ children: portraitChildren });
  }

  const svgEl = includeTree
    ? (containerElement?.querySelector('svg') as SVGSVGElement | null)
    : null;
  if (svgEl) {
    const canvas = await svgToCanvas(svgEl, treeWidth, treeHeight, offsetX, offsetY);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (blob) {
      const data = new Uint8Array(await blob.arrayBuffer());
      // Landscape usable width ≈ 297mm - 20mm margins → ~1000px at 96dpi
      const maxW = 980;
      const scale = Math.min(1, maxW / canvas.width);
      sections.push({
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({ text: 'CÂY GIA PHẢ', bold: true, color: 'b45309', size: 36 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                type: 'png',
                data,
                transformation: {
                  width: Math.round(canvas.width * scale),
                  height: Math.round(canvas.height * scale),
                },
              }),
            ],
          }),
        ],
      });
    }
  }

  if (includeBiographies && treeData.people.length > 0) {
    sections.push({ children: buildBiographyChildren(treeData, clanName) });
  }

  if (sections.length === 0) {
    throw new Error('Không có phần nào được chọn để xuất.');
  }

  const doc = new Document({
    creator: 'AncestorTree',
    title: `Gia phả — ${clanName}`,
    sections,
  });

  const out = await Packer.toBlob(doc);
  saveAs(out, filename);
}
