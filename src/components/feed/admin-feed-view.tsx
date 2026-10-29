/**
 * @project AncestorTree
 * @file src/components/feed/admin-feed-view.tsx
 * @description Admin feed moderation — orchestrates filter/search state and
 *              the paged post list; per-post card and delete dialog live in
 *              sibling components
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  MessagesSquare,
  Search,
  Shield,
} from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  Badge,
  Input,
} from '@components/ui';
import {
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  usePosts,
  usePostsCount,
  useProfilesByIds,
  useResettablePage,
} from '@hooks';
import type { Post, Profile } from '@types';
import { DeletePostDialog } from './delete-post-dialog';
import { FeedPostCard } from './feed-post-card';

type FilterTab = 'all' | 'hidden';

export function AdminFeedView() {
  const t = useTranslations('Admin');
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
        isEmpty={items.length === 0}
        emptyIcon={MessagesSquare}
        emptyTitle={
          search ? t('features.feed.noResults') : t('features.feed.empty')
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            {items.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                authorName={
                  profileMap.get(post.author_id)?.full_name ||
                  t('features.feed.anonymous')
                }
                onDelete={setDeleteTarget}
              />
            ))}
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

      <DeletePostDialog
        post={deleteTarget}
        authorName={
          deleteTarget
            ? (profileMap.get(deleteTarget.author_id)?.full_name ??
              t('features.feed.anonymous'))
            : ''
        }
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
