/**
 * @project AncestorTree
 * @file src/app/(landing)/register-member/page.tsx
 * @description Public member registration form — no auth required
 * @version 1.1.0
 * @updated 2026-07-19
 */

import type { Metadata } from 'next';
import { CLAN_NAME } from '@lib';
import { RegisterMemberForm } from './register-member-form';

export const metadata: Metadata = {
  title: `Đăng ký thành viên — ${CLAN_NAME}`,
  description: `Ghi danh vào gia phả ${CLAN_NAME} — dành cho con cháu sống xa`,
  openGraph: {
    title: `Đăng ký thành viên — ${CLAN_NAME}`,
    description: `Ghi danh vào gia phả ${CLAN_NAME} — dành cho con cháu sống xa`,
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RegisterMemberPage() {
  return <RegisterMemberForm />;
}
