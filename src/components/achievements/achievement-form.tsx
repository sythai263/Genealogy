/**
 * @project AncestorTree
 * @file src/components/achievements/achievement-form.tsx
 * @description Achievement create/edit form with searchable person picker
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonCombobox } from '@components/people';
import {
  Button,
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
  Switch,
  Textarea,
} from '@components/ui';
import { usePerson } from '@hooks';
import {
  achievementSchema,
  defaultAchievementValues,
  type AchievementFormData,
} from '@schemas';
import { ACHIEVEMENT_FORM_CATEGORIES } from '@constants';
import type { Achievement, Person } from '@types';

interface AchievementFormProps {
  achievement?: Achievement;
  onSubmit: (data: AchievementFormData) => void;
  isPending: boolean;
}

export function AchievementForm({
  achievement,
  onSubmit,
  isPending,
}: AchievementFormProps) {
  const { data: loadedPerson } = usePerson(achievement?.person_id);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const form = useForm<AchievementFormData>({
    resolver: zodResolver(achievementSchema),
    defaultValues: achievement
      ? {
          person_id: achievement.person_id,
          title: achievement.title,
          category: achievement.category,
          description: achievement.description ?? '',
          year: achievement.year?.toString() ?? '',
          awarded_by: achievement.awarded_by ?? '',
          is_featured: achievement.is_featured,
        }
      : defaultAchievementValues,
  });

  useEffect(() => {
    if (loadedPerson) {
      setSelectedPerson(loadedPerson);
    }
  }, [loadedPerson]);

  function handlePersonSelect(person: Person | null) {
    setSelectedPerson(person);
    form.setValue('person_id', person?.id ?? '', { shouldValidate: true });
  }

  function handleSubmit(data: AchievementFormData) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="person_id"
          render={() => (
            <FormItem>
              <FormControl>
                <PersonCombobox
                  label="Thành viên *"
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Thủ khoa Đại học Bách Khoa"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ACHIEVEMENT_FORM_CATEGORIES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Năm</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="awarded_by"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trao bởi</FormLabel>
              <FormControl>
                <Input placeholder="Sở GD&ĐT Hà Tĩnh" {...field} />
              </FormControl>
              <FormMessage />
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
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_featured"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Nổi bật (hiển thị trên trang chủ)</FormLabel>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending
            ? 'Đang lưu...'
            : achievement
              ? 'Cập nhật'
              : 'Thêm mới'}
        </Button>
      </form>
    </Form>
  );
}
