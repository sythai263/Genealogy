/**
 * @project AncestorTree
 * @file src/components/fund/admin-fund-view.tsx
 * @description Admin fund & scholarship management view
 * @version 1.0.0
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
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
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
  Person,
  ScholarshipStatus,
} from '@types';
import { CheckCircle, Plus, Trash2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ScholarshipStatusBadge } from './scholarship-status-badge';

export function AdminFundView() {
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

  // Transaction form state
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txCategory, setTxCategory] = useState('dong_gop');
  const [txAmount, setTxAmount] = useState('');
  const [txDonorName, setTxDonorName] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  // Scholarship form state
  const [schPerson, setSchPerson] = useState<Person | null>(null);
  const [schType, setSchType] = useState<'hoc_bong' | 'khen_thuong'>('hoc_bong');
  const [schAmount, setSchAmount] = useState('');
  const [schReason, setSchReason] = useState('');
  const [schYear, setSchYear] = useState('2025-2026');
  const [schSchool, setSchSchool] = useState('');
  const [schGrade, setSchGrade] = useState('');

  if (!isEditor) {
    return <AccessDenied />;
  }

  const resetTxForm = () => {
    setTxType('income'); setTxCategory('dong_gop'); setTxAmount(''); setTxDonorName(''); setTxDescription(''); setTxDate(new Date().toISOString().slice(0, 10));
  };

  const resetSchForm = () => {
    setSchPerson(null); setSchType('hoc_bong'); setSchAmount(''); setSchReason(''); setSchYear('2025-2026'); setSchSchool(''); setSchGrade('');
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTxAmount = parseInt(txAmount);
    if (!txAmount || isNaN(parsedTxAmount) || parsedTxAmount <= 0) { toast.error('Số tiền phải lớn hơn 0'); return; }
    try {
      const input: CreateFundTransactionInput = {
        type: txType,
        category: txCategory as CreateFundTransactionInput['category'],
        amount: parsedTxAmount,
        donor_name: txDonorName || undefined,
        description: txDescription || undefined,
        transaction_date: txDate,
        created_by: profile?.id,
      };
      await createTx.mutateAsync(input);
      toast.success('Đã thêm giao dịch');
      setTxDialogOpen(false);
      resetTxForm();
    } catch {
      toast.error('Lỗi khi thêm giao dịch');
    }
  };

  const handleCreateSch = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSchAmount = parseInt(schAmount);
    if (!schPerson || !schAmount || isNaN(parsedSchAmount) || parsedSchAmount <= 0) { toast.error('Vui lòng điền đủ thông tin (số tiền > 0)'); return; }
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
      toast.success('Đã thêm đề cử');
      setSchDialogOpen(false);
      resetSchForm();
    } catch {
      toast.error('Lỗi khi thêm đề cử');
    }
  };

  const handleApprove = async (id: string, status: ScholarshipStatus) => {
    try {
      await updateSchStatus.mutateAsync({ id, status, approvedBy: profile?.id });
      toast.success(status === 'approved' ? 'Đã duyệt' : 'Đã cấp phát');
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý Quỹ & Học bổng</h1>
        <p className="text-muted-foreground">
          Số dư: <span className="font-semibold text-emerald-600">{formatVND(balance?.balance || 0)}</span>
        </p>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Giao dịch</TabsTrigger>
          <TabsTrigger value="scholarships">Học bổng</TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Thêm giao dịch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Thêm giao dịch</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateTx} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <Select value={txType} onValueChange={v => setTxType(v as 'income' | 'expense')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Thu</SelectItem>
                        <SelectItem value="expense">Chi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Danh mục</Label>
                    <Select value={txCategory} onValueChange={setTxCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dong_gop">Đóng góp</SelectItem>
                        <SelectItem value="hoc_bong">Học bổng</SelectItem>
                        <SelectItem value="khen_thuong">Khen thưởng</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Số tiền (VNĐ) *</Label>
                  <Input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="1000000" />
                </div>
                <div>
                  <Label>Người đóng góp</Label>
                  <Input value={txDonorName} onChange={e => setTxDonorName(e.target.value)} placeholder="Ông Đặng Văn A" />
                </div>
                <div>
                  <Label>Ngày</Label>
                  <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
                </div>
                <div>
                  <Label>Ghi chú</Label>
                  <Textarea value={txDescription} onChange={e => setTxDescription(e.target.value)} rows={2} />
                </div>
                <Button type="submit" disabled={createTx.isPending} className="w-full">
                  {createTx.isPending ? 'Đang lưu...' : 'Thêm giao dịch'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {transactions.map(tx => (
              <Card key={tx.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {tx.donor_name || tx.description || (tx.type === 'income' ? 'Thu' : 'Chi')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.transaction_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatVND(tx.amount)}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa giao dịch?</AlertDialogTitle>
                          <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTx.mutateAsync(tx.id).then(() => toast.success('Đã xóa')).catch(() => toast.error('Lỗi'))}>Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
            {transactions.length === 0 && (
              <EmptyState icon={Wallet} title="Chưa có giao dịch nào" />
            )}
          </div>
          <ListPagination
            page={txPage}
            pageSize={txPageSize}
            total={transactionsPage?.total ?? 0}
            onPageChange={setTxPage}
            onPageSizeChange={setTxPageSize}
            itemLabel="giao dịch"
          />
        </TabsContent>

        {/* Scholarships */}
        <TabsContent value="scholarships" className="mt-4 space-y-4">
          <Dialog open={schDialogOpen} onOpenChange={setSchDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Đề cử học bổng / khen thưởng</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Đề cử học bổng / khen thưởng</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateSch} className="space-y-4">
                <div>
                  <PersonCombobox
                    label="Thành viên *"
                    selected={schPerson}
                    onSelect={setSchPerson}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <Select value={schType} onValueChange={v => setSchType(v as 'hoc_bong' | 'khen_thuong')}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoc_bong">Học bổng</SelectItem>
                        <SelectItem value="khen_thuong">Khen thưởng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Số tiền (VNĐ) *</Label>
                    <Input type="number" value={schAmount} onChange={e => setSchAmount(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Năm học</Label>
                    <Input value={schYear} onChange={e => setSchYear(e.target.value)} placeholder="2025-2026" />
                  </div>
                  <div>
                    <Label>Lớp / Cấp</Label>
                    <Input value={schGrade} onChange={e => setSchGrade(e.target.value)} placeholder="Lớp 10" />
                  </div>
                </div>
                <div>
                  <Label>Trường</Label>
                  <Input value={schSchool} onChange={e => setSchSchool(e.target.value)} placeholder="THPT Cầm Bá Thước" />
                </div>
                <div>
                  <Label>Lý do</Label>
                  <Textarea value={schReason} onChange={e => setSchReason(e.target.value)} rows={2} />
                </div>
                <Button type="submit" disabled={createSch.isPending} className="w-full">
                  {createSch.isPending ? 'Đang lưu...' : 'Đề cử'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <div className="space-y-2">
            {scholarships.map(s => {
              const person = peopleMap.get(s.person_id);
              return (
                <Card key={s.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{person?.display_name || '?'}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.type === 'hoc_bong' ? 'Học bổng' : 'Khen thưởng'} · {formatVND(s.amount)} · {s.academic_year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ScholarshipStatusBadge status={s.status} />
                      {s.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(s.id, 'approved')}>
                          <CheckCircle className="h-3 w-3 mr-1" />Duyệt
                        </Button>
                      )}
                      {s.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(s.id, 'paid')}>
                          <CheckCircle className="h-3 w-3 mr-1" />Cấp
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa đề cử?</AlertDialogTitle>
                            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSch.mutateAsync(s.id).then(() => toast.success('Đã xóa')).catch(() => toast.error('Lỗi'))}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {scholarships.length === 0 && (
              <EmptyState title="Chưa có đề cử nào" />
            )}
          </div>
          <ListPagination
            page={schPage}
            pageSize={schPageSize}
            total={scholarshipsPage?.total ?? 0}
            onPageChange={setSchPage}
            onPageSizeChange={setSchPageSize}
            itemLabel="đề cử"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
