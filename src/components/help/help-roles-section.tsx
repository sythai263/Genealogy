/**
 * @project AncestorTree
 * @file src/components/help/help-roles-section.tsx
 * @description Help section: user roles and permissions
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { Badge } from '@components/ui';
import { HELP_ROLE_KEYS } from '@constants';

export async function HelpRolesSection() {
  const t = await getTranslations('Help');

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('roles.title')}
      </h2>
      <div className="mx-auto max-w-3xl">
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden rounded-lg border border-collapse bg-background shadow-sm">
            <thead>
              <tr className="bg-emerald-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  {t('roles.roleHeader')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  {t('roles.permissionsHeader')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {HELP_ROLE_KEYS.map((key) => (
                <tr key={key}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <Badge variant="outline">{t(`roles.${key}.role`)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {t(`roles.${key}.permissions`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
