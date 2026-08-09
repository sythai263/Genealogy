/**
 * @project AncestorTree
 * @file src/components/charter/admin-charter-view.tsx
 * @description Admin clan article management view
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { Pencil, Plus, ScrollText, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
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
} from '@components/ui';
import { CHARTER_CATEGORY_OPTIONS } from '@constants';
import {
  useClanArticles,
  useCreateClanArticle,
  useDeleteClanArticle,
  useUpdateClanArticle,
} from '@hooks';
import type { ClanArticle, ClanArticleCategory, CreateClanArticleInput } from '@types';
import { ArticleForm } from './article-form';
import { AccessDenied, QueryBoundary } from '@components/shared';

export function AdminCharterView() {
  const { profile, isEditor } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClanArticle | undefined>();
  const [filterCat, setFilterCat] = useState<ClanArticleCategory | 'all'>('all');

  const { data, isLoading } = useClanArticles({
    category: filterCat === 'all' ? undefined : filterCat,
    pageSize: 50,
  });
  const articles = data?.items ?? [];
  const createMutation = useCreateClanArticle();
  const updateMutation = useUpdateClanArticle();
  const deleteMutation = useDeleteClanArticle();

  if (!isEditor) {
    return <AccessDenied />;
  }

  async function handleCreate(data: CreateClanArticleInput) {
    try {
      await createMutation.mutateAsync({ ...data, author_id: profile?.id });
      toast.success('Đã thêm bài viết');
      setDialogOpen(false);
    } catch {
      toast.error('Lỗi khi thêm bài viết');
    }
  }

  async function handleUpdate(data: CreateClanArticleInput) {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, input: data });
      toast.success('Đã cập nhật bài viết');
      setDialogOpen(false);
      setEditingItem(undefined);
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa bài viết');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Hương ước</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa bài viết gia huấn và quy ước</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Thêm bài viết</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Sửa bài viết' : 'Thêm bài viết mới'}</DialogTitle>
            </DialogHeader>
            <ArticleForm
              key={editingItem?.id || 'new'}
              article={editingItem}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Button variant={filterCat === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('all')}>
          Tất cả
        </Button>
        {CHARTER_CATEGORY_OPTIONS.map(opt => (
          <Button
            key={opt.value}
            variant={filterCat === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCat(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={!articles || articles.length === 0}
        emptyIcon={ScrollText}
        emptyTitle="Chưa có bài viết nào"
        skeletonRows={3}
      >
        <div className="space-y-2">
          {articles.map(a => (
            <Card key={a.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {a.is_featured && <Star className="h-4 w-4 text-amber-500 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {CHARTER_CATEGORY_OPTIONS.find(c => c.value === a.category)?.label} · Thứ tự: {a.sort_order}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { setEditingItem(a); setDialogOpen(true); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(a.id)}>Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryBoundary>
    </div>
  );
}
