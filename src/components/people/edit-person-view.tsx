/**
 * @project AncestorTree
 * @file src/components/people/edit-person-view.tsx
 * @description Person edit view with auth gate
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { EmptyState, ErrorState, PageSkeleton } from '@components/shared';
import { Button } from '@components/ui';
import {
  PERSON_NOT_FOUND_DESCRIPTION,
  ROUTE_ERROR_TITLES,
} from '@constants';
import { usePerson, useUpdatePerson } from '@hooks';
import type { PersonFormData } from '@schemas';
import { PersonForm } from './person-form';

interface EditPersonViewProps {
  personId: string;
}

export function EditPersonView({ personId }: EditPersonViewProps) {
  const router = useRouter();
  const { user, isEditor, isLoading: authLoading } = useAuth();
  const { data: person, isLoading, error } = usePerson(personId);
  const updateMutation = useUpdatePerson();

  async function handleSubmit(data: PersonFormData) {
    if (!user || !isEditor) {
      toast.error(
        'Bạn cần đăng nhập với quyền admin hoặc editor để chỉnh sửa'
      );
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: personId, input: data });
      toast.success('Đã cập nhật thành công');
      router.push(`/people/${personId}`);
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  }

  if (authLoading || isLoading) {
    return <PageSkeleton variant="form" className="max-w-4xl" />;
  }

  if (!user || !isEditor) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <EmptyState
          icon={Lock}
          title="Cần quyền chỉnh sửa"
          description={
            !user
              ? 'Vui lòng đăng nhập để chỉnh sửa thông tin.'
              : 'Tài khoản của bạn chưa có quyền admin hoặc editor.'
          }
          action={
            <div className="flex justify-center gap-2">
              {!user && (
                <Button asChild>
                  <Link href={`/login?redirect=/people/${personId}/edit`}>
                    Đăng nhập
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={`/people/${personId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <ErrorState
          error={error}
          title={ROUTE_ERROR_TITLES.personEdit}
          description={PERSON_NOT_FOUND_DESCRIPTION}
          className="border-destructive"
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/people">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/people/${personId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          Chỉnh sửa: {person.display_name}
        </h1>
      </div>

      <PersonForm
        person={person}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
