/**
 * @project AncestorTree
 * @file src/components/shared/access-denied.tsx
 * @description Shared "insufficient role" screen used by every admin view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@components/ui';
import { ACCESS_DENIED_HOME_HREF, PAGE_CONTAINER_CLASS } from '@constants';
import { EmptyState } from './empty-state';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function AccessDenied({
  title,
  description,
  homeHref = ACCESS_DENIED_HOME_HREF,
  homeLabel,
}: AccessDeniedProps) {
  const t = useTranslations('Common');

  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <EmptyState
        icon={ShieldAlert}
        title={title ?? t('accessDenied.title')}
        description={description ?? t('accessDenied.editorMessage')}
        action={
          <Button asChild>
            <Link href={homeHref}>
              {homeLabel ?? t('accessDenied.homeLabel')}
            </Link>
          </Button>
        }
      />
    </div>
  );
}
