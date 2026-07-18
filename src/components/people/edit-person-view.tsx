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
import { Button, Card, CardContent, Skeleton } from '@components/ui';
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
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Skeleton className="mb-6 h-8 w-48" />
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !isEditor) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="border-orange-200">
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto mb-4 h-10 w-10 text-orange-400" />
            <p className="mb-2 font-medium text-orange-700">
              Cần quyền chỉnh sửa
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              {!user
                ? 'Vui lòng đăng nhập để chỉnh sửa thông tin.'
                : 'Tài khoản của bạn chưa có quyền admin hoặc editor.'}
            </p>
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card className="border-destructive">
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-destructive">
              {error ? `Lỗi: ${error.message}` : 'Không tìm thấy thông tin'}
            </p>
            <Button asChild variant="outline">
              <Link href="/people">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
          </CardContent>
        </Card>
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
