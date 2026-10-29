/**
 * @project AncestorTree
 * @file src/components/feed/delete-post-dialog.tsx
 * @description Confirm dialog for deleting a feed post — owns its mutation,
 *              pending state and toasts
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
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
} from '@components/ui';
import { useDeletePost } from '@hooks';
import type { Post } from '@types';

interface DeletePostDialogProps {
  post: Post | null;
  /** Resolved author display name (for the confirm description) */
  authorName: string;
  onClose: () => void;
}

export function DeletePostDialog({
  post,
  authorName,
  onClose,
}: DeletePostDialogProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const tFeed = useTranslations('Feed');
  const deletePost = useDeletePost();

  async function handleDelete() {
    if (!post) return;
    try {
      await deletePost.mutateAsync(post.id);
      toast.success(tFeed('toasts.deleteSuccess'));
    } catch {
      toast.error(tFeed('toasts.deleteError'));
    }
    onClose();
  }

  return (
    <AlertDialog open={!!post} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('features.feed.deleteConfirm.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('features.feed.deleteConfirm.description', {
              author: post ? authorName : '',
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
  );
}
