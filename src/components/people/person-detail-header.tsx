/**
 * @project AncestorTree
 * @file src/components/people/person-detail-header.tsx
 * @description Header card for person detail (avatar, badges, edit/delete)
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Briefcase, Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import { cn } from '@lib';
import type { Person } from '@types';
import { AvatarUpload } from './avatar-upload';

interface PersonDetailHeaderProps {
  person: Person;
  canEdit: boolean;
  isDeletePending: boolean;
  onDelete: () => void;
}

export function PersonDetailHeader({
  person,
  canEdit,
  isDeletePending,
  onDelete,
}: PersonDetailHeaderProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <AvatarUpload person={person} canEdit={canEdit} />

          <div className="flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-2xl font-bold">{person.display_name}</h1>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {t('generationN', { n: person.generation })}
                </Badge>
                {person.chi && (
                  <Badge variant="outline">{t('chiN', { n: person.chi })}</Badge>
                )}
                <Badge
                  className={cn(
                    person.is_living
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {person.is_living ? tCommon('living') : tCommon('deceased')}
                </Badge>
                {person.is_patrilineal && (
                  <Badge className="bg-amber-100 text-amber-800">
                    {t('patrilinealShort')}
                  </Badge>
                )}
              </div>
            </div>

            {(person.pen_name || person.taboo_name) && (
              <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                {person.taboo_name && (
                  <span>
                    {t('form.tabooName')}: <strong>{person.taboo_name}</strong>
                  </span>
                )}
                {person.pen_name && (
                  <span>
                    {t('form.penName')}: <strong>{person.pen_name}</strong>
                  </span>
                )}
              </div>
            )}

            {person.occupation && (
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {person.occupation}
              </p>
            )}

            {canEdit && (
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/people/${person.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {tCommon('edit')}
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {tCommon('delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('deleteConfirm.titleConfirm')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirm.descriptionNamed', {
                          name: person.display_name,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        disabled={isDeletePending}
                      >
                        {isDeletePending
                          ? tCommon('deleting')
                          : tCommon('delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
