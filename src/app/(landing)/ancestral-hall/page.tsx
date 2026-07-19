/**
 * @project AncestorTree
 * @file src/app/(landing)/ancestral-hall/page.tsx
 * @description Public ancestral hall page — gallery, schedule, location
 * @version 1.1.0
 * @updated 2026-07-19
 */

import type { Metadata } from 'next';
import { CLAN_NAME } from '@lib';
import { AncestralHallContent } from './ancestral-hall-content';

export const metadata: Metadata = {
  title: `Nhà thờ họ — ${CLAN_NAME}`,
  description: `Thông tin nhà thờ ${CLAN_NAME}, hình ảnh, lịch tế lễ hàng năm`,
  openGraph: {
    title: `Nhà thờ họ — ${CLAN_NAME}`,
    description: `Thông tin nhà thờ ${CLAN_NAME}, hình ảnh, lịch tế lễ hàng năm`,
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function AncestralHallPage() {
  return <AncestralHallContent />;
}
