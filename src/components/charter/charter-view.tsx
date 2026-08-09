/**
 * @project AncestorTree
 * @file src/components/charter/charter-view.tsx
 * @description Public Hương ước view with category tabs
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import {
  CHARTER_CATEGORY_LABELS,
  CHARTER_CATEGORY_ORDER,
  CHARTER_TAB_ICONS,
  isClanArticleCategory,
} from '@constants';
import { useClanArticles } from '@hooks';
import type { ClanArticleCategory } from '@types';
import { ArticleList } from './article-list';

export function CharterView() {
  const [activeTab, setActiveTab] = useState<ClanArticleCategory>('gia_huan');
  const { data, isLoading } = useClanArticles({ category: activeTab });
  const articles = data?.items;

  function handleTabChange(value: string) {
    if (isClanArticleCategory(value)) {
      setActiveTab(value);
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ScrollText className="h-6 w-6" />
          Hương ước Dòng họ
        </h1>
        <p className="text-muted-foreground">
          Gia huấn, quy ước và lời dặn dò từ tổ tiên
        </p>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          {CHARTER_CATEGORY_ORDER.map((category) => {
            const Icon = CHARTER_TAB_ICONS[category];
            return (
              <TabsTrigger key={category} value={category} className="flex-1">
                <Icon className="mr-1 h-4 w-4" />
                {CHARTER_CATEGORY_LABELS[category]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CHARTER_CATEGORY_ORDER.map((category) => {
          const Icon = CHARTER_TAB_ICONS[category];
          return (
            <TabsContent key={category} value={category} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {CHARTER_CATEGORY_LABELS[category]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArticleList articles={articles || []} />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
