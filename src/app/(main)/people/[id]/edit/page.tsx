/**
 * @project AncestorTree
 * @file src/app/(main)/people/[id]/edit/page.tsx
 * @description Person edit page
 * @version 1.1.0
 * @updated 2026-07-18
 */

import { EditPersonView } from '@components/people';

interface EditPersonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPersonPage({
  params,
}: EditPersonPageProps) {
  const { id } = await params;
  return <EditPersonView personId={id} />;
}
