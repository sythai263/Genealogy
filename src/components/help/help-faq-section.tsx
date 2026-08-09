/**
 * @project AncestorTree
 * @file src/components/help/help-faq-section.tsx
 * @description Help section: frequently asked questions
 * @version 2.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@components/ui';
import { HELP_FAQ_KEYS } from '@constants';

export async function HelpFaqSection() {
  const t = await getTranslations('Help');

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('faq.title')}
      </h2>

      <div className="mx-auto max-w-3xl space-y-4">
        {HELP_FAQ_KEYS.map((key) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <h4 className="mb-2 font-semibold text-foreground">
                {t(`faq.items.${key}.q`)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t(`faq.items.${key}.a`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
