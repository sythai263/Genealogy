/**
 * @project AncestorTree
 * @file src/app/(landing)/names/page.tsx
 * @description Public baby-name dictionary page
 * @version 1.0.0
 * @updated 2026-10-30
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CLAN_NAME } from '@lib';
import { NamesContent } from './names-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Names');
  return {
    title: `${t('page.title')} — ${CLAN_NAME}`,
    description: t('page.subtitle'),
    openGraph: {
      title: `${t('page.title')} — ${CLAN_NAME}`,
      description: t('page.subtitle'),
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default function NamesPage() {
  return <NamesContent />;
}
