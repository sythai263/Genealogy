/**
 * @project AncestorTree
 * @file src/lib/word-export.ts
 * @description Word (DOCX) export — full genealogy document via `docx` +
 *              `file-saver`. Sections: cover, history, family tree (landscape,
 *              optional), member biographies.
 * @version 1.0.0
 * @updated 2026-08-09
 */

import type { ClanSettings, Person } from '@types';
import {
    AlignmentType,
    BorderStyle,
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
    type FullGiaPhaOptions,
    type TreeData,
} from './pdf-export';

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bodyParagraphs(text: string): Paragraph[] {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: line, size: 24 })],
        })
    );
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 160 },
    children: [
      new TextRun({ text, bold: true, color: 'b45309', size: 30 }),
    ],
  });
}

function fmtPersonDate(person: Person): string {
  const birth = person.birth_date ?? (person.birth_year ? String(person.birth_year) : '—');
  const death = person.is_living
    ? ''
    : ` — ${person.death_date ?? (person.death_year ? String(person.death_year) : '—')}`;
  return `${birth}${death}`;
}

// ─── Section builders ─────────────────────────────────────────────────────────

function buildCoverChildren(
  clanSettings: ClanSettings | null,
  date: string
): Paragraph[] {
  const clanName =
    clanSettings?.clan_full_name ?? clanSettings?.clan_name ?? 'Gia Phả Chi Tộc';
  const lines: Paragraph[] = [
    new Paragraph({ spacing: { before: 2400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: 'GIA PHẢ ĐIỆN TỬ',
          size: 24,
          color: '78716c',
          characterSpacing: 40,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      children: [
        new TextRun({ text: clanName, bold: true, size: 72, color: '1c1917' }),
      ],
    }),
  ];

  const info: [string, string | number | null | undefined][] = [
    ['Thủy tổ', clanSettings?.clan_patriarch],
    ['Năm thành lập', clanSettings?.clan_founding_year],
    ['Nguồn gốc', clanSettings?.clan_origin],
    ['Liên hệ', [clanSettings?.contact_phone, clanSettings?.contact_email].filter(Boolean).join(' · ') || undefined],
  ];
  for (const [label, value] of info) {
    if (!value) continue;
    lines.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({ text: `${label}: `, color: '78716c', size: 28 }),
          new TextRun({ text: String(value), bold: true, size: 28 }),
        ],
      })
    );
  }

  lines.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 960 },
      children: [
        new TextRun({
          text: `Xuất ngày ${date}`,
          color: 'a8a29e',
          size: 20,
          italics: true,
        }),
      ],
    })
  );
  return lines;
}

function buildHistoryChildren(clanSettings: ClanSettings | null): Paragraph[] {
  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 320 },
      children: [
        new TextRun({ text: 'Lịch Sử & Nguồn Gốc', bold: true, size: 44 }),
      ],
    }),
  ];

  const sections: [string, string | null | undefined][] = [
    ['Giới thiệu', clanSettings?.clan_description],
    ['Lịch sử dòng họ', clanSettings?.clan_history],
    ['Sứ mệnh & Giá trị', clanSettings?.clan_mission],
    [
      'Nhà thờ họ',
      [clanSettings?.ancestral_hall_address, clanSettings?.ancestral_hall_history]
        .filter(Boolean)
        .join('\n\n') || undefined,
    ],
  ];

  for (const [title, body] of sections) {
    if (!body) continue;
    children.push(sectionHeading(title), ...bodyParagraphs(body));
  }
  return children;
}

function buildBiographyChildren(treeData: TreeData, clanName: string): Paragraph[] {
  const sorted = [...treeData.people].sort((a, b) =>
    a.generation !== b.generation
      ? a.generation - b.generation
      : a.display_name.localeCompare(b.display_name, 'vi')
  );

  const byGen = new Map<number, Person[]>();
  for (const person of sorted) {
    const gen = person.generation ?? 0;
    const list = byGen.get(gen) ?? [];
    list.push(person);
    byGen.set(gen, list);
  }

  const children: Paragraph[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: 'Lý Lịch Thành Viên', bold: true, size: 44 }),
      ],
    }),
    new Paragraph({
      spacing: { after: 320 },
      children: [new TextRun({ text: clanName, color: '78716c', size: 24 })],
    }),
  ];

  for (const [gen, members] of [...byGen.entries()].sort(([a], [b]) => a - b)) {
    children.push(sectionHeading(`Đời ${gen} — ${members.length} người`));

    for (const person of members) {
      const gender = person.gender === 1 ? 'Nam' : person.gender === 2 ? 'Nữ' : '';
      const extras = [
        person.taboo_name ? `Húy: ${person.taboo_name}` : '',
        person.pen_name ? `Tự: ${person.pen_name}` : '',
      ]
        .filter(Boolean)
        .join(' · ');

      children.push(
        new Paragraph({
          spacing: { before: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'e7e5e4' } },
          children: [
            new TextRun({ text: person.display_name, bold: true, size: 28 }),
            new TextRun({
              text: `   ${person.is_living ? '' : '† '}${fmtPersonDate(person)}${gender ? ` · ${gender}` : ''}`,
              color: '57534e',
              size: 22,
            }),
          ],
        })
      );
      if (extras) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: extras, color: '78716c', size: 20 })],
          })
        );
      }
      if (person.biography) {
        children.push(...bodyParagraphs(person.biography));
      }
    }
  }
  return children;
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
