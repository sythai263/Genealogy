/**
 * @project AncestorTree
 * @file src/components/cau-duong/cau-duong-schedule-tab.tsx
 * @description Public Cầu đương schedule tab — one card per ceremony type
 *              showing host, delegation, dates, notes and status badge
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge, Card, CardContent } from '@components/ui';
import {
  CAU_DUONG_CEREMONY_ORDER,
  CAU_DUONG_STATUS_VARIANTS,
} from '@constants';
import type {
  CauDuongAssignmentWithPeople,
  CauDuongCeremonyType,
  CauDuongStatus,
} from '@types';

interface CauDuongScheduleTabProps {
  assignments: CauDuongAssignmentWithPeople[] | undefined;
  isLoading: boolean;
}

export function CauDuongScheduleTab({
  assignments,
  isLoading,
}: CauDuongScheduleTabProps) {
  const t = useTranslations('CauDuong');

  function ceremonyLabel(ceremonyType: CauDuongCeremonyType) {
    return t(`ceremonies.${ceremonyType}`);
  }

  function statusLabel(status: CauDuongStatus) {
    return t(`statuses.${status}`);
  }

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className='animate-pulse h-20 bg-muted rounded-lg' />
        ))}
      </div>
    );
  }

  return (
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
  );
}
