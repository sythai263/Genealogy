/**
 * @project AncestorTree
 * @file src/components/people/person-detail-view.tsx
 * @description Person detail view
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@components/ui';
import { useCanEditPerson, useDeletePerson, usePerson } from '@hooks';
import { FamilyRelationsCard } from './family-relations-card';
import { PersonBirthDeathCard } from './person-birth-death-card';
import { PersonContactCard } from './person-contact-card';
import { PersonDetailHeader } from './person-detail-header';
import { PhotoGallery } from './photo-gallery';

interface PersonDetailViewProps {
  personId: string;
}

export function PersonDetailView({ personId }: PersonDetailViewProps) {
  const router = useRouter();
  const { data: person, isLoading, error } = usePerson(personId);
  const deleteMutation = useDeletePerson();
  const { profile } = useAuth();
  const { data: canEdit = false } = useCanEditPerson(personId);
  const isViewer = profile?.role === 'viewer';
  const isSelf = profile?.linked_person === personId;

  function handleDelete() {
    deleteMutation.mutate(personId, {
      onSuccess: () => {
        toast.success('Đã xóa thành công');
        router.push('/people');
      },
      onError: () => {
        toast.error('Lỗi khi xóa');
      },
    });
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
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
      <Button asChild variant="ghost" size="sm">
        <Link href="/people">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Danh sách thành viên
        </Link>
      </Button>

      <PersonDetailHeader
        person={person}
        canEdit={canEdit}
        isDeletePending={deleteMutation.isPending}
        onDelete={handleDelete}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PersonBirthDeathCard person={person} />
        {(!isViewer || isSelf) && <PersonContactCard person={person} />}
      </div>

      {person.biography && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tiểu sử</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{person.biography}</p>
          </CardContent>
        </Card>
      )}

      {person.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ghi chú</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {person.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <FamilyRelationsCard person={person} canEdit={canEdit} />
      <PhotoGallery personId={personId} canEdit={canEdit} />
    </div>
  );
}
