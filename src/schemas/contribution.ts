/**
 * @project AncestorTree
 * @file src/schemas/contribution.ts
 * @description Zod schema for contribution form
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { z } from 'zod';

export const contributionFormSchema = z.object({
  change_type: z.enum(['create', 'update', 'delete']),
  target_person: z.string().min(1, 'Vui lòng chọn thành viên'),
  reason: z.string().max(2000).optional(),
  changes: z
    .record(z.string(), z.string())
    .refine((value) => Object.keys(value).length > 0, {
      message: 'Vui lòng thêm ít nhất một thay đổi',
    }),
});

export type ContributionFormData = z.infer<typeof contributionFormSchema>;

export const defaultContributionFormValues: ContributionFormData = {
  change_type: 'update',
  target_person: '',
  reason: '',
  changes: {},
};
