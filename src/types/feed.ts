export type PostType = 'general' | 'photo' | 'milestone' | 'memory' | 'announcement';
export type PostStatus = 'published' | 'hidden';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  images: string[];
  post_type: PostType;
  status: PostStatus;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostsListFilters {
  type?: PostType;
  /** Omit for published-only. Use 'all' for no status filter (admin). */
  status?: PostStatus | 'all';
  search?: string;
  page: number;
  pageSize: 20 | 30 | 50;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface PostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export type CreatePostInput = Pick<Post, 'content' | 'post_type'> & {
  images?: string[];
};

export type UpdatePostInput = Partial<Pick<Post, 'content' | 'post_type' | 'images' | 'status'>>;

export type CreateCommentInput = Pick<PostComment, 'post_id' | 'content'>;
