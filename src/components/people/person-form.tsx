/**
 * @project AncestorTree
 * @file src/components/people/person-form.tsx
 * @description Person edit/create form component
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  createPersonSchema,
  defaultPersonValues,
  type PersonFormData,
} from '@schemas';
import type { Person } from '@types';

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
  const t = useTranslations('People');
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

  const isLiving = form.watch('is_living');

  useEffect(() => {
    if (lockedGeneration !== undefined) {
      form.setValue('generation', lockedGeneration, { shouldValidate: true });
    }
  }, [lockedGeneration, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('form.sections.basic')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.displayName')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.displayName')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="handle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.handle')} *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.handle')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('form.handleHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.surname')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.surname')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middle_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.middleName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.middleName')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.firstName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.firstName')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="pen_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.penName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.penName')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('form.penNameHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taboo_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.tabooName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.tabooName')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{t('form.tabooNameHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.gender')} *</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(parseInt(v, 10) as 1 | 2)
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('form.placeholders.select')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{tCommon('male')}</SelectItem>
                        <SelectItem value="2">{tCommon('female')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.generation')} *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        {...field}
                        disabled={lockedGeneration !== undefined}
                        className={
                          lockedGeneration !== undefined
                            ? 'bg-muted text-muted-foreground'
                            : ''
                        }
                      />
                    </FormControl>
                    {lockedGeneration !== undefined && (
                      <FormDescription className="text-xs text-amber-600">
                        {t('form.generationLocked')}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.chi')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="privacy_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.privacy')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">
                          {t('form.privacyPublic')}
                        </SelectItem>
                        <SelectItem value="1">
                          {t('form.privacyMembers')}
                        </SelectItem>
                        <SelectItem value="2">
                          {t('form.privacyPrivate')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="is_living"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('form.isLiving')}
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_patrilineal"
                render={({ field }) => (
                  <FormItem className="flex items-center space-y-0 space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {t('form.isPatrilineal')}
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('form.sections.birthDeath')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birthYear')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('form.placeholders.birthYear')}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birthDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birth_place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.birthPlace')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.birthPlace')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!isLiving && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="death_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.deathYear')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('form.placeholders.deathYear')}
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="death_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.deathDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="death_lunar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.deathLunar')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.placeholders.deathLunar')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('form.deathLunarHint')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="death_place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('form.deathPlace')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.placeholders.deathPlace')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="hometown"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.hometown')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.hometown')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('form.sections.contact')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.phone')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.phone')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('form.placeholders.email')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zalo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.zalo')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.phone')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.facebook')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('form.placeholders.facebook')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.address')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.address')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('form.sections.bio')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.occupation')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.occupation')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="biography"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.biography')}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t('form.placeholders.biography')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.notes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder={t('form.placeholders.notes')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.avatarUrl')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('form.placeholders.avatarUrl')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

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
