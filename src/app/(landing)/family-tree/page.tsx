/**
 * @project AncestorTree
 * @file src/app/(landing)/family-tree/page.tsx
 * @description Public landing page to view interactive family tree (V3)
 * @version 1.0.0
 * @updated 2026-07-19
 */

import type { Metadata } from 'next';
import { FamilyTreeContent } from './family-tree-content';

export const metadata: Metadata = {
  title: 'Cây gia phả — AncestorTree',
  description:
    'Xem cây gia phả tương tác của dòng họ. Zoom, kéo, tìm kiếm thành viên — tối ưu cho điện thoại.',
  openGraph: {
    title: 'Cây gia phả — AncestorTree',
    description:
      'Xem cây gia phả tương tác của dòng họ. Zoom, kéo, tìm kiếm thành viên — tối ưu cho điện thoại.',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function PublicFamilyTreePage() {
  return <FamilyTreeContent />;
}
