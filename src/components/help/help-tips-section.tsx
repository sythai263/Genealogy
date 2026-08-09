/**
 * @project AncestorTree
 * @file src/components/help/help-tips-section.tsx
 * @description Help section: usage tips
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { HELP_TIP_COUNT } from '@constants';

export async function HelpTipsSection() {
  const t = await getTranslations('Help');
  const tips = t.raw('tips.items') as string[];

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('tips.title')}
      </h2>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: HELP_TIP_COUNT }, (_, index) => {
          const tip = tips[index];
          if (!tip) return null;
          return (
            <div
              key={tip}
              className="flex gap-3 rounded-lg border bg-muted/50 px-4 py-3"
            >
              <span className="shrink-0 text-sm font-semibold text-emerald-600">
                #{index + 1}
              </span>
              <p className="text-sm text-muted-foreground">{tip}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
