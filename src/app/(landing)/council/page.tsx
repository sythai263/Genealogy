/**
 * @project AncestorTree
 * @file src/app/(landing)/council/page.tsx
 * @description Public council page — clan leadership, history, mission
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CLAN_NAME } from '@lib';
import { CouncilContent } from './council-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Landing');
  return {
    title: `${t('pages.council.title')} — ${CLAN_NAME}`,
    description: t('pages.council.description'),
    openGraph: {
      title: `${t('pages.council.title')} — ${CLAN_NAME}`,
      description: t('pages.council.description'),
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default function CouncilPage() {
  return <CouncilContent />;
}
