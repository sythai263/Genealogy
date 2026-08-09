/**
 * @project AncestorTree
 * @file src/app/(landing)/family-tree/page.tsx
 * @description Public landing page to view interactive family tree (V3)
 * @version 1.2.0
 * @updated 2026-08-09
 */

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CLAN_NAME } from '@lib';
import { FamilyTreeContent } from './family-tree-content';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Landing');
  return {
    title: `${t('pages.familyTree.title')} — ${CLAN_NAME}`,
    description: t('pages.familyTree.description'),
    openGraph: {
      title: `${t('pages.familyTree.title')} — ${CLAN_NAME}`,
      description: t('pages.familyTree.description'),
      locale: 'vi_VN',
      type: 'website',
    },
  };
}

export default function PublicFamilyTreePage() {
  return <FamilyTreeContent />;
}
