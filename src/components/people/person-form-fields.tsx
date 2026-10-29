/**
 * @project AncestorTree
 * @file src/components/people/person-form-fields.tsx
 * @description Field primitives for PersonForm — wraps the repeated
 *              FormField → FormItem → FormLabel → FormControl → FormMessage
 *              pattern. Reads RHF control via useFormContext.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useFormContext } from 'react-hook-form';
import {
  Checkbox,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@components/ui';
import type { PersonFormData } from '@schemas';

/** Field names whose schema output is a string (required or optional) */
type StringFieldName = {
  [K in keyof PersonFormData]-?: NonNullable<PersonFormData[K]> extends string
    ? K
    : never;
}[keyof PersonFormData];

/** Field names whose schema output is a number (required or optional) */
type NumberFieldName = {
  [K in keyof PersonFormData]-?: NonNullable<PersonFormData[K]> extends number
    ? K
    : never;
}[keyof PersonFormData];

/** Field names whose schema output is a boolean */
type BooleanFieldName = {
  [K in keyof PersonFormData]-?: NonNullable<PersonFormData[K]> extends boolean
    ? K
    : never;
}[keyof PersonFormData];

interface TextFieldProps {
  name: StringFieldName;
  label: string;
  placeholder?: string;
  type?: string;
  description?: string;
}

export function PersonTextField({
  name,
  label,
  placeholder,
  type,
  description,
}: TextFieldProps) {
  const { control } = useFormContext<PersonFormData>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PersonNumberFieldProps {
  name: NumberFieldName;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function PersonNumberField({
  name,
  label,
  placeholder,
  min,
  max,
  disabled,
  className,
  description,
}: PersonNumberFieldProps) {
  const { control } = useFormContext<PersonFormData>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              placeholder={placeholder}
              min={min}
              max={max}
              disabled={disabled}
              className={className}
              {...field}
              value={field.value ?? ''}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
            />
          </FormControl>
          {description ? (
            <FormDescription>{description}</FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PersonTextareaFieldProps {
  name: StringFieldName;
  label: string;
  placeholder?: string;
  rows?: number;
}

export function PersonTextareaField({
  name,
  label,
  placeholder,
  rows = 3,
}: PersonTextareaFieldProps) {
  const { control } = useFormContext<PersonFormData>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface PersonCheckboxFieldProps {
  name: BooleanFieldName;
  label: string;
}

export function PersonCheckboxField({
  name,
  label,
}: PersonCheckboxFieldProps) {
  const { control } = useFormContext<PersonFormData>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-y-0 space-x-2">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel className="font-normal">{label}</FormLabel>
        </FormItem>
      )}
    />
  );
}
