/**
 * @project AncestorTree
 * @file src/components/people/person-form.tsx
 * @description Person edit/create form component — composes section cards
 *              (basic, birth/death, contact, bio) around one RHF form
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import { Button, Form } from '@components/ui';
import {
  createPersonSchema,
  defaultPersonValues,
  type PersonFormData,
} from '@schemas';
import type { Person } from '@types';
import { PersonFormBasicSection } from './person-form-basic-section';
import { PersonFormBirthDeathSection } from './person-form-birth-death-section';
import { PersonFormBioSection } from './person-form-bio-section';
import { PersonFormContactSection } from './person-form-contact-section';

interface PersonFormProps {
  person?: Person;
  defaultValues?: Partial<PersonFormData>;
  lockedGeneration?: number;
  onSubmit: (data: PersonFormData) => Promise<void>;
  isLoading?: boolean;
}

export function PersonForm({
  person,
  defaultValues: extraDefaults,
  lockedGeneration,
  onSubmit,
  isLoading,
}: PersonFormProps) {
  const tCommon = useTranslations('Common');
  const tValidation = useTranslations('Validation');
  const schema = createPersonSchema(tValidation);

  const form = useForm<PersonFormData>({
    resolver: zodResolver(schema) as Resolver<PersonFormData>,
    defaultValues: person
      ? {
          handle: person.handle,
          display_name: person.display_name,
          first_name: person.first_name || '',
          middle_name: person.middle_name || '',
          surname: person.surname || '',
          pen_name: person.pen_name || '',
          taboo_name: person.taboo_name || '',
          gender: person.gender,
          generation: person.generation,
          chi: person.chi || undefined,
          birth_date: person.birth_date || '',
          birth_year: person.birth_year || undefined,
          birth_place: person.birth_place || '',
          death_date: person.death_date || '',
          death_year: person.death_year || undefined,
          death_place: person.death_place || '',
          death_lunar: person.death_lunar || '',
          is_living: person.is_living,
          is_patrilineal: person.is_patrilineal,
          phone: person.phone || '',
          email: person.email || '',
          zalo: person.zalo || '',
          facebook: person.facebook || '',
          address: person.address || '',
          hometown: person.hometown || '',
          occupation: person.occupation || '',
          biography: person.biography || '',
          notes: person.notes || '',
          avatar_url: person.avatar_url || '',
          privacy_level: person.privacy_level,
        }
      : { ...defaultPersonValues, ...extraDefaults },
  });

  useEffect(() => {
    if (lockedGeneration !== undefined) {
      form.setValue('generation', lockedGeneration, { shouldValidate: true });
    }
  }, [lockedGeneration, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonFormBasicSection lockedGeneration={lockedGeneration} />
        <PersonFormBirthDeathSection />
        <PersonFormContactSection />
        <PersonFormBioSection />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {tCommon('save')}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
