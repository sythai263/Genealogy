/**
 * @project AncestorTree
 * @file src/app/(landing)/council/page.tsx
 * @description Public council page — clan leadership, history, mission
 * @version 1.1.0
 * @updated 2026-07-19
 */

import type { Metadata } from 'next';
import { CLAN_NAME } from '@lib';
import { CouncilContent } from './council-content';

export const metadata: Metadata = {
  title: `Hội đồng gia tộc — ${CLAN_NAME}`,
  description: `Ban quản trị, lịch sử và sứ mệnh ${CLAN_NAME}`,
  openGraph: {
    title: `Hội đồng gia tộc — ${CLAN_NAME}`,
    description: `Ban quản trị, lịch sử và sứ mệnh ${CLAN_NAME}`,
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function CouncilPage() {
  return <CouncilContent />;
}
