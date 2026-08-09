/**
 * @project AncestorTree
 * @file src/components/feed/comments-section.tsx
 * @description Expandable comments section for feed posts
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, Button, Input } from '@components/ui';
import { useCreateComment, useDeleteComment, usePostComments } from '@hooks';
import { getInitials, getRelativeTime } from '@lib';
import type { Profile } from '@types';

interface CommentsSectionProps {
  postId: string;
  commentsCount: number;
  profileMap: Map<string, Profile>;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function CommentsSection({
  postId,
  commentsCount,
  profileMap,
  currentUserId,
  isAdmin,
}: CommentsSectionProps) {
  const t = useTranslations('Feed');
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { data, isLoading } = usePostComments(isExpanded ? postId : undefined);
  const comments = data?.items ?? [];
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();

  const handleSubmitComment = async () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;

    try {
      await createComment.mutateAsync({ post_id: postId, content: trimmed });
      setNewComment('');
    } catch {
      toast.error(t('toasts.commentError'));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({ id: commentId, postId });
    } catch {
      toast.error(t('toasts.commentDeleteError'));
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        {commentsCount > 0
          ? t('actions.commentCount', { count: commentsCount })
          : t('actions.comment')}
      </button>
    );
  }

  return (
    <div className="space-y-3 border-t pt-2">
      {isLoading ? (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2">
          {(comments || []).map((comment) => {
            const author = profileMap.get(comment.author_id);
            const authorName = author?.full_name || t('anonymous');
            const canDelete = comment.author_id === currentUserId || isAdmin;

            return (
              <div key={comment.id} className="group flex gap-2">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="rounded-lg bg-muted px-3 py-1.5">
                    <span className="text-xs font-medium">{authorName}</span>
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {getRelativeTime(comment.created_at)}
                    </span>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentUserId && (
        <div className="flex gap-2">
          <Input
            placeholder={t('comments.placeholder')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
            className="h-8 text-sm"
            maxLength={2000}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSubmitComment}
            disabled={createComment.isPending || !newComment.trim()}
            className="h-8 px-2"
          >
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
