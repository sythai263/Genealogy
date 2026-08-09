/**
 * @project AncestorTree
 * @file src/components/help/help-nav-section.tsx
 * @description Help section: navigation overview
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { HELP_NAV_ITEM_KEYS } from '@constants';

export async function HelpNavSection() {
  const t = await getTranslations('Help');

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('navSection.title')}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {HELP_NAV_ITEM_KEYS.map((key) => (
          <div
            key={key}
            className="rounded-lg border bg-muted/50 px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">
              {t(`navSection.items.${key}.name`)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t(`navSection.items.${key}.desc`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
