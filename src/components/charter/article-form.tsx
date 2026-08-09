/**
 * @project AncestorTree
 * @file src/components/charter/article-form.tsx
 * @description Clan article create/edit form
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
import { CHARTER_CATEGORY_ORDER } from '@constants';
import type {
  ClanArticle,
  ClanArticleCategory,
  CreateClanArticleInput,
} from '@types';

interface ArticleFormProps {
  article?: ClanArticle;
  onSubmit: (data: CreateClanArticleInput) => void;
  isPending: boolean;
}

export function ArticleForm({
  article,
  onSubmit,
  isPending,
}: ArticleFormProps) {
  const t = useTranslations('Charter');
  const tCommon = useTranslations('Common');
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [category, setCategory] = useState<ClanArticleCategory>(
    article?.category || 'gia_huan'
  );
  const [sortOrder, setSortOrder] = useState(
    article?.sort_order?.toString() || '0'
  );
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) {
      toast.error(t('toasts.fieldsRequired'));
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
        <Label>{t('form.title')} *</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('form.titlePlaceholder')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('form.category')}</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as ClanArticleCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHARTER_CATEGORY_ORDER.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {t(`categories.${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>{t('form.sortOrder')}</Label>
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label>{t('form.content')} *</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          placeholder={t('form.contentPlaceholder')}
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
        <Label>{t('form.isFeatured')}</Label>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? tCommon('saving')
          : article
            ? tCommon('update')
            : tCommon('create')}
      </Button>
    </form>
  );
}
