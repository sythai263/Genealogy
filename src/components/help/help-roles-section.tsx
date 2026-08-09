/**
 * @project AncestorTree
 * @file src/components/help/help-roles-section.tsx
 * @description Help section: user roles and permissions
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Badge } from '@components/ui';
import { HELP_ROLES } from '@constants';

export function HelpRolesSection() {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Phân quyền người dùng
      </h2>
      <div className="mx-auto max-w-3xl">
        <div className="overflow-x-auto">
          <table className="w-full overflow-hidden rounded-lg border border-collapse bg-background shadow-sm">
            <thead>
              <tr className="bg-emerald-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  Quyền hạn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {HELP_ROLES.map((role) => (
                <tr key={role.role}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    <Badge variant="outline">{role.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {role.permissions}
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
