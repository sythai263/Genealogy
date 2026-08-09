/**
 * @project AncestorTree
 * @file src/components/help/help-faq-section.tsx
 * @description Help section: frequently asked questions
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { Card, CardContent } from '@components/ui';
import { HELP_FAQ_ITEMS } from '@constants';

export function HelpFaqSection() {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Câu hỏi thường gặp
      </h2>

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
