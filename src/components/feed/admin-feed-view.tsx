/**
 * @project AncestorTree
 * @file src/components/feed/admin-feed-view.tsx
 * @description Admin feed moderation — view all/hidden posts, hide/unhide/delete
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Loader2,
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
  POST_TYPE_LABELS,
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
import type { Post, Profile } from '@types';

type FilterTab = 'all' | 'hidden';

export function AdminFeedView() {
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
          toast.success(isHidden ? 'Đã hiện bài viết' : 'Đã ẩn bài viết'),
        onError: () => toast.error('Lỗi'),
      }
    );
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      toast.success('Đã xóa bài viết');
    } catch {
      toast.error('Lỗi khi xóa bài viết');
    }
    setDeleteTarget(null);
  }

  return (
    <div className='container mx-auto px-4 py-8 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Shield className='h-6 w-6' />
          Quản lý bài viết
        </h1>
        <p className='text-muted-foreground'>
          Duyệt, ẩn/hiện và xóa bài viết trong Góc giao lưu
        </p>
      </div>

      {/* Filter + Search */}
      <div className='flex flex-wrap gap-3 items-center'>
        <div className='flex gap-1.5'>
          <Badge
            variant={filter === 'all' ? 'default' : 'outline'}
            className='cursor-pointer'
            onClick={() => setFilter('all')}>
            Tất cả ({allCount})
          </Badge>
          <Badge
            variant={filter === 'hidden' ? 'default' : 'outline'}
            className='cursor-pointer'
            onClick={() => setFilter('hidden')}>
            Đã ẩn ({hiddenCount})
          </Badge>
        </div>
        <div className='relative flex-1 min-w-50 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Tìm theo nội dung hoặc tác giả...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='pl-8'
          />
        </div>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={filteredPosts.length === 0}
        emptyIcon={MessagesSquare}
        emptyTitle={
          search ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'
        }
        skeletonRows={3}>
        <div className='space-y-4'>
          <div className='space-y-3'>
            {filteredPosts.map(post => {
              const author = profileMap.get(post.author_id);
              const authorName = author?.full_name || 'Ẩn danh';
              const isHidden = post.status === 'hidden';

              return (
                <Card
                  key={post.id}
                  className={isHidden ? 'border-dashed opacity-70' : ''}>
                  <CardHeader className='pb-2'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='text-xs'>
                          {getInitials(authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-sm font-medium flex items-center gap-2'>
                          {authorName}
                          {post.post_type !== 'general' && (
                            <Badge variant='secondary' className='text-[10px]'>
                              {POST_TYPE_LABELS[post.post_type]}
                            </Badge>
                          )}
                          {isHidden && (
                            <Badge
                              variant='outline'
                              className='text-[10px] text-amber-600'>
                              Đã ẩn
                            </Badge>
                          )}
                        </CardTitle>
                        <p className='text-xs text-muted-foreground'>
                          {new Date(post.created_at).toLocaleString('vi-VN')}
                          {' · '}
                          {post.likes_count} tim · {post.comments_count} bình
                          luận
                        </p>
                      </div>

                      {/* Actions */}
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleToggleHide(post)}
                          title={isHidden ? 'Hiện bài viết' : 'Ẩn bài viết'}>
                          {isHidden ? (
                            <Eye className='h-4 w-4' />
                          ) : (
                            <EyeOff className='h-4 w-4' />
                          )}
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setDeleteTarget(post)}
                          className='text-destructive hover:text-destructive'
                          title='Xóa bài viết'>
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <p className='text-sm line-clamp-3 whitespace-pre-wrap'>
                      {post.content}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <p className='text-xs text-muted-foreground mt-1'>
                        {post.images.length} ảnh đính kèm
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
            itemLabel='bài viết'
          />
        </div>
      </QueryBoundary>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Bài viết của{' '}
              <strong>
                {deleteTarget &&
                  profileMap.get(deleteTarget.author_id)?.full_name}
              </strong>{' '}
              sẽ bị xóa vĩnh viễn cùng tất cả bình luận và lượt thích.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
