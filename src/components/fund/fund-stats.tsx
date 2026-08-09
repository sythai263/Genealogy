/**
 * @project AncestorTree
 * @file src/components/fund/fund-stats.tsx
 * @description Balance summary cards for education fund
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  GraduationCap,
  Wallet,
} from 'lucide-react';
import { Card, CardContent } from '@components/ui';
import { formatVND } from '@lib';
import type { FundBalance } from '@types';

interface FundStatsProps {
  balance?: FundBalance;
  scholarshipCount: number;
}

export function FundStats({ balance, scholarshipCount }: FundStatsProps) {
  const t = useTranslations('Fund');

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Wallet className="mx-auto mb-1 h-6 w-6 text-emerald-600" />
          <p className="text-lg font-bold text-emerald-600">
            {formatVND(balance?.balance || 0)}
          </p>
          <p className="text-xs text-muted-foreground">{t('stats.balance')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <ArrowDownCircle className="mx-auto mb-1 h-6 w-6 text-blue-600" />
          <p className="text-lg font-bold text-blue-600">
            {formatVND(balance?.income || 0)}
          </p>
          <p className="text-xs text-muted-foreground">{t('stats.income')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <ArrowUpCircle className="mx-auto mb-1 h-6 w-6 text-red-600" />
          <p className="text-lg font-bold text-red-600">
            {formatVND(balance?.expense || 0)}
          </p>
          <p className="text-xs text-muted-foreground">{t('stats.expense')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <GraduationCap className="mx-auto mb-1 h-6 w-6 text-purple-600" />
          <p className="text-lg font-bold text-purple-600">{scholarshipCount}</p>
          <p className="text-xs text-muted-foreground">
            {t('stats.scholarshipCount')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
