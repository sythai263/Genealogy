/**
 * @project AncestorTree
 * @file src/components/charter/article-list.tsx
 * @description List of featured quotes and regular charter articles
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { ScrollText } from 'lucide-react';
import type { ClanArticle } from '@types';
import { ArticleCard } from './article-card';
import { FeaturedQuote } from './featured-quote';

interface ArticleListProps {
  articles: ClanArticle[];
}

export function ArticleList({ articles }: ArticleListProps) {
  const t = useTranslations('Charter');
  const featured = articles.filter((article) => article.is_featured);
  const regular = articles.filter((article) => !article.is_featured);

  if (articles.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <ScrollText className="mx-auto mb-2 h-10 w-10 opacity-50" />
        <p>{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {featured.length > 0 && (
        <div className="space-y-4">
          {featured.map((article) => (
            <FeaturedQuote key={article.id} article={article} />
          ))}
        </div>
      )}

      {regular.length > 0 && (
        <div className="divide-y">
          {regular.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
