/**
 * @project AncestorTree
 * @file src/components/contributions/contribution-form.tsx
 * @description Form to submit a new contribution suggestion
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useAuth } from '@components/auth';
import { PersonCombobox } from '@components/people';
import {
  Button,
  DialogFooter,
  Form,
  FormControl,
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
  CONTRIBUTION_CHANGE_TYPE_FORM_LABELS,
  CONTRIBUTION_CHANGE_TYPE_ORDER,
  CONTRIBUTION_FIELD_OPTIONS,
  getContributionFieldLabel,
  isChangeType,
} from '@constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateContribution } from '@hooks';
import {
  contributionFormSchema,
  defaultContributionFormValues,
  type ContributionFormData,
} from '@schemas';
import type { Person } from '@types';
import { Plus, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ContributionFormProps {
  onClose: () => void;
}

export function ContributionForm({ onClose }: ContributionFormProps) {
  const { profile } = useAuth();
  const createContribution = useCreateContribution();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: defaultContributionFormValues,
  });

  const changes = form.watch('changes');

  function addChange() {
    if (!fieldName.trim() || !fieldValue.trim()) return;
    const nextChanges = {
      ...form.getValues('changes'),
      [fieldName.trim()]: fieldValue.trim(),
    };
    form.setValue('changes', nextChanges, { shouldValidate: true });
    setFieldName('');
    setFieldValue('');
  }

  function handlePersonSelect(person: Person | null) {
    setSelectedPerson(person);
    form.setValue('target_person', person?.id ?? '', { shouldValidate: true });
  }

  function removeChange(key: string) {
    const nextChanges = { ...form.getValues('changes') };
    delete nextChanges[key];
    form.setValue('changes', nextChanges, { shouldValidate: true });
  }

  function handleSubmit(data: ContributionFormData) {
    if (!profile) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    createContribution.mutate(
      {
        author_id: profile.id,
        target_person: data.target_person,
        change_type: data.change_type,
        changes: data.changes,
        reason: data.reason?.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Đã gửi đề xuất chỉnh sửa');
          onClose();
        },
        onError: () => {
          toast.error('Lỗi khi gửi đề xuất');
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='change_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại thay đổi</FormLabel>
              <Select
                value={field.value}
                onValueChange={value => {
                  if (isChangeType(value)) field.onChange(value);
                }}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTRIBUTION_CHANGE_TYPE_ORDER.map(changeType => (
                    <SelectItem key={changeType} value={changeType}>
                      {CONTRIBUTION_CHANGE_TYPE_FORM_LABELS[changeType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='target_person'
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label='Thành viên liên quan'
                  selected={selectedPerson}
                  onSelect={handlePersonSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='changes'
          render={() => (
            <FormItem>
              <FormLabel>Thay đổi đề xuất</FormLabel>
              {Object.entries(changes).length > 0 && (
                <div className='mb-3 space-y-2'>
                  {Object.entries(changes).map(([key, value]) => (
                    <div
                      key={key}
                      className='flex items-center gap-2 rounded-md bg-muted p-2 text-sm'>
                      <span className='font-medium'>
                        {getContributionFieldLabel(key)}:
                      </span>
                      <span className='flex-1 truncate'>{value}</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-6 px-2'
                        onClick={() => removeChange(key)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className='flex gap-2'>
                <Select value={fieldName} onValueChange={setFieldName}>
                  <SelectTrigger className='w-40'>
                    <SelectValue placeholder='Trường...' />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRIBUTION_FIELD_OPTIONS.filter(
                      field => !changes[field.value]
                    ).map(field => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={fieldValue}
                  onChange={event => setFieldValue(event.target.value)}
                  placeholder='Giá trị mới...'
                  className='flex-1'
                />
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  onClick={addChange}>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='reason'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lý do thay đổi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Giải thích tại sao cần thay đổi...'
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            Hủy
          </Button>
          <Button
            type='submit'
            disabled={createContribution.isPending}
            className='gap-2'>
            <Send className='h-4 w-4' />
            {createContribution.isPending ? 'Đang gửi...' : 'Gửi đề xuất'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
