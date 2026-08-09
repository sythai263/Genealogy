/**
 * @project AncestorTree
 * @file src/components/shared/access-denied.tsx
 * @description Shared "insufficient role" screen used by every admin view
 * @version 1.0.0
 * @updated 2026-08-09
 */

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@components/ui';
import {
  ACCESS_DENIED_EDITOR_MESSAGE,
  ACCESS_DENIED_HOME_HREF,
  ACCESS_DENIED_HOME_LABEL,
  ACCESS_DENIED_TITLE,
  PAGE_CONTAINER_CLASS,
} from '@constants';
import { EmptyState } from './empty-state';

interface AccessDeniedProps {
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
}

export function AccessDenied({
  title = ACCESS_DENIED_TITLE,
  description = ACCESS_DENIED_EDITOR_MESSAGE,
  homeHref = ACCESS_DENIED_HOME_HREF,
  homeLabel = ACCESS_DENIED_HOME_LABEL,
}: AccessDeniedProps) {
  return (
    <div className={PAGE_CONTAINER_CLASS}>
      <EmptyState
        icon={ShieldAlert}
        title={title}
        description={description}
        action={
          <Button asChild>
            <Link href={homeHref}>{homeLabel}</Link>
          </Button>
        }
      />
    </div>
  );
}
