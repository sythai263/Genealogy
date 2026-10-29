/**
 * @project AncestorTree
 * @file src/components/users/user-role-badge.tsx
 * @description Shared role display helpers — roleLabel/roleDescription text
 *              and the coloured UserRoleBadge used across user management
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@components/ui';
import { USER_ROLE_COLORS } from '@constants';
import { cn } from '@lib';
import type { UserRole } from '@types';

export function roleLabel(
  role: UserRole,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  const labels: Record<UserRole, string> = {
    admin: t('users.roles.admin.label'),
    editor: t('users.roles.editor.label'),
    viewer: t('users.roles.viewer.label'),
  };
  return labels[role];
}

export function roleDescription(
  role: UserRole,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  const descriptions: Record<UserRole, string> = {
    admin: t('users.roles.admin.description'),
    editor: t('users.roles.editor.description'),
    viewer: t('users.roles.viewer.description'),
  };
  return descriptions[role];
}

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const t = useTranslations('Admin');
  return (
    <Badge className={cn(USER_ROLE_COLORS[role], className)}>
      {roleLabel(role, t)}
    </Badge>
  );
}
