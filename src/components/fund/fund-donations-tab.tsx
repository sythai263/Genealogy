/**
 * @project AncestorTree
 * @file src/components/fund/fund-donations-tab.tsx
 * @description Donations list for education fund
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent } from '@components/ui';
import { ListPagination } from '@components/shared';
import type { ListPageSize } from '@constants';
import { formatVND } from '@lib';
import type { FundTransaction, Person } from '@types';

interface FundDonationsTabProps {
  donations: FundTransaction[];
  total: number;
  page: number;
  pageSize: ListPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: ListPageSize) => void;
  peopleMap: Map<string, Person>;
}

export function FundDonationsTab({
  donations,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  peopleMap,
}: FundDonationsTabProps) {
  const t = useTranslations('Fund');
  const locale = useLocale();

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-base font-semibold">
        {t('donationsSection.title', { count: total })}
      </h3>
      {donations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t('donationsSection.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {donations.map((transaction) => {
            const person = transaction.donor_person_id
              ? peopleMap.get(transaction.donor_person_id)
              : undefined;
            return (
              <Card key={transaction.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.donor_name ||
                        person?.display_name ||
                        t('anonymous')}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">
                      +{formatVND(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString(locale)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <ListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel={t('donationsSection.itemLabel')}
      />
    </div>
  );
}
