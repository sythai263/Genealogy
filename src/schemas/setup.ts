/**
 * @project AncestorTree
 * @file src/schemas/setup.ts
 * @description Zod schema for desktop import API response
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { z } from 'zod';

export const desktopImportResponseSchema = z.object({
  error: z.string().optional(),
  total_inserted: z.number().optional(),
});

export type DesktopImportResponse = z.infer<
  typeof desktopImportResponseSchema
>;
