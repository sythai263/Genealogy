/**
 * @project AncestorTree
 * @file src/components/feed/feed-post-card.tsx
 * @description One post card in the admin feed moderation list — author,
 *              badges, content preview, hide/show + delete actions. Hide
 *              owns its mutation; delete delegates to the parent dialog.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useHidePost } from '@hooks';
import { getInitials } from '@lib';
import type { Post, PostType } from '@types';

function isPostType(value: string): value is PostType {
  return (
    value === 'general' ||
    value === 'photo' ||
    value === 'milestone' ||
    value === 'memory' ||
    value === 'announcement'
  );
}

interface FeedPostCardProps {
  post: Post;
  authorName: string;
  onDelete: (post: Post) => void;
}

export function FeedPostCard({
  post,
  authorName,
  onDelete,
}: FeedPostCardProps) {
  const t = useTranslations('Admin');
  const tFeed = useTranslations('Feed');
  const locale = useLocale();
  const hidePost = useHidePost();
  const isHidden = post.status === 'hidden';

  function getPostTypeLabel(postType: string): string {
    if (isPostType(postType)) {
      return tFeed(`types.${postType}`);
    }
    return postType;
  }

  function handleToggleHide() {
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

  return (
    <Card className={isHidden ? 'border-dashed opacity-70' : ''}>
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
              onClick={handleToggleHide}
              title={
                isHidden ? t('features.feed.show') : t('features.feed.hide')
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
              onClick={() => onDelete(post)}
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
}
