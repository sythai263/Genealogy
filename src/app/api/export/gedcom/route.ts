/**
 * @project AncestorTree
 * @file src/app/api/export/gedcom/route.ts
 * @description API endpoint for GEDCOM 7.0 file export (admin/editor only)
 * @version 2.0.0
 * @updated 2026-08-09
 */

import { API_ERROR_MESSAGES, API_STATUS } from '@constants';
import {
  apiError,
  apiFile,
  createServiceRoleClient,
  guardWebOnly,
  requireRole,
  withApiHandler,
} from '@lib/api';
import { generateGedcom, type TreeData } from '@lib';

export const GET = withApiHandler(
  'export/gedcom',
  async (request) => {
    // Desktop mode: export is handled client-side via generateGedcom()
    const desktopGuard = guardWebOnly();
    if (desktopGuard) return desktopGuard;

    const requester = await requireRole(request);
    if (requester instanceof Response) return requester;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return apiError(API_ERROR_MESSAGES.serverMisconfigured, API_STATUS.serverError);
    }

    // Service-role read bypasses RLS so the export covers the whole tree
    const [peopleRes, familiesRes, childrenRes] = await Promise.all([
      supabase.from('people').select('*'),
      supabase.from('families').select('*'),
      supabase.from('children').select('family_id, person_id, sort_order'),
    ]);

    if (peopleRes.error) throw peopleRes.error;
    if (familiesRes.error) throw familiesRes.error;
    if (childrenRes.error) throw childrenRes.error;

    const treeData: TreeData = {
      people: peopleRes.data ?? [],
      families: familiesRes.data ?? [],
      children: childrenRes.data ?? [],
    };

    const date = new Date().toISOString().slice(0, 10);

    return apiFile(generateGedcom(treeData), {
      contentType: 'text/x-gedcom; charset=utf-8',
      filename: `ancestortree-${date}.ged`,
    });
  },
  API_ERROR_MESSAGES.exportFailed
);
