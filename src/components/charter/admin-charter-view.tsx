/**
 * @project AncestorTree
 * @file src/components/charter/admin-charter-view.tsx
 * @description Admin clan article management view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { CHARTER_CATEGORY_ORDER } from '@constants';
import {
  useClanArticles,
  useCreateClanArticle,
  useDeleteClanArticle,
  useUpdateClanArticle,
} from '@hooks';
import type { ClanArticle, ClanArticleCategory, CreateClanArticleInput } from '@types';
import { ArticleForm } from './article-form';
import { AccessDenied, QueryBoundary } from '@components/shared';

function isClanArticleCategory(value: string): value is ClanArticleCategory {
  return CHARTER_CATEGORY_ORDER.some((category) => category === value);
}

export function AdminCharterView() {
  const t = useTranslations('Admin');
  const tCharter = useTranslations('Charter');
  const tCommon = useTranslations('Common');
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

  function getCategoryLabel(category: string): string {
    if (isClanArticleCategory(category)) {
      return tCharter(`categories.${category}`);
    }
    return category;
  }

  if (!isEditor) {
    return <AccessDenied />;
  }

  async function handleCreate(data: CreateClanArticleInput) {
    try {
      await createMutation.mutateAsync({ ...data, author_id: profile?.id });
      toast.success(tCharter('toasts.addSuccess'));
      setDialogOpen(false);
    } catch {
      toast.error(tCharter('toasts.addError'));
    }
  }

  async function handleUpdate(data: CreateClanArticleInput) {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, input: data });
      toast.success(tCharter('toasts.updateSuccess'));
      setDialogOpen(false);
      setEditingItem(undefined);
    } catch {
      toast.error(tCharter('toasts.updateError'));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(tCharter('toasts.deleteSuccess'));
    } catch {
      toast.error(tCharter('toasts.deleteError'));
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('features.charter.title')}</h1>
          <p className="text-muted-foreground">{t('features.charter.subtitle')}</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingItem(undefined);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('features.charter.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem
                  ? t('features.charter.edit')
                  : t('features.charter.add')}
              </DialogTitle>
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
        <Button
          variant={filterCat === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterCat('all')}
        >
          {tCommon('all')}
        </Button>
        {CHARTER_CATEGORY_ORDER.map((category) => (
          <Button
            key={category}
            variant={filterCat === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCat(category)}
          >
            {tCharter(`categories.${category}`)}
          </Button>
        ))}
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={!articles || articles.length === 0}
        emptyIcon={ScrollText}
        emptyTitle={t('features.charter.empty')}
        skeletonRows={3}
      >
        <div className="space-y-2">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {article.is_featured && (
                    <Star className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCategoryLabel(article.category)} ·{' '}
                      {t('features.charter.sortOrder', {
                        order: article.sort_order,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingItem(article);
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
                        <AlertDialogTitle>
                          {tCharter('deleteConfirm.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {tCharter('deleteConfirm.description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(article.id)}>
                          {tCommon('delete')}
                        </AlertDialogAction>
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
