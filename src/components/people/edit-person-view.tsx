/**
 * @project AncestorTree
 * @file src/components/people/edit-person-view.tsx
 * @description Person edit view with auth gate
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { EmptyState, ErrorState, PageSkeleton } from '@components/shared';
import { Button } from '@components/ui';
import { usePerson, useUpdatePerson } from '@hooks';
import type { PersonFormData } from '@schemas';
import { PersonForm } from './person-form';

interface EditPersonViewProps {
  personId: string;
}

export function EditPersonView({ personId }: EditPersonViewProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const tAuth = useTranslations('Auth');
  const router = useRouter();
  const { user, isEditor, isLoading: authLoading } = useAuth();
  const { data: person, isLoading, error } = usePerson(personId);
  const updateMutation = useUpdatePerson();

  async function handleSubmit(data: PersonFormData) {
    if (!user || !isEditor) {
      toast.error(t('access.needEditorToast'));
      return;
    }

    try {
      await updateMutation.mutateAsync({ id: personId, input: data });
      toast.success(t('toasts.updateSuccess'));
      router.push(`/people/${personId}`);
    } catch {
      toast.error(t('toasts.updateError'));
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
          title={t('access.title')}
          description={
            !user ? t('access.needLogin') : t('access.needEditor')
          }
          action={
            <div className="flex justify-center gap-2">
              {!user && (
                <Button asChild>
                  <Link href={`/login?redirect=/people/${personId}/edit`}>
                    {tAuth('login.title')}
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href={`/people/${personId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {tCommon('back')}
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
          title={tCommon('routeErrors.personEdit')}
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
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/people/${personId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tCommon('back')}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {t('editNamed', { name: person.display_name })}
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
