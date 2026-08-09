/**
 * @project AncestorTree
 * @file src/schemas/person.ts
 * @description Zod validation schemas for person forms (i18n via Validation factory)
 * @version 1.2.0
 * @updated 2026-08-09
 */

import { z } from 'zod';
import type { useTranslations } from 'next-intl';

type ValidationT = ReturnType<typeof useTranslations<'Validation'>>;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1600;

const numericString = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
  z.number().optional()
);

const requiredNumericString = z.preprocess(
  (val) => Number(val),
  z.number()
);

export function createPersonSchema(t: ValidationT) {
  const lunarDateSchema = z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const match = val.match(/^(\d{1,2})\/(\d{1,2})$/);
        if (!match) return false;
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        return day >= 1 && day <= 30 && month >= 1 && month <= 12;
      },
      { message: t('person.lunarDateInvalid') }
    );

  const yearSchema = z.preprocess(
    (val) =>
      val === '' || val === null || val === undefined ? undefined : Number(val),
    z
      .number()
      .min(MIN_YEAR, t('person.yearMin', { min: MIN_YEAR }))
      .max(CURRENT_YEAR, t('person.yearMax', { max: CURRENT_YEAR }))
      .optional()
  );

  return z
    .object({
      handle: z
        .string()
        .min(1, t('person.handleRequired'))
        .regex(/^[a-z0-9-]+$/, t('person.handleFormat')),
      display_name: z
        .string()
        .min(1, t('person.displayNameRequired'))
        .max(100, t('person.displayNameTooLong')),
      first_name: z.string().max(50).optional(),
      middle_name: z.string().max(50).optional(),
      surname: z.string().max(50).optional(),
      pen_name: z.string().max(100).optional(),
      taboo_name: z.string().max(100).optional(),
      gender: z.preprocess(
        (val) => Number(val),
        z.union([z.literal(1), z.literal(2)])
      ),
      generation: z.preprocess(
        (val) => Number(val),
        z
          .number()
          .min(1, t('person.generationMin'))
          .max(20, t('person.generationMax'))
      ),
      chi: numericString,

      birth_date: z.string().optional(),
      birth_year: yearSchema,
      birth_place: z.string().max(200).optional(),

      death_date: z.string().optional(),
      death_year: yearSchema,
      death_place: z.string().max(200).optional(),
      death_lunar: lunarDateSchema,

      is_living: z.boolean(),
      is_patrilineal: z.boolean(),

      phone: z.string().max(20).optional(),
      email: z
        .string()
        .email(t('person.emailInvalid'))
        .optional()
        .or(z.literal('')),
      zalo: z.string().max(20).optional(),
      facebook: z
        .string()
        .url(t('person.urlInvalid'))
        .optional()
        .or(z.literal('')),
      address: z.string().max(500).optional(),
      hometown: z.string().max(200).optional(),

      occupation: z.string().max(200).optional(),
      biography: z.string().max(5000).optional(),
      notes: z.string().max(2000).optional(),
      avatar_url: z
        .string()
        .url(t('person.urlInvalid'))
        .optional()
        .or(z.literal('')),

      privacy_level: requiredNumericString,
    })
    .superRefine((data, ctx) => {
      if (
        data.birth_year &&
        data.death_year &&
        data.death_year < data.birth_year
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('person.deathYearAfterBirth'),
          path: ['death_year'],
        });
      }
      if (
        data.birth_date &&
        data.death_date &&
        data.death_date < data.birth_date
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('person.deathDateAfterBirth'),
          path: ['death_date'],
        });
      }
    });
}

export type PersonFormData = z.infer<ReturnType<typeof createPersonSchema>>;

export const defaultPersonValues: PersonFormData = {
  handle: '',
  display_name: '',
  first_name: '',
  middle_name: '',
  surname: '',
  pen_name: '',
  taboo_name: '',
  gender: 1,
  generation: 1,
  chi: undefined,
  birth_date: '',
  birth_year: undefined,
  birth_place: '',
  death_date: '',
  death_year: undefined,
  death_place: '',
  death_lunar: '',
  is_living: true,
  is_patrilineal: true,
  phone: '',
  email: '',
  zalo: '',
  facebook: '',
  address: '',
  hometown: '',
  occupation: '',
  biography: '',
  notes: '',
  avatar_url: '',
  privacy_level: 1,
};
