/**
 * @project AncestorTree
 * @file src/components/fund/admin-fund-view.tsx
 * @description Admin fund & scholarship management view — orchestrates
 *              balance, tabs and paged lists; rows/dialogs live in sibling
 *              components
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Wallet } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  EmptyState,
  ListPagination,
} from '@components/shared';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import {
  useFundBalance,
  useFundTransactions,
  usePeopleByIds,
  useResettablePage,
  useScholarships,
} from '@hooks';
import { formatVND } from '@lib';
import type { Person } from '@types';
import { FundScholarshipDialog } from './fund-scholarship-dialog';
import { FundTransactionDialog } from './fund-transaction-dialog';
import { ScholarshipRow } from './scholarship-row';
import { TransactionRow } from './transaction-row';

export function AdminFundView() {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const { profile, isEditor } = useAuth();

  const [txPageSize, setTxPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [txPage, setTxPage] = useResettablePage(String(txPageSize));
  const [schPageSize, setSchPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [schPage, setSchPage] = useResettablePage(String(schPageSize));

  const { data: balance } = useFundBalance();
  const { data: transactionsPage } = useFundTransactions({ page: txPage, pageSize: txPageSize });
  const { data: scholarshipsPage } = useScholarships({ page: schPage, pageSize: schPageSize });

  const transactions = transactionsPage?.items ?? [];
  const scholarships = useMemo(
    () => scholarshipsPage?.items ?? [],
    [scholarshipsPage]
  );

  const personIds = useMemo(
    () => [...new Set(scholarships.map((s) => s.person_id).filter(Boolean))],
    [scholarships]
  );
  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const p of people || []) map.set(p.id, p);
    return map;
  }, [people]);

  if (!isEditor) {
    return <AccessDenied />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('features.fund.title')}</h1>
        <p className="text-muted-foreground">
          {t('features.fund.balance', {
            amount: formatVND(balance?.balance || 0),
          })}
        </p>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">{tFund('transactions')}</TabsTrigger>
          <TabsTrigger value="scholarships">{tFund('scholarships')}</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          <FundTransactionDialog createdBy={profile?.id} />

          <div className="space-y-2">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
            {transactions.length === 0 && (
              <EmptyState icon={Wallet} title={t('features.fund.emptyTx')} />
            )}
          </div>
          <ListPagination
            page={txPage}
            pageSize={txPageSize}
            total={transactionsPage?.total ?? 0}
            onPageChange={setTxPage}
            onPageSizeChange={setTxPageSize}
            itemLabel={t('features.fund.txCount')}
          />
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4 space-y-4">
          <FundScholarshipDialog />

          <div className="space-y-2">
            {scholarships.map((s) => (
              <ScholarshipRow
                key={s.id}
                scholarship={s}
                person={peopleMap.get(s.person_id)}
              />
            ))}
            {scholarships.length === 0 && (
              <EmptyState title={t('features.fund.emptySch')} />
            )}
          </div>
          <ListPagination
            page={schPage}
            pageSize={schPageSize}
            total={scholarshipsPage?.total ?? 0}
            onPageChange={setSchPage}
            onPageSizeChange={setSchPageSize}
            itemLabel={t('features.fund.schCount')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
