/**
 * @project AncestorTree
 * @file src/lib/pdf-templates.ts
 * @description HTML page templates for PDF export — cover, clan history,
 *              person card rows, biography pages. Not in the lib barrel:
 *              only pdf-export imports these (jspdf/html2canvas stay lazy).
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { vi } from '@messages/vi';
import type { ClanSettings, Family, Person } from '@types';

// A4 portrait pixel dimensions at 96dpi (210mm × 297mm)
export const A4_W_PX = 794;
export const A4_H_PX = 1123;

// Brand color palette
const COLOR_AMBER  = '#b45309';
const COLOR_DARK   = '#1c1917';
const COLOR_GRAY   = '#78716c';
const COLOR_LIGHT  = '#fef3c7';
const COLOR_BORDER = '#d97706';
const COLOR_BLUE_BG  = '#eff6ff';
const COLOR_BLUE_BD  = '#93c5fd';
const COLOR_PINK_BG  = '#fff1f2';
const COLOR_PINK_BD  = '#fda4af';

// ─── Helpers ──

export function fmtDate(date?: string, year?: number): string {
  if (date && date.trim()) return date.trim();
  if (year) return `${year}`;
  return '—';
}

/**
 * Render an HTML string into a full-content canvas (may be taller than A4).
 *
 * Uses an isolated <iframe> so html2canvas only sees our clean inline styles
 * and does NOT parse the parent page's Tailwind CSS 4 stylesheet — which uses
 * modern color functions (lab(), oklch()) that html2canvas v1.4.x cannot parse.
 */

// ─── HTML templates ──

export function coverPageHtml(cs: ClanSettings | null, date: string): string {
  const clanName     = cs?.clan_full_name ?? cs?.clan_name ?? 'Gia Phả Chi Tộc';
  const patriarch    = cs?.clan_patriarch  ?? '';
  const foundingYear = cs?.clan_founding_year ?? '';
  const origin       = cs?.clan_origin     ?? '';
  const contact      = [cs?.contact_phone, cs?.contact_email].filter(Boolean).join(' · ');

  const statRow = (label: string, value: string | number) =>
    value
      ? `<tr>
           <td style="padding:6px 16px 6px 0;color:${COLOR_GRAY};white-space:nowrap;">${label}:</td>
           <td style="padding:6px 0;font-weight:600;color:${COLOR_DARK};">${value}</td>
         </tr>`
      : '';

  return `
<div style="width:${A4_W_PX}px;height:${A4_H_PX}px;background:#ffffff;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            padding:60px;box-sizing:border-box;border:0;">

  <!-- Decorative outer border -->
  <div style="width:100%;height:100%;border:12px double ${COLOR_BORDER};
              display:flex;flex-direction:column;align-items:center;justify-content:center;
              padding:40px;box-sizing:border-box;position:relative;">

    <!-- Top ornament -->
    <div style="font-size:40px;color:${COLOR_AMBER};letter-spacing:6px;margin-bottom:24px;">
      &#10022; &#10022; &#10022;
    </div>

    <!-- Main title -->
    <div style="font-size:13px;letter-spacing:6px;color:${COLOR_GRAY};text-transform:uppercase;margin-bottom:8px;">
      GIA PHẢ ĐIỆN TỬ
    </div>
    <h1 style="font-size:32px;font-weight:900;color:${COLOR_DARK};text-align:center;
               margin:0 0 4px 0;line-height:1.2;">
      ${clanName}
    </h1>
    <div style="width:120px;height:3px;background:${COLOR_BORDER};margin:20px auto;"></div>

    <!-- Info table -->
    <table style="border-collapse:collapse;margin-top:24px;font-size:15px;">
      ${statRow('Thủy tổ', patriarch)}
      ${statRow('Năm thành lập', foundingYear)}
      ${statRow('Nguồn gốc', origin)}
      ${contact ? statRow('Liên hệ', contact) : ''}
    </table>

    <!-- Bottom ornament -->
    <div style="margin-top:40px;font-size:11px;color:${COLOR_GRAY};letter-spacing:2px;text-align:center;">
      &#10022; &nbsp; Xuất ngày ${date} &nbsp; &#10022;
    </div>
    <div style="font-size:10px;color:#d4d4d4;margin-top:8px;">AncestorTree v3.0</div>
  </div>
</div>`;
}

export function historyPageHtml(cs: ClanSettings | null): string {
  const description = cs?.clan_description ?? '';
  const history     = cs?.clan_history     ?? '';
  const mission     = cs?.clan_mission     ?? '';
  const hallAddr    = cs?.ancestral_hall_address ?? '';
  const hallHist    = cs?.ancestral_hall_history ?? '';

  const section = (title: string, body: string) =>
    body
      ? `<div style="margin-bottom:28px;">
           <h2 style="font-size:15px;font-weight:700;color:${COLOR_AMBER};
                      border-bottom:2px solid ${COLOR_LIGHT};padding-bottom:6px;margin:0 0 12px 0;">
             ${title}
           </h2>
           <p style="margin:0;line-height:1.8;color:${COLOR_DARK};white-space:pre-wrap;">${body}</p>
         </div>`
      : '';

  return `
<div style="width:${A4_W_PX}px;min-height:${A4_H_PX}px;background:#ffffff;
            padding:60px;box-sizing:border-box;font-size:13px;">

  <!-- Page header -->
  <div style="text-align:center;margin-bottom:36px;padding-bottom:20px;
              border-bottom:3px solid ${COLOR_BORDER};">
    <div style="font-size:11px;letter-spacing:4px;color:${COLOR_GRAY};margin-bottom:6px;">GIA PHẢ ĐIỆN TỬ</div>
    <h1 style="font-size:24px;font-weight:800;color:${COLOR_DARK};margin:0;">
      Lịch Sử &amp; Nguồn Gốc
    </h1>
  </div>

  ${section('Giới thiệu', description)}
  ${section('Lịch sử dòng họ', history)}
  ${section('Sứ mệnh &amp; Giá trị', mission)}
  ${hallAddr || hallHist ? section('Nhà thờ họ', [hallAddr, hallHist].filter(Boolean).join('\n\n')) : ''}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:12px;border-top:1px solid #e5e7eb;
              font-size:10px;color:#d4d4d4;text-align:center;">
    AncestorTree · Gia Phả Điện Tử
  </div>
</div>`;
}

export function personCard(p: Person): string {
  const isMale   = p.gender === 1;
  const bg       = isMale ? COLOR_BLUE_BG  : COLOR_PINK_BG;
  const border   = isMale ? COLOR_BLUE_BD  : COLOR_PINK_BD;
  const genderLabel = isMale ? 'Nam' : 'Nữ';
  const statusBadge = p.is_living
    ? `<span style="background:#dcfce7;color:#166534;padding:1px 8px;border-radius:99px;font-size:10px;">Còn sống</span>`
    : `<span style="background:#fee2e2;color:#991b1b;padding:1px 8px;border-radius:99px;font-size:10px;">† Đã mất</span>`;

  const row = (label: string, value: string | undefined | null) =>
    value && value !== '—'
      ? `<tr>
           <td style="width:130px;color:${COLOR_GRAY};padding:3px 8px 3px 0;vertical-align:top;font-size:11px;">${label}:</td>
           <td style="color:${COLOR_DARK};padding:3px 0;font-size:11px;">${value}</td>
         </tr>`
      : '';

  const names: string[] = [];
  if (p.taboo_name) names.push(`Húy: ${p.taboo_name}`);
  if (p.pen_name)   names.push(`Tự: ${p.pen_name}`);

  return `
<div style="background:${bg};border:1.5px solid ${border};border-radius:8px;
            padding:14px 16px;margin-bottom:14px;break-inside:avoid;">

  <!-- Header row -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
    <div>
      <span style="font-size:15px;font-weight:700;color:${COLOR_DARK};">
        ${p.display_name}
      </span>
      ${names.length ? `<span style="font-size:10px;color:${COLOR_GRAY};margin-left:8px;">(${names.join(' · ')})</span>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;margin-left:12px;">
      ${statusBadge}
      <span style="font-size:10px;color:${COLOR_GRAY};">Đời ${p.generation} · ${genderLabel}</span>
    </div>
  </div>

  <!-- Details -->
  <table style="border-collapse:collapse;width:100%;">
    ${row('Sinh', fmtDate(p.birth_date, p.birth_year))}
    ${row('Nơi sinh', p.birth_place)}
    ${!p.is_living ? row('Mất', fmtDate(p.death_date, p.death_year)) : ''}
    ${!p.is_living && p.death_lunar ? row('Ngày mất âm', p.death_lunar) : ''}
    ${!p.is_living ? row('Nơi mất', p.death_place) : ''}
    ${row('Quê quán', p.hometown)}
    ${row('Địa chỉ', p.address)}
    ${row('Nghề nghiệp', p.occupation)}
  </table>

  ${p.biography ? `
  <div style="margin-top:8px;padding-top:8px;border-top:1px solid ${border};">
    <div style="font-size:10px;font-weight:600;color:${COLOR_GRAY};margin-bottom:4px;">Tiểu sử:</div>
    <p style="margin:0;font-size:11px;line-height:1.7;color:${COLOR_DARK};">${p.biography}</p>
  </div>` : ''}

  ${p.notes ? `
  <div style="margin-top:6px;">
    <div style="font-size:10px;font-weight:600;color:${COLOR_GRAY};margin-bottom:2px;">Ghi chú:</div>
    <p style="margin:0;font-size:10px;color:${COLOR_GRAY};font-style:italic;">${p.notes}</p>
  </div>` : ''}
</div>`;
}

export function biographyPageHtml(people: Person[], families: Family[], clanName: string): string {
  // Sort by generation, then sort_order within same generation
  const sorted = [...people].sort((a, b) => {
    if (a.generation !== b.generation) return a.generation - b.generation;
    return a.display_name.localeCompare(b.display_name, 'vi');
  });

  // Group by generation
  const byGen = new Map<number, Person[]>();
  for (const p of sorted) {
    const g = p.generation ?? 0;
    if (!byGen.has(g)) byGen.set(g, []);
    byGen.get(g)!.push(p);
  }

  const generations = Array.from(byGen.entries()).sort(([a], [b]) => a - b);

  const stats = [
    { label: vi.Documents.pdf.totalMembers, value: people.length },
    { label: vi.Documents.pdf.living, value: people.filter((p) => p.is_living).length },
    { label: vi.Documents.pdf.deceased, value: people.filter((p) => !p.is_living).length },
    { label: vi.Documents.pdf.generations, value: generations.length },
    { label: vi.Documents.pdf.families, value: families.length },
  ];

  return `
<div style="width:${A4_W_PX}px;min-height:${A4_H_PX}px;background:#ffffff;
            padding:50px 48px;box-sizing:border-box;font-size:13px;">

  <!-- Page header -->
  <div style="text-align:center;margin-bottom:28px;padding-bottom:16px;
              border-bottom:3px solid ${COLOR_BORDER};">
    <div style="font-size:11px;letter-spacing:4px;color:${COLOR_GRAY};margin-bottom:4px;">${vi.Documents.pdf.digitalGenealogy}</div>
    <h1 style="font-size:22px;font-weight:800;color:${COLOR_DARK};margin:0;">
      ${vi.Documents.pdf.memberProfiles}
    </h1>
    <div style="font-size:12px;color:${COLOR_GRAY};margin-top:4px;">${clanName}</div>
  </div>

  <!-- Summary stats -->
  <div style="display:flex;gap:0;margin-bottom:28px;border:1.5px solid ${COLOR_LIGHT};border-radius:8px;overflow:hidden;">
    ${stats.map((s) => `
    <div style="flex:1;text-align:center;padding:12px 8px;border-right:1px solid ${COLOR_LIGHT};">
      <div style="font-size:20px;font-weight:700;color:${COLOR_AMBER};">${s.value}</div>
      <div style="font-size:10px;color:${COLOR_GRAY};margin-top:2px;">${s.label}</div>
    </div>`).join('')}
  </div>

  <!-- Members by generation -->
  ${generations.map(([gen, members]) => `
  <div style="margin-bottom:24px;">
    <div style="background:${COLOR_AMBER};color:#ffffff;padding:8px 16px;border-radius:6px;
                font-size:13px;font-weight:700;margin-bottom:12px;">
      ${vi.Documents.pdf.generationTitle.replace('{gen}', String(gen))} &nbsp;&nbsp; <span style="font-weight:400;font-size:11px;">${vi.Documents.pdf.peopleCount.replace('{count}', String(members.length))}</span>
    </div>
    ${members.map(personCard).join('')}
  </div>
  `).join('')}

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:12px;border-top:1px solid #e5e7eb;
              font-size:10px;color:#d4d4d4;text-align:center;">
    ${vi.Documents.pdf.footer}
  </div>
</div>`;
}

