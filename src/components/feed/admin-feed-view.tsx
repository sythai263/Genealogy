/**
 * @project AncestorTree
 * @file src/components/feed/admin-feed-view.tsx
 * @description Admin feed moderation — view all/hidden posts, hide/unhide/delete
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  MessagesSquare,
  Search,
  Shield,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
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
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useDeletePost,
  useHidePost,
  usePosts,
  usePostsCount,
  useProfilesByIds,
  useResettablePage,
} from '@hooks';
import { getInitials } from '@lib';
import type { Post, PostType, Profile } from '@types';

type FilterTab = 'all' | 'hidden';

function isPostType(value: string): value is PostType {
  return (
    value === 'general' ||
    value === 'photo' ||
    value === 'milestone' ||
    value === 'memory' ||
    value === 'announcement'
  );
}

export function AdminFeedView() {
  const t = useTranslations('Admin');
  const tFeed = useTranslations('Feed');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { isEditor } = useAuth();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [pageSize, setPageSize] = useState<ListPageSize>(
    LIST_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(`${filter}|${search}|${pageSize}`);

  const { data, isLoading } = usePosts({
    status: filter === 'hidden' ? 'hidden' : 'all',
    search: search || undefined,
    page,
    pageSize,
  });
  const { data: allCount = 0 } = usePostsCount('all');
  const { data: hiddenCount = 0 } = usePostsCount('hidden');
  const deletePost = useDeletePost();
  const hidePost = useHidePost();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const authorIds = useMemo(
    () => [...new Set(items.map((post) => post.author_id))],
    [items]
  );
  const { data: profiles } = useProfilesByIds(authorIds);

  const profileMap = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const p of profiles || []) {
      map.set(p.user_id, p);
    }
    return map;
  }, [profiles]);

  function getPostTypeLabel(postType: string): string {
    if (isPostType(postType)) {
      return tFeed(`types.${postType}`);
    }
    return postType;
  }

  if (!isEditor) {
    return <AccessDenied />;
  }

  const filteredPosts = items;

  function handleToggleHide(post: Post) {
    const isHidden = post.status === 'hidden';
    hidePost.mutate(
      { id: post.id, hide: !isHidden },
      {
        onSuccess: () =>
          toast.success(
            isHidden
              ? t('features.feed.shown')
              : t('features.feed.hidden')
          ),
        onError: () => toast.error(tFeed('toasts.genericError')),
      }
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      toast.success(tFeed('toasts.deleteSuccess'));
    } catch {
      toast.error(tFeed('toasts.deleteError'));
    }
    setDeleteTarget(null);
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          {t('features.feed.title')}
        </h1>
        <p className="text-muted-foreground">{t('features.feed.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            {t('features.feed.filterAll', { count: allCount })}
          </Badge>
          <Badge
            variant={filter === 'hidden' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilter('hidden')}
          >
            {t('features.feed.filterHidden', { count: hiddenCount })}
          </Badge>
        </div>
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('features.feed.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={filteredPosts.length === 0}
        emptyIcon={MessagesSquare}
        emptyTitle={
          search ? t('features.feed.noResults') : t('features.feed.empty')
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {filteredPosts.map((post) => {
              const author = profileMap.get(post.author_id);
              const authorName =
                author?.full_name || t('features.feed.anonymous');
              const isHidden = post.status === 'hidden';

              return (
                <Card
                  key={post.id}
                  className={isHidden ? 'border-dashed opacity-70' : ''}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          {authorName}
                          {post.post_type !== 'general' && (
                            <Badge variant="secondary" className="text-[10px]">
                              {getPostTypeLabel(post.post_type)}
                            </Badge>
                          )}
                          {isHidden && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-600"
                            >
                              {tFeed('hidden')}
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleString(locale)}
                          {' · '}
                          {t('features.feed.meta', {
                            likes: post.likes_count,
                            comments: post.comments_count,
                          })}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleHide(post)}
                          title={
                            isHidden
                              ? t('features.feed.show')
                              : t('features.feed.hide')
                          }
                        >
                          {isHidden ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(post)}
                          className="text-destructive hover:text-destructive"
                          title={t('features.feed.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('features.feed.attachedImages', {
                          count: post.images.length,
                        })}
                      </p>
                    )}
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
            itemLabel={t('features.feed.countLabel')}
          />
        </div>
      </QueryBoundary>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('features.feed.deleteConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('features.feed.deleteConfirm.description', {
                author: deleteTarget
                  ? (profileMap.get(deleteTarget.author_id)?.full_name ??
                    t('features.feed.anonymous'))
                  : '',
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
