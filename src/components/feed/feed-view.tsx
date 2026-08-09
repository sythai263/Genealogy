/**
 * @project AncestorTree
 * @file src/components/feed/feed-view.tsx
 * @description Community feed page — timeline + compose + filter
 * @version 1.0.0
 * @updated 2026-07-27
 */

'use client';

import { useMemo, useState } from 'react';
import { useResettablePage } from '@hooks';
import { MessagesSquare } from 'lucide-react';
import { useAuth } from '@components/auth';
import { ListPagination, PageHeader, QueryBoundary } from '@components/shared';
import { Badge } from '@components/ui';
import {
  FEED_FILTER_TABS,
  LIST_DEFAULT_PAGE_SIZE,
  isFeedFilterKey,
  type FeedFilterKey,
  type ListPageSize,
} from '@constants';
import { useLikedPostIdsForPosts, usePosts, useProfilesByIds } from '@hooks';
import type { Profile } from '@types';
import { ComposeBox } from './compose-box';
import { PostCard } from './post-card';

export function FeedView() {
  const { user, isAdmin, isEditor } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FeedFilterKey>('all');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${activeFilter}|${pageSize}`);

  const filterType = activeFilter === 'all' ? undefined : activeFilter;
  const { data, isLoading: postsLoading } = usePosts({
    type: filterType,
    page,
    pageSize,
  });
  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const authorIds = useMemo(
    () => [...new Set(items.map((post) => post.author_id))],
    [items]
  );
  const { data: profiles } = useProfilesByIds(authorIds);

  const { data: likedPostIds } = useLikedPostIdsForPosts(
    items.map((post) => post.id),
    !!user
  );

  const profileMap = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const profile of profiles || []) {
      map.set(profile.user_id, profile);
    }
    return map;
  }, [profiles]);

  const likedSet = useMemo(
    () => new Set(likedPostIds || []),
    [likedPostIds]
  );

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <PageHeader
        title="Góc giao lưu"
        description="Không gian chia sẻ của con cháu dòng họ"
      />

      {user && <ComposeBox />}

      <div className="flex flex-wrap gap-1.5">
        {FEED_FILTER_TABS.map((tab) => (
          <Badge
            key={tab.key}
            variant={activeFilter === tab.key ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              if (isFeedFilterKey(tab.key)) setActiveFilter(tab.key);
            }}
          >
            {tab.label}
          </Badge>
        ))}
      </div>

      <QueryBoundary
        isLoading={postsLoading}
        isEmpty={items.length === 0}
        emptyIcon={MessagesSquare}
        emptyTitle={
          activeFilter !== 'all'
            ? 'Không có bài viết nào trong mục này'
            : 'Chưa có bài viết nào'
        }
        emptyDescription={
          activeFilter === 'all' ? 'Hãy là người đầu tiên chia sẻ!' : undefined
        }
        skeletonVariant="feed"
      >
        <div className="space-y-4">
          {items.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              profileMap={profileMap}
              currentUserId={user?.id}
              isLiked={likedSet.has(post.id)}
              isAdmin={isAdmin}
              isEditor={isEditor}
            />
          ))}
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="bài viết"
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
