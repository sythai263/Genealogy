/**
 * @project AncestorTree
 * @file src/components/fund/fund-history-tab.tsx
 * @description Full transaction history for education fund
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Card, CardContent } from '@components/ui';
import { ListPagination } from '@components/shared';
import type { ListPageSize } from '@constants';
import { formatVND } from '@lib';
import { cn } from '@lib';
import type { FundTransaction } from '@types';

interface FundHistoryTabProps {
  transactions: FundTransaction[];
  total: number;
  page: number;
  pageSize: ListPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: ListPageSize) => void;
}

export function FundHistoryTab({
  transactions,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: FundHistoryTabProps) {
  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-base font-semibold">
        Lịch sử giao dịch ({total})
      </h3>
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Chưa có giao dịch nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  {transaction.type === 'income' ? (
                    <ArrowDownCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.donor_name ||
                        transaction.description ||
                        (transaction.type === 'income' ? 'Thu' : 'Chi')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString('vi-VN')}
                      {transaction.academic_year &&
                        ` · ${transaction.academic_year}`}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    transaction.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatVND(transaction.amount)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ListPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        itemLabel="giao dịch"
      />
    </div>
  );
}
