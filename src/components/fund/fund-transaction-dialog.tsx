/**
 * @project AncestorTree
 * @file src/components/fund/fund-transaction-dialog.tsx
 * @description "Add fund transaction" dialog — owns its own form state and
 *              create mutation; renders trigger button + dialog
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { useCreateFundTransaction } from '@hooks';
import type { CreateFundTransactionInput, FundCategory } from '@types';

const FUND_CATEGORY_ORDER: FundCategory[] = [
  'dong_gop',
  'hoc_bong',
  'khen_thuong',
  'other',
];

interface FundTransactionDialogProps {
  createdBy?: string;
}

export function FundTransactionDialog({
  createdBy,
}: FundTransactionDialogProps) {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const tCommon = useTranslations('Common');
  const createTx = useCreateFundTransaction();

  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState<FundCategory>('dong_gop');
  const [txAmount, setTxAmount] = useState('');
  const [txDonorName, setTxDonorName] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  const resetForm = () => {
    setTxType('income');
    setTxCategory('dong_gop');
    setTxAmount('');
    setTxDonorName('');
    setTxDescription('');
    setTxDate(new Date().toISOString().slice(0, 10));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTxAmount = parseInt(txAmount);
    if (!txAmount || isNaN(parsedTxAmount) || parsedTxAmount <= 0) {
      toast.error(tFund('toasts.amountInvalid'));
      return;
    }
    try {
      const input: CreateFundTransactionInput = {
        type: txType,
        category: txCategory,
        amount: parsedTxAmount,
        donor_name: txDonorName || undefined,
        description: txDescription || undefined,
        transaction_date: txDate,
        created_by: createdBy,
      };
      await createTx.mutateAsync(input);
      toast.success(tFund('toasts.txSuccess'));
      setOpen(false);
      resetForm();
    } catch {
      toast.error(tFund('toasts.txError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t('features.fund.addTx')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('features.fund.addTx')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{tFund('form.type')}</Label>
              <Select
                value={txType}
                onValueChange={(v) => setTxType(v as 'income' | 'expense')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{tFund('income')}</SelectItem>
                  <SelectItem value="expense">{tFund('expense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tFund('form.category')}</Label>
              <Select
                value={txCategory}
                onValueChange={(v) => setTxCategory(v as FundCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUND_CATEGORY_ORDER.map((category) => (
                    <SelectItem key={category} value={category}>
                      {tFund(`form.categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{tFund('form.amountRequired')}</Label>
            <Input
              type="number"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              placeholder="1000000"
            />
          </div>
          <div>
            <Label>{tFund('form.donor')}</Label>
            <Input
              value={txDonorName}
              onChange={(e) => setTxDonorName(e.target.value)}
              placeholder={t('features.fund.placeholderPerson')}
            />
          </div>
          <div>
            <Label>{tFund('form.date')}</Label>
            <Input
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
            />
          </div>
          <div>
            <Label>{tFund('form.note')}</Label>
            <Textarea
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={createTx.isPending} className="w-full">
            {createTx.isPending
              ? tCommon('saving')
              : t('features.fund.addTx')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
