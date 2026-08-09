/**
 * @project AncestorTree
 * @file src/components/cau-duong/assignment-list.tsx
 * @description Danh sách phân công lễ Cầu đương theo năm
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { CAU_DUONG_CEREMONY_ORDER } from '@constants';
import type {
  CauDuongAssignmentWithPeople,
  CauDuongCeremonyType,
  CauDuongEligibleMember,
  CauDuongStatus,
} from '@types';
import { AssignDialog } from './assign-dialog';
import { DelegateDialog } from './delegate-dialog';
import { EditAssignmentDialog } from './edit-assignment-dialog';
import { RescheduleDialog } from './reschedule-dialog';

interface AssignmentListProps {
  selectedYear: number;
  assignments: CauDuongAssignmentWithPeople[] | undefined;
  isLoading: boolean;
  eligibleMembers: CauDuongEligibleMember[] | undefined;
  nextHostPersonId?: string;
  isAssignPending: boolean;
  isUpdatePending: boolean;
  onAssign: (ceremonyType: CauDuongCeremonyType, personId: string) => void;
  onEdit: (assignmentId: string, hostPersonId: string) => void;
  onDelegate: (
    assignmentId: string,
    actualHostId: string,
    reason: string
  ) => void;
  onReschedule: (assignmentId: string, date: string, reason: string) => void;
  onComplete: (assignmentId: string) => void;
}

export function AssignmentList({
  selectedYear,
  assignments,
  isLoading,
  eligibleMembers,
  nextHostPersonId,
  isAssignPending,
  isUpdatePending,
  onAssign,
  onEdit,
  onDelegate,
  onReschedule,
  onComplete,
}: AssignmentListProps) {
  const t = useTranslations('CauDuong');

  function ceremonyLabel(ceremonyType: CauDuongCeremonyType) {
    return t(`ceremonies.${ceremonyType}`);
  }

  function statusLabel(status: CauDuongStatus) {
    return t(`statuses.${status}`);
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>
          {t('assignmentYear', { year: selectedYear })}
        </CardTitle>
        <CardDescription>
          {t('eligibleCount', {
            count: eligibleMembers?.length ?? '...',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isLoading ? (
          <div className='space-y-2'>
            {[1, 2, 3, 4].map(index => (
              <div
                key={index}
                className='h-16 animate-pulse rounded-lg bg-muted'
              />
            ))}
          </div>
        ) : (
          CAU_DUONG_CEREMONY_ORDER.map(ceremonyType => {
            const assignment = assignments?.find(
              item => item.ceremony_type === ceremonyType
            );
            const canAction = assignment && assignment.status === 'scheduled';

            return (
              <div
                key={ceremonyType}
                className='flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center'>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium'>
                    {ceremonyLabel(ceremonyType)}
                  </p>
                  {assignment ? (
                    <div className='mt-0.5 space-y-0.5 text-xs text-muted-foreground'>
                      <p>
                        <span className='font-medium text-foreground'>
                          {assignment.host_person?.display_name ?? '—'}
                        </span>
                        {assignment.actual_host_person &&
                          assignment.actual_host_person.id !==
                            assignment.host_person?.id && (
                            <span className='ml-1'>
                              →{' '}
                              <span className='font-medium'>
                                {assignment.actual_host_person.display_name}
                              </span>{' '}
                              {t('delegatedShort')}
                            </span>
                          )}
                      </p>
                      {assignment.reason && (
                        <p className='italic'>{assignment.reason}</p>
                      )}
                      {assignment.actual_date && (
                        <p>
                          {t('dateLabel', {
                            date: new Date(
                              assignment.actual_date
                            ).toLocaleDateString('vi-VN'),
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {t('unassigned')}
                    </p>
                  )}
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  {assignment && (
                    <>
                      <Badge
                        variant={
                          assignment.status === 'completed'
                            ? 'default'
                            : assignment.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                        }>
                        {statusLabel(assignment.status)}
                      </Badge>
                      <EditAssignmentDialog
                        assignment={assignment}
                        eligibleMembers={eligibleMembers ?? []}
                        onConfirm={hostPersonId =>
                          onEdit(assignment.id, hostPersonId)
                        }
                        isPending={isUpdatePending}
                      />
                    </>
                  )}

                  {!assignment &&
                    eligibleMembers &&
                    eligibleMembers.length > 0 && (
                      <AssignDialog
                        ceremonyLabel={ceremonyLabel(ceremonyType)}
                        eligibleMembers={eligibleMembers}
                        defaultPersonId={nextHostPersonId}
                        onConfirm={personId =>
                          onAssign(ceremonyType, personId)
                        }
                        isPending={isAssignPending}
                      />
                    )}

                  {canAction && (
                    <>
                      <DelegateDialog
                        eligibleMembers={eligibleMembers ?? []}
                        onConfirm={(actualHostId, reason) =>
                          onDelegate(assignment.id, actualHostId, reason)
                        }
                        isPending={isUpdatePending}
                      />
                      <RescheduleDialog
                        onConfirm={(date, reason) =>
                          onReschedule(assignment.id, date, reason)
                        }
                        isPending={isUpdatePending}
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onComplete(assignment.id)}
                        disabled={isUpdatePending}>
                        <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
                        {t('actions.complete')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
