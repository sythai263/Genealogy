/**
 * @project AncestorTree
 * @file src/components/users/role-legend-card.tsx
 * @description Card explaining what each user role can do
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import { USER_ROLE_ORDER } from '@constants';
import { UserRoleBadge, roleDescription } from './user-role-badge';

export function RoleLegendCard() {
  const t = useTranslations('Admin');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {t('users.roleLegend.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {USER_ROLE_ORDER.map((role) => (
            <div
              key={role}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <UserRoleBadge role={role} />
              <span className="text-sm text-muted-foreground">
                {roleDescription(role, t)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
