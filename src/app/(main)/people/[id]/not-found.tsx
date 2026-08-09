/**
 * @project AncestorTree
 * @file src/app/(main)/people/[id]/not-found.tsx
 * @description 404 shown when a person id does not resolve to a tree member
 * @version 1.0.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { UserX } from 'lucide-react';
import { Button, Card, CardContent } from '@components/ui';
import {
  PAGE_CONTAINER_CLASS,
  PERSON_NOT_FOUND_DESCRIPTION,
  PERSON_NOT_FOUND_TITLE,
} from '@constants';

export default function PersonNotFound() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <Card>
        <CardContent className="py-12 text-center">
          <UserX className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="mb-2 text-lg font-semibold">{PERSON_NOT_FOUND_TITLE}</h1>
          <p className="mb-4 text-muted-foreground">{PERSON_NOT_FOUND_DESCRIPTION}</p>
          <Button asChild>
            <Link href="/people">Về danh sách thành viên</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
