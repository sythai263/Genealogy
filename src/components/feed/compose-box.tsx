/**
 * @project AncestorTree
 * @file src/components/feed/compose-box.tsx
 * @description Compose box for creating new feed posts
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
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
  POST_TYPE_ORDER,
} from '@constants';
import { useCreatePost } from '@hooks';
import { StorageError, uploadFeedImage } from '@lib';
import type { PostType } from '@types';

interface ComposeBoxProps {
  onPostCreated?: () => void;
}

export function ComposeBox({ onPostCreated }: ComposeBoxProps) {
  const t = useTranslations('Feed');
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
      toast.error(t('toasts.maxImages', { count: FEED_MAX_IMAGES }));
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
              : t('compose.uploadError', { name: file.name })
          );
        }
      }

      setImageUrls((prev) => [...prev, ...newUrls]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error(t('toasts.contentRequired'));
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
      toast.success(t('toasts.postSuccess'));
      onPostCreated?.();
    } catch {
      toast.error(t('toasts.postError'));
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <Textarea
          placeholder={t('compose.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-20 resize-none"
          maxLength={FEED_MAX_CONTENT_LENGTH}
        />

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <div
                key={i}
                className="relative h-20 w-20 overflow-hidden rounded-md border"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || imageUrls.length >= FEED_MAX_IMAGES}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-1.5 h-4 w-4" />
            )}
            {t('compose.photosCount', {
              count: imageUrls.length,
              max: FEED_MAX_IMAGES,
            })}
          </Button>

          <Select
            value={postType}
            onValueChange={(v) => setPostType(v as PostType)}
          >
            <SelectTrigger className="h-8 w-32.5 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_TYPE_ORDER.map((key) => (
                <SelectItem key={key} value={key}>
                  {t(`types.${key}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <span className="text-xs text-muted-foreground">
            {content.length}/{FEED_MAX_CONTENT_LENGTH}
          </span>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={createPost.isPending || !content.trim()}
          >
            {createPost.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            {createPost.isPending ? t('compose.posting') : t('compose.post')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
