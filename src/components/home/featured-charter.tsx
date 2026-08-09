/**
 * @project AncestorTree
 * @file src/components/home/featured-charter.tsx
 * @description Featured clan charter articles for homepage
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@components/ui';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useFeaturedArticles } from '@hooks';

export function FeaturedCharter() {
  const t = useTranslations('Charter');
  const { data: articles, isLoading } = useFeaturedArticles();

  if (isLoading || !articles || articles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('featuredTitle')}
            </CardTitle>
            <CardDescription>{t('featuredSubtitle')}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/charter">
              {t('viewAll')}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.slice(0, 3).map((article) => (
            <div key={article.id} className="border-l-2 border-emerald-500 pl-4">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-sm font-medium">{article.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {article.category === 'gia_huan' ||
                  article.category === 'quy_uoc' ||
                  article.category === 'loi_dan'
                    ? t(`categories.${article.category}`)
                    : article.category}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {article.content}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
