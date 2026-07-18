/**
 * @project AncestorTree
 * @file src/app/(main)/people/[id]/page.tsx
 * @description Person detail page
 * @version 2.1.0
 * @updated 2026-07-18
 */

import { PersonDetailView } from '@components/people';

interface PersonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PersonDetailPage({
  params,
}: PersonDetailPageProps) {
  const { id } = await params;
  return <PersonDetailView personId={id} />;
}
