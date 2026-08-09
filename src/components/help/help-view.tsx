/**
 * @project AncestorTree
 * @file src/components/help/help-view.tsx
 * @description In-app help guide for authenticated users
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { HelpFaqSection } from './help-faq-section';
import { HelpNavSection } from './help-nav-section';
import { HelpRolesSection } from './help-roles-section';
import { HelpTipsSection } from './help-tips-section';
import { HelpWorkflowsSection } from './help-workflows-section';

export async function HelpView() {
  const t = await getTranslations('Help');

  return (
    <div className="container mx-auto max-w-6xl space-y-16 px-4 py-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">{t('subtitle')}</p>
      </div>

      <HelpNavSection />
      <HelpWorkflowsSection />
      <HelpRolesSection />
      <HelpTipsSection />
      <HelpFaqSection />
    </div>
  );
}
