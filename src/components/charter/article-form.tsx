/**
 * @project AncestorTree
 * @file src/components/charter/article-form.tsx
 * @description Clan article create/edit form
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@components/ui';
import { CHARTER_CATEGORY_OPTIONS } from '@constants';
import type { ClanArticle, ClanArticleCategory, CreateClanArticleInput } from '@types';

interface ArticleFormProps {
  article?: ClanArticle;
  onSubmit: (data: CreateClanArticleInput) => void;
  isPending: boolean;
}

export function ArticleForm({ article, onSubmit, isPending }: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [category, setCategory] = useState<ClanArticleCategory>(article?.category || 'gia_huan');
  const [sortOrder, setSortOrder] = useState(article?.sort_order?.toString() || '0');
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) {
      toast.error('Vui lòng điền tiêu đề và nội dung');
      return;
    }
    onSubmit({
      title,
      content,
      category,
      sort_order: parseInt(sortOrder) || 0,
      is_featured: isFeatured,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Tiêu đề *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Về đạo Hiếu" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Danh mục</Label>
          <Select value={category} onValueChange={v => setCategory(v as ClanArticleCategory)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CHARTER_CATEGORY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Thứ tự</Label>
          <Input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Nội dung *</Label>
        <Textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Nội dung bài viết..." />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
        <Label>Nổi bật</Label>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Đang lưu...' : (article ? 'Cập nhật' : 'Thêm mới')}
      </Button>
    </form>
  );
}
