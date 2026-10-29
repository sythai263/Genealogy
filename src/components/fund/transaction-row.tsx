/**
 * @project AncestorTree
 * @file src/components/fund/transaction-row.tsx
 * @description One fund transaction row — description, date, signed amount,
 *              and delete confirm dialog (owns its mutation + toasts)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import { useDeleteFundTransaction } from '@hooks';
import { formatVND } from '@lib';
import type { FundTransaction } from '@types';

interface TransactionRowProps {
  transaction: FundTransaction;
}

export function TransactionRow({ transaction: tx }: TransactionRowProps) {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const deleteTx = useDeleteFundTransaction();

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">
            {tx.donor_name ||
              tx.description ||
              (tx.type === 'income' ? tFund('income') : tFund('expense'))}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(tx.transaction_date).toLocaleDateString(locale)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {tx.type === 'income' ? '+' : '-'}
            {formatVND(tx.amount)}
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('features.fund.deleteTxTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('features.fund.deleteConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteTx
                      .mutateAsync(tx.id)
                      .then(() =>
                        toast.success(tFund('toasts.deleteSuccess'))
                      )
                      .catch(() => toast.error(tFund('toasts.deleteError')))
                  }
                >
                  {tCommon('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
