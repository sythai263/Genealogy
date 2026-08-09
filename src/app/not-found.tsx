/**
 * @project AncestorTree
 * @file src/app/not-found.tsx
 * @description Application-wide 404 page
 * @version 1.0.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button, Card, CardContent } from '@components/ui';
import {
  NOT_FOUND_DESCRIPTION,
  NOT_FOUND_HOME_LABEL,
  NOT_FOUND_TITLE,
  PAGE_CONTAINER_CLASS,
} from '@constants';

export default function NotFound() {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <Card>
        <CardContent className="py-12 text-center">
          <FileQuestion className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="mb-2 text-lg font-semibold">{NOT_FOUND_TITLE}</h1>
          <p className="mb-4 text-muted-foreground">{NOT_FOUND_DESCRIPTION}</p>
          <Button asChild>
            <Link href="/">{NOT_FOUND_HOME_LABEL}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
