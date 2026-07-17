import { z } from 'zod';

export const achievementSchema = z.object({
  person_id: z.string().min(1, 'Vui lòng chọn thành viên'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200, 'Tiêu đề quá dài'),
  category: z.enum(['hoc_tap', 'su_nghiep', 'cong_hien', 'other']),
  description: z.string().max(2000).optional(),
  year: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: 'Năm phải là 4 chữ số',
    }),
  awarded_by: z.string().max(200).optional(),
  is_featured: z.boolean(),
});

export type AchievementFormData = z.infer<typeof achievementSchema>;

export const defaultAchievementValues: AchievementFormData = {
  person_id: '',
  title: '',
  category: 'hoc_tap',
  description: '',
  year: '',
  awarded_by: '',
  is_featured: false,
};
