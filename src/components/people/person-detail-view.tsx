/**
 * @project AncestorTree
 * @file src/components/people/person-detail-view.tsx
 * @description Person detail view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { ErrorState, PageSkeleton } from '@components/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
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
        toast.success(t('toasts.deleteSuccess'));
        router.push('/people');
      },
      onError: () => {
        toast.error(t('toasts.deleteError'));
      },
    });
  }

  if (isLoading) {
    return <PageSkeleton variant="detail" className="max-w-4xl" />;
  }

  if (error || !person) {
    return (
      <div className="container mx-auto max-w-4xl p-4">
        <ErrorState
          error={error}
          title={tCommon('routeErrors.personDetail')}
          description={tCommon('notFound.personDescription')}
          className="border-destructive"
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/people">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/people">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToList')}
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
            <CardTitle className="text-base">{t('form.biography')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{person.biography}</p>
          </CardContent>
        </Card>
      )}

      {person.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('form.notes')}</CardTitle>
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
