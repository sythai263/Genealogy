/**
 * @project AncestorTree
 * @file src/components/help/help-workflows-section.tsx
 * @description Help section: step-by-step workflows
 * @version 1.1.0
 * @updated 2026-08-09
 */

import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import { HELP_WORKFLOW_KEYS } from '@constants';

export async function HelpWorkflowsSection() {
  const t = await getTranslations('Help');

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        {t('workflows.title')}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {HELP_WORKFLOW_KEYS.map((key) => {
          const steps = t.raw(`workflows.${key}.steps`) as string[];
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t(`workflows.${key}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="space-y-2">
                  {steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex gap-3 text-sm text-muted-foreground"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {t(`workflows.${key}.tip`)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
