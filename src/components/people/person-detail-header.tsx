/**
 * @project AncestorTree
 * @file src/components/people/person-detail-header.tsx
 * @description Header card for person detail (avatar, badges, edit/delete)
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import Link from 'next/link';
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
import { cn } from '@lib/utils';
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
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <AvatarUpload person={person} canEdit={canEdit} />

          <div className="flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="text-2xl font-bold">{person.display_name}</h1>
              <div className="flex gap-2">
                <Badge variant="outline">Đời {person.generation}</Badge>
                {person.chi && (
                  <Badge variant="outline">Chi {person.chi}</Badge>
                )}
                <Badge
                  className={cn(
                    person.is_living
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {person.is_living ? 'Còn sống' : 'Đã mất'}
                </Badge>
                {person.is_patrilineal && (
                  <Badge className="bg-amber-100 text-amber-800">
                    Chính tộc
                  </Badge>
                )}
              </div>
            </div>

            {(person.pen_name || person.taboo_name) && (
              <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                {person.taboo_name && (
                  <span>
                    Tên húy: <strong>{person.taboo_name}</strong>
                  </span>
                )}
                {person.pen_name && (
                  <span>
                    Tên tự: <strong>{person.pen_name}</strong>
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
                    Chỉnh sửa
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc muốn xóa {person.display_name}? Hành động
                        này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDelete}
                        disabled={isDeletePending}
                      >
                        {isDeletePending ? 'Đang xóa...' : 'Xóa'}
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
