/**
 * @project AncestorTree
 * @file src/lib/supabase-data-feed.ts
 * @description Data layer for feed posts, comments, and likes
 * @version 1.0.0
 * @updated 2026-03-09
 */

import { supabase } from './supabase';
import { escapeIlikePattern } from './utils';
import { FEED_MAX_IMAGES, getPaginationRange } from '@constants';
import type { ListPageSize, Post, PostComment, PostLike, PostsListFilters, PaginatedResult, CreatePostInput, UpdatePostInput, CreateCommentInput, PostStatus } from '@types';

// Security: allowlist for mass-assignment protection
const ALLOWED_UPDATE_FIELDS = ['content', 'post_type', 'images', 'status'] as const;

function isValidImageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/');
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getPosts(
  filters: PostsListFilters
): Promise<PaginatedResult<Post>> {
  const { from, to } = getPaginationRange(filters.page, filters.pageSize);

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status === 'all') {
    // no status filter — admin moderation
  } else if (filters.status) {
    query = query.eq('status', filters.status);
  } else {
    query = query.eq('status', 'published');
  }

  if (filters.type) {
    query = query.eq('post_type', filters.type);
  }

  const trimmed = filters.search?.trim();
  if (trimmed) {
    const pattern = `%${escapeIlikePattern(trimmed)}%`;

    const { data: matchingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('full_name', pattern)
      .limit(50);

    if (profilesError) throw profilesError;

    const authorIds = (matchingProfiles || []).map((p) => p.user_id);
    const orParts = [`content.ilike."${pattern}"`];
    if (authorIds.length > 0) {
      orParts.push(`author_id.in.(${authorIds.join(',')})`);
    }
    query = query.or(orParts.join(','));
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: data || [], total: count ?? 0 };
}

/** Lightweight count for admin badge tabs — does not load rows. */
export async function getPostsCount(
  status: PostStatus | 'all' = 'all'
): Promise<number> {
  let query = supabase
    .from('posts')
    .select('*', { count: 'exact', head: true });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Validate content
  const content = (input.content || '').trim();
  if (!content || content.length > 5000) {
    throw new Error('Nội dung bài viết phải từ 1-5000 ký tự');
  }

  // Validate images
  const images = (input.images || []).slice(0, FEED_MAX_IMAGES);
  for (const url of images) {
    if (!isValidImageUrl(url)) {
      throw new Error(`Invalid image URL: ${url}`);
    }
  }

  // Mass-assignment protection
  const safeInput: Record<string, unknown> = {
    content,
    post_type: input.post_type || 'general',
    images,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...safeInput, author_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  // Validate images if provided
  if (input.images) {
    const images = input.images.slice(0, FEED_MAX_IMAGES);
    for (const url of images) {
      if (!isValidImageUrl(url)) {
        throw new Error(`Invalid image URL: ${url}`);
      }
    }
    input = { ...input, images };
  }

  // Mass-assignment protection
  const safeInput: Record<string, unknown> = {};
  for (const key of ALLOWED_UPDATE_FIELDS) {
    if (key in input) {
      safeInput[key] = input[key as keyof UpdatePostInput];
    }
  }
  safeInput.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('posts')
    .update(safeInput)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function hidePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'hidden', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function unhidePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

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
