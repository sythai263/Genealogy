/**
 * @project AncestorTree
 * @file src/app/(landing)/ancestral-hall/page.tsx
 * @description Public ancestral hall page — gallery, schedule, location
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CLAN_NAME } from '@lib';
import { AncestralHallContent } from './ancestral-hall-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Landing');
  return {
    title: `${t('pages.ancestralHall.title')} — ${CLAN_NAME}`,
    description: t('pages.ancestralHall.description'),
    openGraph: {
      title: `${t('pages.ancestralHall.title')} — ${CLAN_NAME}`,
      description: t('pages.ancestralHall.description'),
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default function AncestralHallPage() {
  return <AncestralHallContent />;
}
