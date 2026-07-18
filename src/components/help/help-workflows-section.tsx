/**
 * @project AncestorTree
 * @file src/components/help/help-workflows-section.tsx
 * @description Help section: step-by-step workflows
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import type { HelpWorkflow } from '@constants';

interface HelpWorkflowsSectionProps {
  workflows: HelpWorkflow[];
}

export function HelpWorkflowsSection({
  workflows,
}: HelpWorkflowsSectionProps) {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Hướng dẫn từng bước
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {workflows.map((workflow) => (
          <Card key={workflow.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{workflow.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-2">
                {workflow.steps.map((step, index) => (
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
                {workflow.tip}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
