/**
 * @project AncestorTree
 * @file src/components/cau-duong/cau-duong-view.tsx
 * @description Public Lịch Cầu đương — schedule and eligible members
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Users,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  CAU_DUONG_CEREMONY_ORDER,
  CAU_DUONG_STATUS_VARIANTS,
  CAU_DUONG_YEAR_OPTIONS,
  getCauDuongCurrentYear,
} from '@constants';
import {
  useCauDuongAssignments,
  useCauDuongPools,
  useEligibleMembers,
} from '@hooks';
import type { CauDuongCeremonyType, CauDuongStatus } from '@types';

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

  function ceremonyLabel(ceremonyType: CauDuongCeremonyType) {
    return t(`ceremonies.${ceremonyType}`);
  }

  function statusLabel(status: CauDuongStatus) {
    return t(`statuses.${status}`);
  }

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
          {assignmentsLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='animate-pulse h-20 bg-muted rounded-lg' />
              ))}
            </div>
          ) : (
            <>
              {CAU_DUONG_CEREMONY_ORDER.map(ceremonyType => {
                const assignment = assignments?.find(
                  a => a.ceremony_type === ceremonyType
                );
                return (
                  <Card
                    key={ceremonyType}
                    className={assignment ? '' : 'border-dashed opacity-60'}>
                    <CardContent className='py-4 px-5'>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                        <div className='flex items-start gap-3'>
                          <div className='mt-0.5'>
                            {assignment?.status === 'completed' ? (
                              <CheckCircle2 className='h-5 w-5 text-green-500' />
                            ) : assignment ? (
                              <Clock className='h-5 w-5 text-orange-400' />
                            ) : (
                              <AlertCircle className='h-5 w-5 text-muted-foreground' />
                            )}
                          </div>
                          <div>
                            <p className='font-semibold'>
                              {ceremonyLabel(ceremonyType)}
                            </p>
                            {assignment ? (
                              <div className='mt-1 text-sm text-muted-foreground space-y-0.5'>
                                <p>
                                  <span className='font-medium text-foreground'>
                                    {assignment.host_person?.display_name ?? '—'}
                                  </span>
                                  {assignment.actual_host_person &&
                                    assignment.actual_host_person.id !==
                                      assignment.host_person?.id && (
                                      <span className='ml-2 text-xs'>
                                        {t('delegatedInline', {
                                          name: assignment.actual_host_person
                                            .display_name,
                                        })}
                                      </span>
                                    )}
                                </p>
                                {assignment.reason && (
                                  <p className='text-xs italic'>
                                    {assignment.reason}
                                  </p>
                                )}
                                {assignment.scheduled_date && (
                                  <p className='text-xs'>
                                    {t('scheduledDate', {
                                      date: new Date(
                                        assignment.scheduled_date
                                      ).toLocaleDateString('vi-VN'),
                                    })}
                                  </p>
                                )}
                                {assignment.actual_date &&
                                  assignment.actual_date !==
                                    assignment.scheduled_date && (
                                    <p className='text-xs text-orange-600'>
                                      {t('actualDate', {
                                        date: new Date(
                                          assignment.actual_date
                                        ).toLocaleDateString('vi-VN'),
                                      })}
                                    </p>
                                  )}
                                {assignment.notes && (
                                  <p className='text-xs text-muted-foreground'>
                                    {assignment.notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className='text-sm text-muted-foreground mt-1'>
                                {t('unassigned')}
                              </p>
                            )}
                          </div>
                        </div>

                        {assignment && (
                          <Badge
                            variant={
                              CAU_DUONG_STATUS_VARIANTS[assignment.status]
                            }
                            className='self-start sm:self-center'>
                            {statusLabel(assignment.status)}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>

        <TabsContent value='members' className='mt-4'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>{t('rotationTitle')}</CardTitle>
              <CardDescription>{t('rotationDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleLoading ? (
                <div className='space-y-2'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className='animate-pulse h-10 bg-muted rounded' />
                  ))}
                </div>
              ) : !eligibleMembers || eligibleMembers.length === 0 ? (
                <p className='text-center text-muted-foreground py-8'>
                  {t('noEligible')}
                </p>
              ) : (
                <div className='space-y-2'>
                  {eligibleMembers.map((member, idx) => (
                    <div
                      key={member.person.id}
                      className='flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors'>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-mono text-muted-foreground w-7 text-right'>
                          {idx + 1}.
                        </span>
                        <div>
                          <p className='font-medium'>
                            {member.person.display_name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {t('generationLabel', {
                              generation: member.person.generation,
                            })}
                            {member.person.chi
                              ? ` • ${t('chiLabel', { chi: member.person.chi })}`
                              : ''}
                            {member.person.hometown
                              ? ` • ${member.person.hometown}`
                              : ''}
                          </p>
                        </div>
                      </div>
                      <div className='text-right text-xs text-muted-foreground'>
                        {member.ageLunar > 0 && (
                          <span>
                            {t('ageLunar', { age: member.ageLunar })}
                          </span>
                        )}
                        {member.person.birth_year && (
                          <p className='text-muted-foreground/60'>
                            {t('born', { year: member.person.birth_year })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
