/**
 * @project AncestorTree
 * @file src/components/cau-duong/pool-form.tsx
 * @description Form tạo / sửa nhóm Cầu đương
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonCombobox } from '@components/people';
import {
  Button,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@components/ui';
import { usePerson } from '@hooks';
import {
  cauDuongPoolSchema,
  defaultCauDuongPoolValues,
  type CauDuongPoolFormData,
} from '@schemas';
import type { CauDuongPool, Person } from '@types';

interface PoolFormProps {
  pool?: CauDuongPool;
  onSubmit: (data: CauDuongPoolFormData) => void;
  isPending: boolean;
}

export function PoolForm({ pool, onSubmit, isPending }: PoolFormProps) {
  const { data: loadedAncestor } = usePerson(pool?.ancestor_id);
  const [selectedAncestor, setSelectedAncestor] = useState<Person | null>(null);

  const form = useForm<CauDuongPoolFormData>({
    resolver: zodResolver(cauDuongPoolSchema),
    defaultValues: pool
      ? {
          name: pool.name,
          ancestor_id: pool.ancestor_id,
          min_generation: pool.min_generation,
          max_age_lunar: pool.max_age_lunar,
          require_married: pool.require_married,
          description: pool.description ?? '',
        }
      : defaultCauDuongPoolValues,
  });

  useEffect(() => {
    if (loadedAncestor) {
      setSelectedAncestor(loadedAncestor);
    }
  }, [loadedAncestor]);

  function handleAncestorSelect(person: Person | null) {
    setSelectedAncestor(person);
    form.setValue('ancestor_id', person?.id ?? '', { shouldValidate: true });
  }

  function handleSubmit(data: CauDuongPoolFormData) {
    onSubmit({
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || undefined,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên nhóm *</FormLabel>
              <FormControl>
                <Input placeholder="Nhánh ông Đặng Đình Nhân" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ancestor_id"
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label="Tổ tông (gốc nhóm) *"
                  selected={selectedAncestor}
                  onSelect={handleAncestorSelect}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="min_generation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đời tối thiểu</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber || 1)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="max_age_lunar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuổi âm tối đa (dưới)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber || 1)
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="require_married"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal">
                Chỉ nam giới đã lập gia đình (có vợ con trong hệ thống)
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Xoay vòng các nam giới đã lập gia đình, dưới 70 tuổi âm..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Đang lưu...' : pool ? 'Cập nhật' : 'Tạo nhóm'}
        </Button>
      </form>
    </Form>
  );
}
