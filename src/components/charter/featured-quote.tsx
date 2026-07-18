/**
 * @project AncestorTree
 * @file src/components/charter/featured-quote.tsx
 * @description Featured quote card for a clan charter article
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Star } from 'lucide-react';
import { Card, CardContent } from '@components/ui';
import { CHARTER_FEATURED_EXCERPT_LENGTH } from '@constants';
import type { ClanArticle } from '@types';

interface FeaturedQuoteProps {
  article: ClanArticle;
}

export function FeaturedQuote({ article }: FeaturedQuoteProps) {
  const excerpt =
    article.content.length > CHARTER_FEATURED_EXCERPT_LENGTH
      ? `${article.content.slice(0, CHARTER_FEATURED_EXCERPT_LENGTH)}...`
      : article.content;

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-6 text-center">
        <Star className="mx-auto mb-3 h-5 w-5 text-amber-500" />
        <blockquote className="text-base leading-relaxed text-amber-900 italic">
          &ldquo;{excerpt}&rdquo;
        </blockquote>
        <p className="mt-3 text-sm font-medium text-amber-700">
          — {article.title}
        </p>
      </CardContent>
    </Card>
  );
}
