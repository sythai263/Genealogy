/**
 * @project AncestorTree
 * @file src/components/help/help-tips-section.tsx
 * @description Help section: usage tips
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { HELP_TIPS } from '@constants';

export function HelpTipsSection() {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Mẹo sử dụng
      </h2>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
        {HELP_TIPS.map((tip, index) => (
          <div
            key={tip}
            className="flex gap-3 rounded-lg border bg-muted/50 px-4 py-3"
          >
            <span className="shrink-0 text-sm font-semibold text-emerald-600">
              #{index + 1}
            </span>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
