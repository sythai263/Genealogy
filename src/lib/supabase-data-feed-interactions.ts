/**
 * @project AncestorTree
 * @file src/lib/supabase-data-feed-interactions.ts
 * @description Data layer for feed interactions — post comments and likes
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { getPaginationRange } from '@constants';
import type {
    CreateCommentInput,
    ListPageSize,
    PaginatedResult,
    PostComment,
    PostLike,
} from '@types';
import { supabase } from './supabase';

// ─── Comments ───────────────────────────────────────────────────────────────

/** Paginated comments list — bounds fetch for posts with heavy discussion. */
export async function getPostComments(
  postId: string,
  page = 1,
  pageSize: ListPageSize = 50
): Promise<PaginatedResult<PostComment>> {
  const { from, to } = getPaginationRange(page, pageSize);

  const { data, error, count } = await supabase
    .from('post_comments')
    .select('*', { count: 'exact' })
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .range(from, to);

  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

export async function createComment(input: CreateCommentInput): Promise<PostComment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const content = input.content.trim();
  if (!content || content.length > 2000) {
    throw new Error('Comment content must be 1-2000 characters');
  }

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: input.post_id,
      content,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase
    .from('post_comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── Likes ──────────────────────────────────────────────────────────────────

export async function toggleLike(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('id', existing.id);

    if (error) throw error;
    return false;
  } else {
    // Like
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id });

    if (error) throw error;
    return true;
  }
}

export async function getPostLikes(postId: string): Promise<PostLike[]> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('*')
    .eq('post_id', postId);

  if (error) throw error;
  return data || [];
}

export async function getUserLikedPosts(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map(d => d.post_id);
}

/** Scoped like-lookup — only queries the given post ids (e.g. current page). */
export async function getUserLikedPostIdsForPosts(postIds: string[]): Promise<string[]> {
  const uniqueIds = [...new Set(postIds)];
  if (uniqueIds.length === 0) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', uniqueIds);

  if (error) throw error;
  return (data || []).map((d) => d.post_id);
}
