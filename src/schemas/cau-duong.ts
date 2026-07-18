/**
 * @project AncestorTree
 * @file src/schemas/cau-duong.ts
 * @description Zod schemas for Cầu đương admin forms
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { z } from 'zod';

export const cauDuongPoolSchema = z.object({
  name: z.string().min(1, 'Vui lòng điền tên nhóm'),
  ancestor_id: z.string().min(1, 'Vui lòng chọn tổ tông'),
  min_generation: z.number().int().min(1, 'Đời tối thiểu phải ≥ 1'),
  max_age_lunar: z
    .number()
    .int()
    .min(1, 'Tuổi âm tối đa phải ≥ 1')
    .max(120, 'Tuổi âm tối đa phải ≤ 120'),
  require_married: z.boolean(),
  description: z.string().max(2000).optional(),
});

export type CauDuongPoolFormData = z.infer<typeof cauDuongPoolSchema>;

export const defaultCauDuongPoolValues: CauDuongPoolFormData = {
  name: '',
  ancestor_id: '',
  min_generation: 12,
  max_age_lunar: 70,
  require_married: true,
  description: '',
};

export const cauDuongDelegateSchema = z.object({
  actual_host_id: z.string().min(1, 'Chọn người thực hiện thay'),
  reason: z.string().max(1000).optional(),
});

export type CauDuongDelegateFormData = z.infer<typeof cauDuongDelegateSchema>;

export const defaultCauDuongDelegateValues: CauDuongDelegateFormData = {
  actual_host_id: '',
  reason: '',
};

export const cauDuongRescheduleSchema = z.object({
  actual_date: z.string().min(1, 'Chọn ngày thực hiện'),
  reason: z.string().max(1000).optional(),
});

export type CauDuongRescheduleFormData = z.infer<typeof cauDuongRescheduleSchema>;

export const defaultCauDuongRescheduleValues: CauDuongRescheduleFormData = {
  actual_date: '',
  reason: '',
};

export const cauDuongAssignSchema = z.object({
  person_id: z.string().min(1, 'Chọn người thực hiện'),
});

export type CauDuongAssignFormData = z.infer<typeof cauDuongAssignSchema>;
