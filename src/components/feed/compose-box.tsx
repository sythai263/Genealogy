/**
 * @project AncestorTree
 * @file src/components/feed/compose-box.tsx
 * @description Compose box for creating new feed posts
 * @version 1.0.0
 * @updated 2026-03-09
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import {
  FEED_MAX_CONTENT_LENGTH,
  FEED_MAX_IMAGES,
  POST_TYPE_LABELS,
} from '@constants';
import { useCreatePost } from '@hooks';
import { StorageError, uploadFeedImage } from '@lib';
import type { PostType } from '@types';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ComposeBoxProps {
  onPostCreated?: () => void;
}

export function ComposeBox({ onPostCreated }: ComposeBoxProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('general');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = FEED_MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) {
      toast.error(`Tối đa ${FEED_MAX_IMAGES} ảnh`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    try {
      const newUrls: string[] = [];

      // One failure must not discard the images that already uploaded
      for (const file of filesToUpload) {
        try {
          newUrls.push(await uploadFeedImage(file));
        } catch (error) {
          toast.error(
            error instanceof StorageError
              ? `"${file.name}": ${error.message}`
              : `Lỗi khi tải "${file.name}" lên`
          );
        }
      }

      setImageUrls(prev => [...prev, ...newUrls]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }

    try {
      await createPost.mutateAsync({
        content: trimmed,
        post_type: postType,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      setContent('');
      setPostType('general');
      setImageUrls([]);
      toast.success('Đã đăng bài');
      onPostCreated?.();
    } catch {
      toast.error('Lỗi khi đăng bài');
    }
  };

  return (
    <Card>
      <CardContent className='pt-4 space-y-3'>
        <Textarea
          placeholder='Chia sẻ điều gì đó với gia đình...'
          value={content}
          onChange={e => setContent(e.target.value)}
          className='min-h-20 resize-none'
          maxLength={FEED_MAX_CONTENT_LENGTH}
        />

        {/* Image previews */}
        {imageUrls.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {imageUrls.map((url, i) => (
              <div
                key={i}
                className='relative w-20 h-20 rounded-md overflow-hidden border'>
                <Image
                  src={url}
                  alt=''
                  fill
                  className='object-cover'
                  sizes='80px'
                />
                <button
                  type='button'
                  onClick={() => removeImage(i)}
                  className='absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5'>
                  <X className='h-3 w-3' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className='flex items-center gap-2 flex-wrap'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            onChange={handleImageUpload}
            className='hidden'
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || imageUrls.length >= FEED_MAX_IMAGES}>
            {isUploading ? (
              <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
            ) : (
              <ImagePlus className='h-4 w-4 mr-1.5' />
            )}
            Ảnh ({imageUrls.length}/{FEED_MAX_IMAGES})
          </Button>

          <Select
            value={postType}
            onValueChange={v => setPostType(v as PostType)}>
            <SelectTrigger className='w-32.5 h-8 text-xs'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POST_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex-1' />

          <span className='text-xs text-muted-foreground'>
            {content.length}/{FEED_MAX_CONTENT_LENGTH}
          </span>

          <Button
            size='sm'
            onClick={handleSubmit}
            disabled={createPost.isPending || !content.trim()}>
            {createPost.isPending ? (
              <Loader2 className='h-4 w-4 mr-1.5 animate-spin' />
            ) : (
              <Send className='h-4 w-4 mr-1.5' />
            )}
            Đăng bài
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
