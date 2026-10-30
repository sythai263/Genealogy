/**
 * @project AncestorTree
 * @file src/hooks/use-nav-accordion.ts
 * @description Sidebar accordion state — exactly one nav group open at a
 *              time, defaulting to the group that contains the current route
 *              and re-syncing to it whenever the route changes
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useState } from 'react';
import type { LayoutNavGroupKey, NavGroupDef } from '@constants';
import { isNavItemActive } from '@lib';

interface ToggleOverride {
  pathname: string;
  key: LayoutNavGroupKey | null;
}

export function useNavAccordion(groups: NavGroupDef[], pathname: string) {
  const activeKey =
    groups.find((group) =>
      group.items.some((item) => isNavItemActive(item.url, pathname))
    )?.labelKey ?? null;

  // A manual toggle only applies to the route it was made on — navigating
  // elsewhere falls back to opening the new route's group.
  const [override, setOverride] = useState<ToggleOverride | null>(null);
  const openKey = override?.pathname === pathname ? override.key : activeKey;

  function toggle(key: LayoutNavGroupKey) {
    setOverride({ pathname, key: openKey === key ? null : key });
  }

  return { openKey, activeKey, toggle };
}
