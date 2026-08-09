'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks';
import { toast } from 'sonner';
import { Pencil, Plus, Star, Trash2, Trophy } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  PageHeader,
  QueryBoundary,
} from '@components/shared';
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
  getAchievementCategoryLabel,
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useAchievements,
  useCreateAchievement,
  useDeleteAchievement,
  usePeopleByIds,
  useUpdateAchievement,
} from '@hooks';
import type { AchievementFormData } from '@schemas';
import type { Achievement, CreateAchievementInput, Person } from '@types';
import { AchievementForm } from './achievement-form';

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
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${search}|${pageSize}`);

  const { data, isLoading } = useAchievements({
    search: search || undefined,
    page,
    pageSize,
  });
  const createMutation = useCreateAchievement();
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((achievement) => achievement.person_id).filter(Boolean))],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const person of people ?? []) {
      map.set(person.id, person);
    }
    return map;
  }, [people]);

  if (!isEditor) {
    return <AccessDenied />;
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
      <PageHeader
        title="Quản lý Vinh danh"
        description="Thêm, sửa, xóa thành tích thành viên"
        actions={
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
                onSubmit={editingItem ? handleUpdate : handleCreate}
                isPending={
                  createMutation.isPending || updateMutation.isPending
                }
              />
            </DialogContent>
          </Dialog>
        }
      />

      <Input
        placeholder="Tìm kiếm theo tên hoặc tiêu đề..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="max-w-md"
      />

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyIcon={Trophy}
        emptyTitle="Chưa có thành tích nào"
        skeletonRows={3}
      >
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
      </QueryBoundary>
    </div>
  );
}
