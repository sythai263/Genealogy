/**
 * @project AncestorTree
 * @file src/components/people/new-person-view.tsx
 * @description New person creation view with optional parent selection
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useAddPersonToParentFamily, useCreatePerson } from '@hooks';
import type { PersonFormData } from '@schemas';
import type { Person } from '@types';
import { PersonCombobox } from './person-combobox';
import { PersonForm } from './person-form';

export function NewPersonView() {
  const router = useRouter();
  const createMutation = useCreatePerson();
  const addToParentMutation = useAddPersonToParentFamily();

  const [selectedFather, setSelectedFather] = useState<Person | null>(null);
  const [selectedMother, setSelectedMother] = useState<Person | null>(null);

  const lockedGeneration = selectedFather
    ? selectedFather.generation + 1
    : selectedMother
      ? selectedMother.generation + 1
      : undefined;

  async function handleSubmit(data: PersonFormData) {
    try {
      const person = await createMutation.mutateAsync(data);
      if (selectedFather || selectedMother) {
        await addToParentMutation.mutateAsync({
          fatherId: selectedFather?.id || null,
          motherId: selectedMother?.id || null,
          childPersonId: person.id,
        });
      }
      toast.success('Đã thêm thành công');
      router.push(`/people/${person.id}`);
    } catch {
      toast.error('Lỗi khi thêm mới');
    }
  }

  const isLoading =
    createMutation.isPending || addToParentMutation.isPending;

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/people">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Thêm thành viên mới</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Thuộc gia đình (tùy chọn)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Chọn cha/mẹ để xác định vị trí trong gia phả. Đời sẽ tự động = đời
            cha + 1.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PersonCombobox
            label="Cha"
            selected={selectedFather}
            onSelect={setSelectedFather}
            excludeId={selectedMother?.id}
          />
          <PersonCombobox
            label="Mẹ"
            selected={selectedMother}
            onSelect={setSelectedMother}
            excludeId={selectedFather?.id}
          />
        </CardContent>
      </Card>

      <PersonForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        lockedGeneration={lockedGeneration}
      />
    </div>
  );
}
