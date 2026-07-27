'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Pencil, Plus, Star, Trash2, Trophy } from 'lucide-react';
import { useAuth } from '@components/auth';
import { ListPagination } from '@components/shared';
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
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useAchievements,
  useCreateAchievement,
  useDeleteAchievement,
  usePeople,
  useUpdateAchievement,
} from '@hooks';
import type { AchievementFormData } from '@schemas';
import type { Achievement, CreateAchievementInput, Person } from '@types';
import { AchievementForm } from './achievement-form';
import { getAchievementCategoryLabel } from './achievement-category';

function toCreateInput(data: AchievementFormData): CreateAchievementInput {
  return {
    person_id: data.person_id,
    title: data.title,
    category: data.category,
    description: data.description || undefined,
    year: data.year ? Number(data.year) : undefined,
    awarded_by: data.awarded_by || undefined,
    is_featured: data.is_featured,
  };
}

export function AdminAchievementsView() {
  const { isEditor } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Achievement | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useAchievements({
    search: search || undefined,
    page,
    pageSize,
  });
  const { data: people } = usePeople();
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const peopleMap = new Map<string, Person>();
  for (const person of people ?? []) {
    peopleMap.set(person.id, person);
  }

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  if (!isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Bạn cần quyền biên tập viên để truy cập trang này
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleCreate(data: AchievementFormData) {
    createMutation.mutate(toCreateInput(data), {
      onSuccess: () => {
        toast.success('Đã thêm thành tích');
        setDialogOpen(false);
      },
      onError: () => {
        toast.error('Lỗi khi thêm thành tích');
      },
    });
  }

  function handleUpdate(data: AchievementFormData) {
    if (!editingItem) return;
    updateMutation.mutate(
      { id: editingItem.id, input: toCreateInput(data) },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật thành tích');
          setDialogOpen(false);
          setEditingItem(undefined);
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật');
        },
      }
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Đã xóa thành tích');
      },
      onError: () => {
        toast.error('Lỗi khi xóa');
      },
    });
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) setEditingItem(undefined);
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Vinh danh</h1>
          <p className="text-muted-foreground">
            Thêm, sửa, xóa thành tích thành viên
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Thêm thành tích
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Sửa thành tích' : 'Thêm thành tích mới'}
              </DialogTitle>
            </DialogHeader>
            <AchievementForm
              key={editingItem?.id ?? 'new'}
              achievement={editingItem}
              people={people ?? []}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              isPending={
                createMutation.isPending || updateMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Tìm kiếm theo tên hoặc tiêu đề..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((index) => (
            <Card key={index}>
              <CardContent className="h-16 p-4" />
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="mx-auto mb-2 h-10 w-10 opacity-50" />
            <p>Chưa có thành tích nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {items.map((achievement) => {
              const person = peopleMap.get(achievement.person_id);
              return (
                <Card key={achievement.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      {achievement.is_featured && (
                        <Star className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {person?.display_name ?? '?'} ·{' '}
                          {getAchievementCategoryLabel(achievement.category)}
                          {achievement.year && ` · ${achievement.year}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(achievement);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa thành tích?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(achievement.id)}
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="thành tích"
          />
        </div>
      )}
    </div>
  );
}
