/**
 * @project AncestorTree
 * @file src/components/cau-duong/assign-dialog.tsx
 * @description Dialog phân công chủ lễ Cầu đương
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap } from 'lucide-react';
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
} from '@components/ui';
import {
  cauDuongAssignSchema,
  type CauDuongAssignFormData,
} from '@schemas';
import type { CauDuongEligibleMember } from '@types';

interface AssignDialogProps {
  ceremonyLabel: string;
  eligibleMembers: CauDuongEligibleMember[];
  defaultPersonId?: string;
  onConfirm: (personId: string) => void;
  isPending: boolean;
}

export function AssignDialog({
  ceremonyLabel,
  eligibleMembers,
  defaultPersonId,
  onConfirm,
  isPending,
}: AssignDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<CauDuongAssignFormData>({
    resolver: zodResolver(cauDuongAssignSchema),
    defaultValues: { person_id: '' },
  });

  const selectedId = form.watch('person_id');
  const selectedMember = eligibleMembers.find(
    (member) => member.person.id === selectedId
  );

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      form.reset({
        person_id: defaultPersonId || eligibleMembers[0]?.person.id || '',
      });
    }
  }

  function handleSubmit(data: CauDuongAssignFormData) {
    onConfirm(data.person_id);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Zap className="mr-1 h-3.5 w-3.5" />
          Phân công
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân công {ceremonyLabel}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="person_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người thực hiện *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thành viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eligibleMembers.map((member, index) => (
                        <SelectItem
                          key={member.person.id}
                          value={member.person.id}
                        >
                          {index + 1}. {member.person.display_name}
                          {member.person.generation
                            ? ` (Đời ${member.person.generation})`
                            : ''}
                          {member.ageLunar > 0
                            ? ` — ${member.ageLunar} tuổi`
                            : ''}
                          {member.person.id === defaultPersonId
                            ? ' ← mặc định'
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedMember?.person.id === defaultPersonId && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Người tiếp theo trong vòng xoay
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending || !selectedId}
              className="w-full"
            >
              {isPending
                ? 'Đang lưu...'
                : `Phân công cho ${selectedMember?.person.display_name ?? '...'}`}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
