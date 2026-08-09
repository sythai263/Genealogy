/**
 * @project AncestorTree
 * @file src/components/fund/fund-view.tsx
 * @description Education fund dashboard - Quỹ khuyến học
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PageSkeleton } from '@components/shared';
import {
  Button,
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
import { getAllFundTransactions, getAllScholarships, getPeopleByIds } from '@lib';
import type { Person } from '@types';
import { exportFundReport } from './export-fund-report';
import { FundDonationsTab } from './fund-donations-tab';
import { FundHistoryTab } from './fund-history-tab';
import { FundScholarshipsTab } from './fund-scholarships-tab';
import { FundStats } from './fund-stats';

export function FundView() {
  const [activeTab, setActiveTab] = useState('scholarships');
  const [isExporting, setIsExporting] = useState(false);
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);

  const [schPage, setSchPage] = useResettablePage(String(pageSize));
  const [rewardPage, setRewardPage] = useResettablePage(String(pageSize));
  const [donationPage, setDonationPage] = useResettablePage(String(pageSize));
  const [historyPage, setHistoryPage] = useResettablePage(String(pageSize));

  const { data: balance, isLoading: balanceLoading } = useFundBalance();

  // Paginated per-tab queries — never load the full tables for display.
  const { data: scholarshipsPage, isLoading: schLoading } = useScholarships({
    type: 'hoc_bong',
    page: schPage,
    pageSize,
  });
  const { data: rewardsPage, isLoading: rewardLoading } = useScholarships({
    type: 'khen_thuong',
    page: rewardPage,
    pageSize,
  });
  const { data: donationsPage, isLoading: donationLoading } = useFundTransactions({
    type: 'income',
    page: donationPage,
    pageSize,
  });
  const { data: historyPageData, isLoading: historyLoading } = useFundTransactions({
    page: historyPage,
    pageSize,
  });

  const hocBong = useMemo(
    () => scholarshipsPage?.items ?? [],
    [scholarshipsPage]
  );
  const khenThuong = useMemo(() => rewardsPage?.items ?? [], [rewardsPage]);
  const donations = useMemo(() => donationsPage?.items ?? [], [donationsPage]);
  const history = useMemo(
    () => historyPageData?.items ?? [],
    [historyPageData]
  );
  const scholarshipCount =
    (scholarshipsPage?.total ?? 0) + (rewardsPage?.total ?? 0);

  const personIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of [...hocBong, ...khenThuong]) ids.add(s.person_id);
    for (const t of [...donations, ...history]) {
      if (t.donor_person_id) ids.add(t.donor_person_id);
    }
    return [...ids];
  }, [hocBong, khenThuong, donations, history]);
  const { data: people } = usePeopleByIds(personIds);

  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const person of people || []) {
      map.set(person.id, person);
    }
    return map;
  }, [people]);

  const isLoading =
    balanceLoading || schLoading || rewardLoading || donationLoading || historyLoading;

  async function handleExport() {
    setIsExporting(true);
    try {
      const [allTransactions, allScholarships] = await Promise.all([
        getAllFundTransactions(),
        getAllScholarships(),
      ]);
      const exportPersonIds = [
        ...new Set([
          ...allScholarships.map((s) => s.person_id),
          ...allTransactions
            .map((t) => t.donor_person_id)
            .filter((id): id is string => Boolean(id)),
        ]),
      ];
      const exportPeople = await getPeopleByIds(exportPersonIds);
      const exportPeopleMap = new Map(exportPeople.map((p) => [p.id, p]));
      exportFundReport(balance, allTransactions, allScholarships, exportPeopleMap);
    } catch {
      toast.error('Lỗi khi xuất báo cáo');
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <BookOpen className="h-6 w-6" />
            Quỹ Khuyến học
          </h1>
          <p className="text-muted-foreground">
            Quản lý quỹ khuyến học, học bổng và khen thưởng
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Đang xuất...' : 'Xuất CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            In báo cáo
          </Button>
        </div>
      </div>

      <FundStats balance={balance} scholarshipCount={scholarshipCount} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scholarships">Học bổng & Khen thưởng</TabsTrigger>
          <TabsTrigger value="donations">Đóng góp</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="scholarships">
          <FundScholarshipsTab
            scholarships={hocBong}
            scholarshipsTotal={scholarshipsPage?.total ?? 0}
            scholarshipsPage={schPage}
            scholarshipsPageSize={pageSize}
            onScholarshipsPageChange={setSchPage}
            onScholarshipsPageSizeChange={setPageSize}
            rewards={khenThuong}
            rewardsTotal={rewardsPage?.total ?? 0}
            rewardsPage={rewardPage}
            rewardsPageSize={pageSize}
            onRewardsPageChange={setRewardPage}
            onRewardsPageSizeChange={setPageSize}
            peopleMap={peopleMap}
          />
        </TabsContent>

        <TabsContent value="donations">
          <FundDonationsTab
            donations={donations}
            total={donationsPage?.total ?? 0}
            page={donationPage}
            pageSize={pageSize}
            onPageChange={setDonationPage}
            onPageSizeChange={setPageSize}
            peopleMap={peopleMap}
          />
        </TabsContent>

        <TabsContent value="history">
          <FundHistoryTab
            transactions={history}
            total={historyPageData?.total ?? 0}
            page={historyPage}
            pageSize={pageSize}
            onPageChange={setHistoryPage}
            onPageSizeChange={setPageSize}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
