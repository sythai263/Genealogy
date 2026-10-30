/**
 * @project AncestorTree
 * @file src/components/cau-duong/cau-duong-view.tsx
 * @description Public Lịch Cầu đương — orchestrates pools/year state;
 *              schedule and members tabs live in sibling components
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Calendar,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import {
  CAU_DUONG_YEAR_OPTIONS,
  getCauDuongCurrentYear,
} from '@constants';
import {
  useCauDuongAssignments,
  useCauDuongPools,
  useEligibleMembers,
} from '@hooks';
import { CauDuongMembersTab } from './cau-duong-members-tab';
import { CauDuongScheduleTab } from './cau-duong-schedule-tab';

export function CauDuongView() {
  const t = useTranslations('CauDuong');
  const currentYear = getCauDuongCurrentYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: pools, isLoading: poolsLoading } = useCauDuongPools();
  const firstPool = pools?.[0];
  const poolId = firstPool?.id;

  const { data: assignments, isLoading: assignmentsLoading } =
    useCauDuongAssignments(poolId, selectedYear);
  const { data: eligibleMembers, isLoading: eligibleLoading } =
    useEligibleMembers(poolId, currentYear);

  if (poolsLoading) {
    return (
      <div className='container mx-auto p-6 max-w-5xl'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-muted rounded w-64' />
          <div className='h-48 bg-muted rounded' />
        </div>
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <div className='container mx-auto p-6 max-w-5xl'>
        <Card>
          <CardContent className='py-16 text-center text-muted-foreground'>
            <RotateCcw className='h-12 w-12 mx-auto mb-4 opacity-30' />
            <p className='text-lg font-medium mb-2'>{t('emptySetup')}</p>
            <p className='text-sm'>{t('emptySetupHint')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 max-w-5xl space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center gap-4 justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <RotateCcw className='h-6 w-6 text-primary' />
            {t('scheduleTitle')}
          </h1>
          <p className='text-muted-foreground text-sm mt-1'>
            {t('scheduleSubtitle')}
          </p>
        </div>
        <Select
          value={selectedYear.toString()}
          onValueChange={v => setSelectedYear(Number(v))}>
          <SelectTrigger className='w-36'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAU_DUONG_YEAR_OPTIONS.map(y => (
              <SelectItem key={y} value={y.toString()}>
                {t('yearLabel', { year: y })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {firstPool && (
        <Card className='border-primary/20 bg-primary/5'>
          <CardContent className='py-3 px-4 flex flex-col sm:flex-row sm:items-center gap-2 text-sm'>
            <span className='font-medium'>{firstPool.name}</span>
            <span className='text-muted-foreground hidden sm:inline'>•</span>
            <span className='text-muted-foreground'>
              {t('poolCriteria', {
                min: firstPool.min_generation,
                max: firstPool.max_age_lunar,
              })}
            </span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='schedule'>
        <TabsList>
          <TabsTrigger value='schedule' className='flex items-center gap-1.5'>
            <Calendar className='h-4 w-4' />
            {t('tabs.schedule')}
          </TabsTrigger>
          <TabsTrigger value='members' className='flex items-center gap-1.5'>
            <Users className='h-4 w-4' />
            {t('tabs.members', {
              count: eligibleMembers?.length ?? '...',
            })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='schedule' className='mt-4 space-y-4'>
          <CauDuongScheduleTab
            assignments={assignments}
            isLoading={assignmentsLoading}
          />
        </TabsContent>

        <TabsContent value='members' className='mt-4'>
          <CauDuongMembersTab
            eligibleMembers={eligibleMembers}
            isLoading={eligibleLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
