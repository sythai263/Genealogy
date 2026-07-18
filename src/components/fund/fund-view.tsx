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
import {
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import {
  useFundBalance,
  useFundTransactions,
  usePeople,
  useScholarships,
} from '@hooks';
import type { Person } from '@types';
import { exportFundReport } from './export-fund-report';
import { FundDonationsTab } from './fund-donations-tab';
import { FundHistoryTab } from './fund-history-tab';
import { FundScholarshipsTab } from './fund-scholarships-tab';
import { FundStats } from './fund-stats';

export function FundView() {
  const [activeTab, setActiveTab] = useState('scholarships');

  const { data: balance, isLoading: balanceLoading } = useFundBalance();
  const { data: transactions, isLoading: txLoading } = useFundTransactions();
  const { data: scholarships, isLoading: schLoading } = useScholarships();
  const { data: people } = usePeople();

  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const person of people || []) {
      map.set(person.id, person);
    }
    return map;
  }, [people]);

  const hocBong = useMemo(
    () => (scholarships || []).filter((item) => item.type === 'hoc_bong'),
    [scholarships]
  );
  const khenThuong = useMemo(
    () => (scholarships || []).filter((item) => item.type === 'khen_thuong'),
    [scholarships]
  );
  const donations = useMemo(
    () => (transactions || []).filter((item) => item.type === 'income'),
    [transactions]
  );

  const isLoading = balanceLoading || txLoading || schLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
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
            onClick={() =>
              exportFundReport(
                balance,
                transactions || [],
                scholarships || [],
                peopleMap
              )
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            In báo cáo
          </Button>
        </div>
      </div>

      <FundStats
        balance={balance}
        scholarshipCount={(scholarships || []).length}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scholarships">Học bổng & Khen thưởng</TabsTrigger>
          <TabsTrigger value="donations">Đóng góp</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="scholarships">
          <FundScholarshipsTab
            scholarships={hocBong}
            rewards={khenThuong}
            peopleMap={peopleMap}
          />
        </TabsContent>

        <TabsContent value="donations">
          <FundDonationsTab donations={donations} peopleMap={peopleMap} />
        </TabsContent>

        <TabsContent value="history">
          <FundHistoryTab transactions={transactions || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
