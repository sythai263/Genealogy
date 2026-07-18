/**
 * @project AncestorTree
 * @file src/components/help/help-nav-section.tsx
 * @description Help section: navigation overview
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { HELP_NAV_ITEMS } from '@constants';

export function HelpNavSection() {
  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
        Thanh điều hướng
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {HELP_NAV_ITEMS.map((item) => (
          <div
            key={item.name}
            className="rounded-lg border bg-muted/50 px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">{item.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
