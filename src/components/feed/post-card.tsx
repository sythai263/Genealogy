/**
 * @project AncestorTree
 * @file src/components/feed/post-card.tsx
 * @description Post card component for feed timeline
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Eye, EyeOff, Heart, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui';
import { useDeletePost, useHidePost, useToggleLike } from '@hooks';
import { getInitials, getRelativeTime } from '@lib';
import type { Post, Profile } from '@types';
import { CommentsSection } from './comments-section';

interface PostCardProps {
  post: Post;
  profileMap: Map<string, Profile>;
  currentUserId?: string;
  isLiked: boolean;
  isAdmin?: boolean;
  isEditor?: boolean;
}

export function PostCard({
  post,
  profileMap,
  currentUserId,
  isLiked,
  isAdmin,
  isEditor,
}: PostCardProps) {
  const t = useTranslations('Feed');
  const tCommon = useTranslations('Common');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deletePost = useDeletePost();
  const hidePost = useHidePost();
  const toggleLike = useToggleLike();

  const author = profileMap.get(post.author_id);
  const authorName = author?.full_name || t('anonymous');
  const isOwner = post.author_id === currentUserId;
  const canModerate = isAdmin || isEditor;
  const canDelete = isOwner || isAdmin;
  const isHidden = post.status === 'hidden';

  const handleLike = () => {
    toggleLike.mutate(post.id, {
      onError: () => toast.error(t('toasts.likeError')),
    });
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(post.id);
      toast.success(t('toasts.deleteSuccess'));
    } catch {
      toast.error(t('toasts.deleteError'));
    }
    setShowDeleteDialog(false);
  };

  const handleToggleHide = () => {
    hidePost.mutate(
      { id: post.id, hide: !isHidden },
      {
        onSuccess: () =>
          toast.success(
            isHidden ? t('toasts.showSuccess') : t('toasts.hideSuccess')
          ),
        onError: () => toast.error(t('toasts.genericError')),
      }
    );
  };

  const renderImages = () => {
    const images = post.images || [];
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="overflow-hidden rounded-md">
          <Image
            src={images[0]}
            alt=""
            width={800}
            height={384}
            className="max-h-96 w-full object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      );
    }

    return (
      <div
        className={`grid gap-1 overflow-hidden rounded-md ${
          images.length === 2
            ? 'grid-cols-2'
            : images.length === 3
              ? 'grid-cols-2'
              : 'grid-cols-2'
        }`}
      >
        {images.slice(0, 4).map((url, i) => (
          <div
            key={i}
            className={`relative h-40 ${
              images.length === 3 && i === 0 ? 'col-span-2' : ''
            }`}
          >
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {i === 3 && images.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className={isHidden ? 'border-dashed opacity-60' : ''}>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs">
                {getInitials(authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {authorName}
                </span>
                {post.post_type !== 'general' && (
                  <Badge variant="secondary" className="text-[10px]">
                    {t(`types.${post.post_type}`)}
                  </Badge>
                )}
                {isHidden && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-amber-600"
                  >
                    {t('hidden')}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {getRelativeTime(post.created_at)}
              </p>
            </div>

            {(isOwner || canModerate) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canModerate && (
                    <DropdownMenuItem onClick={handleToggleHide}>
                      {isHidden ? (
                        <Eye className="mr-2 h-4 w-4" />
                      ) : (
                        <EyeOff className="mr-2 h-4 w-4" />
                      )}
                      {isHidden ? t('showPost') : t('hidePost')}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="wrap-break-word text-sm whitespace-pre-wrap">
            {post.content}
          </p>

          {renderImages()}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              disabled={toggleLike.isPending}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {post.likes_count > 0 && <span>{post.likes_count}</span>}
            </button>

            <CommentsSection
              postId={post.id}
              commentsCount={post.comments_count}
              profileMap={profileMap}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description')}
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
    </>
  );
}
