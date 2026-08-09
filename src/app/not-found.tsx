/**
 * @project AncestorTree
 * @file src/app/not-found.tsx
 * @description Application-wide 404 page
 * @version 1.1.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FileQuestion } from 'lucide-react';
import { Button, Card, CardContent } from '@components/ui';
import { PAGE_CONTAINER_CLASS } from '@constants';

export default async function NotFound() {
  const t = await getTranslations('Common');

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <Card>
        <CardContent className="py-12 text-center">
          <FileQuestion className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <h1 className="mb-2 text-lg font-semibold">{t('notFound.title')}</h1>
          <p className="mb-4 text-muted-foreground">
            {t('notFound.description')}
          </p>
          <Button asChild>
            <Link href="/">{t('notFound.homeLabel')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
