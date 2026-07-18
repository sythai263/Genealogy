/**
 * @project AncestorTree
 * @file src/components/help/help-view.tsx
 * @description In-app help guide for authenticated users
 * @version 1.0.0
 * @updated 2026-07-18
 */

import {
  HELP_DESKTOP_BACKUP_WORKFLOW,
  HELP_WORKFLOWS,
  IS_DESKTOP_MODE,
} from '@constants';
import { HelpFaqSection } from './help-faq-section';
import { HelpNavSection } from './help-nav-section';
import { HelpRolesSection } from './help-roles-section';
import { HelpTipsSection } from './help-tips-section';
import { HelpWorkflowsSection } from './help-workflows-section';

export function HelpView() {
  const workflows = IS_DESKTOP_MODE
    ? [...HELP_WORKFLOWS, HELP_DESKTOP_BACKUP_WORKFLOW]
    : HELP_WORKFLOWS;

  return (
    <div className="container mx-auto max-w-6xl space-y-16 px-4 py-8">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Hướng dẫn sử dụng
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Hướng dẫn chi tiết các tính năng của ứng dụng Gia Phả Điện Tử.
        </p>
      </div>

      <HelpNavSection />
      <HelpWorkflowsSection workflows={workflows} />
      <HelpRolesSection isDesktop={IS_DESKTOP_MODE} />
      <HelpTipsSection />
      <HelpFaqSection isDesktop={IS_DESKTOP_MODE} />
    </div>
  );
}
