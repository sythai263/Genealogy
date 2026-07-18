/**
 * @project AncestorTree
 * @file src/components/charter/article-card.tsx
 * @description Single clan charter article card
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Star } from 'lucide-react';
import type { ClanArticle } from '@types';

interface ArticleCardProps {
  article: ClanArticle;
  index?: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  return (
    <div className="py-4">
      <div className="flex items-start gap-2">
        {article.is_featured && (
          <Star className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
        )}
        <div className="flex-1">
          <h3 className="text-base font-semibold">
            {index != null && (
              <span className="mr-2 text-muted-foreground">{index}.</span>
            )}
            {article.title}
          </h3>
          <div className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {article.content}
          </div>
        </div>
      </div>
    </div>
  );
}
