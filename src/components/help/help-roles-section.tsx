/**
 * @project AncestorTree
 * @file src/components/help/help-roles-section.tsx
 * @description Help section: user roles and permissions
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import { HELP_ROLE_KEYS } from '@constants';

export async function HelpRolesSection() {
  const t = await getTranslations('Help');

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('roles.title')}
      </h2>
      <div className="mx-auto max-w-3xl">
        <Table className="rounded-lg border bg-background shadow-sm">
          <TableHeader>
            <TableRow className="bg-emerald-50 hover:bg-emerald-50">
              <TableHead>{t('roles.roleHeader')}</TableHead>
              <TableHead>{t('roles.permissionsHeader')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HELP_ROLE_KEYS.map((key) => (
              <TableRow key={key}>
                <TableCell className="font-medium">
                  <Badge variant="outline">{t(`roles.${key}.role`)}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t(`roles.${key}.permissions`)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
