/**
 * @project AncestorTree
 * @file src/components/cau-duong/delegate-dialog.tsx
 * @description Dialog ủy quyền Cầu đương
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCheck } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  cauDuongDelegateSchema,
  defaultCauDuongDelegateValues,
  type CauDuongDelegateFormData,
} from '@schemas';
import type { CauDuongEligibleMember } from '@types';

interface DelegateDialogProps {
  eligibleMembers: CauDuongEligibleMember[];
  onConfirm: (actualHostId: string, reason: string) => void;
  isPending: boolean;
}

export function DelegateDialog({
  eligibleMembers,
  onConfirm,
  isPending,
}: DelegateDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<CauDuongDelegateFormData>({
    resolver: zodResolver(cauDuongDelegateSchema),
    defaultValues: defaultCauDuongDelegateValues,
  });

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      form.reset(defaultCauDuongDelegateValues);
    }
  }

  function handleSubmit(data: CauDuongDelegateFormData) {
    onConfirm(data.actual_host_id, data.reason?.trim() ?? '');
    setOpen(false);
    form.reset(defaultCauDuongDelegateValues);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCheck className="mr-1 h-3.5 w-3.5" />
          Ủy quyền
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ủy quyền Cầu đương</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="actual_host_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người thực hiện thay *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thành viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleMembers.map((member) => (
                        <SelectItem
                          key={member.person.id}
                          value={member.person.id}
                        >
                          {member.person.display_name}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Đi công tác xa..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Đang lưu...' : 'Xác nhận ủy quyền'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
