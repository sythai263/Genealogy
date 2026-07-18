/**
 * @project AncestorTree
 * @file src/components/help/help-faq-section.tsx
 * @description Help section: FAQ and desktop vs web comparison
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Card, CardContent } from '@components/ui';
import {
  HELP_DESKTOP_COMPARISON_ROWS,
  HELP_FAQ_ITEMS,
} from '@constants';

interface HelpFaqSectionProps {
  isDesktop: boolean;
}

export function HelpFaqSection({ isDesktop }: HelpFaqSectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Câu hỏi thường gặp
      </h2>

      {isDesktop && (
        <div className="mx-auto mb-8 max-w-3xl">
          <h3 className="mb-3 text-center text-base font-semibold text-foreground">
            Desktop vs Web
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full overflow-hidden rounded-lg border border-collapse bg-background shadow-sm">
              <thead>
                <tr className="bg-emerald-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground" />
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Desktop
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Web
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {HELP_DESKTOP_COMPARISON_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.desktop}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {row.web}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-4">
        {HELP_FAQ_ITEMS.map((item) => (
          <Card key={item.q}>
            <CardContent className="pt-6">
              <h4 className="mb-2 font-semibold text-foreground">{item.q}</h4>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
