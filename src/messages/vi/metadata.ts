/**
 * @project AncestorTree
 * @file src/messages/vi/metadata.ts
 * @description Root / page SEO metadata strings
 * @version 1.0.0
 * @updated 2026-08-09
 */

export const Metadata = {
  root: {
    titleDefault: 'Gia Phả Điện Tử - {clanFullName}',
    titleTemplate: '%s | Gia Phả {clanName}',
    description:
      'Phần mềm quản lý gia phả điện tử cho {clanFullName}. Lưu trữ thông tin dòng họ, cây gia phả, lịch giỗ chạp.',
    ogTitle: 'Gia Phả Điện Tử - {clanFullName}',
    ogDescription: 'Gìn giữ tinh hoa - Tiếp bước cha ông',
    keywords:
      'gia phả, gia phả điện tử, dòng họ, cây gia phả, phả hệ',
  },
  landing: {
    title: 'AncestorTree — {clanFullName}',
    description:
      'Gia phả điện tử {clanFullName}. Cây gia phả tương tác, lịch âm dương, quản lý dòng họ.',
    ogDescription: 'Gìn giữ tinh hoa — Tiếp bước cha ông',
  },
} as const;
