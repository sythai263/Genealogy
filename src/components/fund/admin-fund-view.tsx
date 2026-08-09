/**
 * @project AncestorTree
 * @file src/components/fund/admin-fund-view.tsx
 * @description Admin fund & scholarship management view
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useAuth } from '@components/auth';
import { PersonCombobox } from '@components/people';
import {
  AccessDenied,
  EmptyState,
  ListPagination,
} from '@components/shared';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@components/ui';
import {
  FUND_SCHOLARSHIP_TYPE_ORDER,
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useCreateFundTransaction,
  useCreateScholarship,
  useDeleteFundTransaction,
  useDeleteScholarship,
  useFundBalance,
  useFundTransactions,
  usePeopleByIds,
  useResettablePage,
  useScholarships,
  useUpdateScholarshipStatus,
} from '@hooks';
import { formatVND } from '@lib';
import type {
  CreateFundTransactionInput,
  CreateScholarshipInput,
  FundCategory,
  Person,
  ScholarshipStatus,
  ScholarshipType,
} from '@types';
import { CheckCircle, Plus, Trash2, Wallet } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ScholarshipStatusBadge } from './scholarship-status-badge';

const FUND_CATEGORY_ORDER: FundCategory[] = [
  'dong_gop',
  'hoc_bong',
  'khen_thuong',
  'other',
];

export function AdminFundView() {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const { profile, isEditor } = useAuth();
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [schDialogOpen, setSchDialogOpen] = useState(false);

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

  const createTx = useCreateFundTransaction();
  const deleteTx = useDeleteFundTransaction();
  const createSch = useCreateScholarship();
  const updateSchStatus = useUpdateScholarshipStatus();
  const deleteSch = useDeleteScholarship();

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

  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState<FundCategory>('dong_gop');
  const [txAmount, setTxAmount] = useState('');
  const [txDonorName, setTxDonorName] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  const [schPerson, setSchPerson] = useState<Person | null>(null);
  const [schType, setSchType] = useState<ScholarshipType>('hoc_bong');
  const [schAmount, setSchAmount] = useState('');
  const [schReason, setSchReason] = useState('');
  const [schYear, setSchYear] = useState('2025-2026');
  const [schSchool, setSchSchool] = useState('');
  const [schGrade, setSchGrade] = useState('');

  if (!isEditor) {
    return <AccessDenied />;
  }

  const resetTxForm = () => {
    setTxType('income');
    setTxCategory('dong_gop');
    setTxAmount('');
    setTxDonorName('');
    setTxDescription('');
    setTxDate(new Date().toISOString().slice(0, 10));
  };

  const resetSchForm = () => {
    setSchPerson(null);
    setSchType('hoc_bong');
    setSchAmount('');
    setSchReason('');
    setSchYear('2025-2026');
    setSchSchool('');
    setSchGrade('');
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale);

  const scholarshipTypeLabel = (type: ScholarshipType) =>
    tFund(`scholarshipTypes.${type}`);

  const handleCreateTx = async (e: React.FormEvent) => {
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
        created_by: profile?.id,
      };
      await createTx.mutateAsync(input);
      toast.success(tFund('toasts.txSuccess'));
      setTxDialogOpen(false);
      resetTxForm();
    } catch {
      toast.error(tFund('toasts.txError'));
    }
  };

  const handleCreateSch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSchAmount = parseInt(schAmount);
    if (!schPerson || !schAmount || isNaN(parsedSchAmount) || parsedSchAmount <= 0) {
      toast.error(tFund('toasts.fieldsRequired'));
      return;
    }
    try {
      const input: CreateScholarshipInput = {
        person_id: schPerson.id,
        type: schType,
        amount: parsedSchAmount,
        reason: schReason || undefined,
        academic_year: schYear,
        school: schSchool || undefined,
        grade_level: schGrade || undefined,
        status: 'pending',
      };
      await createSch.mutateAsync(input);
      toast.success(tFund('toasts.schSuccess'));
      setSchDialogOpen(false);
      resetSchForm();
    } catch {
      toast.error(tFund('toasts.schError'));
    }
  };

  const handleApprove = async (id: string, status: ScholarshipStatus) => {
    try {
      await updateSchStatus.mutateAsync({ id, status, approvedBy: profile?.id });
      toast.success(
        status === 'approved'
          ? t('features.fund.approved')
          : t('features.fund.paid')
      );
    } catch {
      toast.error(tFund('toasts.updateError'));
    }
  };

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
          <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
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
              <form onSubmit={handleCreateTx} className="space-y-4">
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

          <div className="space-y-2">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {tx.donor_name ||
                        tx.description ||
                        (tx.type === 'income' ? tFund('income') : tFund('expense'))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(tx.transaction_date)}
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
                                .then(() => toast.success(tFund('toasts.deleteSuccess')))
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
          <Dialog open={schDialogOpen} onOpenChange={setSchDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('features.fund.nominateTitle')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('features.fund.nominateTitle')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSch} className="space-y-4">
                <div>
                  <PersonCombobox
                    label={t('features.fund.personRequired')}
                    selected={schPerson}
                    onSelect={setSchPerson}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{tFund('form.type')}</Label>
                    <Select
                      value={schType}
                      onValueChange={(v) => setSchType(v as ScholarshipType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FUND_SCHOLARSHIP_TYPE_ORDER.map((type) => (
                          <SelectItem key={type} value={type}>
                            {scholarshipTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{tFund('form.amountRequired')}</Label>
                    <Input
                      type="number"
                      value={schAmount}
                      onChange={(e) => setSchAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{tFund('form.year')}</Label>
                    <Input
                      value={schYear}
                      onChange={(e) => setSchYear(e.target.value)}
                      placeholder="2025-2026"
                    />
                  </div>
                  <div>
                    <Label>{tFund('form.gradeLevel')}</Label>
                    <Input
                      value={schGrade}
                      onChange={(e) => setSchGrade(e.target.value)}
                      placeholder={t('features.fund.placeholderClass')}
                    />
                  </div>
                </div>
                <div>
                  <Label>{tFund('form.school')}</Label>
                  <Input
                    value={schSchool}
                    onChange={(e) => setSchSchool(e.target.value)}
                    placeholder={t('features.fund.placeholderSchool')}
                  />
                </div>
                <div>
                  <Label>{tFund('form.reason')}</Label>
                  <Textarea
                    value={schReason}
                    onChange={(e) => setSchReason(e.target.value)}
                    rows={2}
                  />
                </div>
                <Button type="submit" disabled={createSch.isPending} className="w-full">
                  {createSch.isPending
                    ? tCommon('saving')
                    : t('features.fund.nominate')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {scholarships.map((s) => {
              const person = peopleMap.get(s.person_id);
              return (
                <Card key={s.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {person?.display_name || tCommon('unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scholarshipTypeLabel(s.type)} · {formatVND(s.amount)} ·{' '}
                        {s.academic_year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScholarshipStatusBadge status={s.status} />
                      {s.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(s.id, 'approved')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('features.fund.approve')}
                        </Button>
                      )}
                      {s.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(s.id, 'paid')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('features.fund.disburse')}
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('features.fund.deleteSchTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('features.fund.deleteConfirmDescription')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteSch
                                  .mutateAsync(s.id)
                                  .then(() => toast.success(tFund('toasts.deleteSuccess')))
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
            })}
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
