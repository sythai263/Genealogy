/**
 * @project AncestorTree
 * @file src/app/(landing)/register-member/page.tsx
 * @description Public member registration form — no auth required
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CLAN_NAME } from '@lib';
import { RegisterMemberForm } from './register-member-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Landing');
  return {
    title: `${t('pages.registerMember.title')} — ${CLAN_NAME}`,
    description: t('pages.registerMember.description'),
    openGraph: {
      title: `${t('pages.registerMember.title')} — ${CLAN_NAME}`,
      description: t('pages.registerMember.description'),
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default function RegisterMemberPage() {
  return <RegisterMemberForm />;
}
