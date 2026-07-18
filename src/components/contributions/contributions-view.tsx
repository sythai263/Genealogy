/**
 * @project AncestorTree
 * @file src/components/contributions/contributions-view.tsx
 * @description Member contributions list and create dialog
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
} from '@components/ui';
import { useContributions, usePeople } from '@hooks';
import { ContributionForm } from './contribution-form';
import { ContributionListItem } from './contribution-list-item';

export function ContributionsView() {
  const { user, profile } = useAuth();
  const { data: contributions, isLoading } = useContributions();
  const { data: people } = usePeople();
  const [dialogOpen, setDialogOpen] = useState(false);

  const myContributions = contributions?.filter(
    (contribution) =>
      profile?.role === 'admin' || contribution.author_id === profile?.id
  );

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">
              Vui lòng đăng nhập để gửi đề xuất chỉnh sửa
            </p>
            <Button asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
            <ClipboardList className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Đề xuất chỉnh sửa</h1>
            <p className="text-muted-foreground">
              Gửi yêu cầu cập nhật thông tin thành viên
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Đề xuất mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Đề xuất chỉnh sửa</DialogTitle>
              <DialogDescription>
                Gửi yêu cầu cập nhật thông tin. Quản trị viên sẽ xem xét và phê
                duyệt.
              </DialogDescription>
            </DialogHeader>
            <ContributionForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardDescription>
            {isLoading
              ? 'Đang tải...'
              : `${myContributions?.length || 0} đề xuất`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : !myContributions?.length ? (
            <div className="py-12 text-center text-muted-foreground">
              Bạn chưa có đề xuất nào
            </div>
          ) : (
            <div className="space-y-3">
              {myContributions.map((contribution) => {
                const person = people?.find(
                  (item) => item.id === contribution.target_person
                );
                return (
                  <ContributionListItem
                    key={contribution.id}
                    contribution={contribution}
                    person={person}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
