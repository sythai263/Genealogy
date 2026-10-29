/**
 * @project AncestorTree
 * @file src/components/cau-duong/assignment-list.tsx
 * @description Danh sách phân công lễ Cầu đương theo năm — owns the assign,
 *              edit, delegate, reschedule and complete mutations + toasts
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
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
import {
  useCreateCauDuongAssignment,
  useUpdateCauDuongAssignment,
} from '@hooks';
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

function isCauDuongCeremonyType(
  value: string
): value is CauDuongCeremonyType {
  return (
    value === 'tet' ||
    value === 'ram_thang_gieng' ||
    value === 'gio_to' ||
    value === 'ram_thang_bay'
  );
}

interface AssignmentListProps {
  poolId: string;
  selectedYear: number;
  assignments: CauDuongAssignmentWithPeople[] | undefined;
  isLoading: boolean;
  eligibleMembers: CauDuongEligibleMember[] | undefined;
  nextHostPersonId?: string;
}

export function AssignmentList({
  poolId,
  selectedYear,
  assignments,
  isLoading,
  eligibleMembers,
  nextHostPersonId,
}: AssignmentListProps) {
  const t = useTranslations('CauDuong');
  const tAdmin = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const { profile } = useAuth();
  const createAssignmentMutation = useCreateCauDuongAssignment();
  const updateAssignmentMutation = useUpdateCauDuongAssignment();

  function ceremonyLabel(ceremonyType: CauDuongCeremonyType) {
    return t(`ceremonies.${ceremonyType}`);
  }

  function statusLabel(status: CauDuongStatus) {
    return t(`statuses.${status}`);
  }

  function getCeremonyLabel(ceremonyType: CauDuongCeremonyType): string {
    if (isCauDuongCeremonyType(ceremonyType)) {
      return t(`ceremonies.${ceremonyType}`);
    }
    return ceremonyType;
  }

  function handleAssign(
    ceremonyType: CauDuongCeremonyType,
    hostPersonId: string
  ) {
    const rotationIndex =
      eligibleMembers?.findIndex(
        (member) => member.person.id === hostPersonId
      ) ?? 0;
    createAssignmentMutation.mutate(
      {
        pool_id: poolId,
        year: selectedYear,
        ceremony_type: ceremonyType,
        host_person_id: hostPersonId,
        status: 'scheduled',
        rotation_index: rotationIndex,
        created_by: profile?.id ?? '',
      },
      {
        onSuccess: () => {
          const hostName = eligibleMembers?.find(
            (member) => member.person.id === hostPersonId
          )?.person.display_name;
          toast.success(
            tAdmin('features.cauDuong.assignSuccess', {
              ceremony: getCeremonyLabel(ceremonyType),
              host: hostName ?? tCommon('unknown'),
            })
          );
        },
        onError: (error) => {
          toast.error(
            error.message || tAdmin('features.cauDuong.assignError')
          );
        },
      }
    );
  }

  function handleEdit(assignmentId: string, hostPersonId: string) {
    updateAssignmentMutation.mutate(
      {
        id: assignmentId,
        poolId,
        input: { host_person_id: hostPersonId },
      },
      {
        onSuccess: () => {
          const hostName = eligibleMembers?.find(
            (member) => member.person.id === hostPersonId
          )?.person.display_name;
          toast.success(
            hostName
              ? tAdmin('features.cauDuong.reassignSuccess', { host: hostName })
              : tAdmin('features.cauDuong.reassignSuccessGeneric')
          );
        },
        onError: () => {
          toast.error(t('toasts.assignErrorGeneric'));
        },
      }
    );
  }

  function handleDelegate(
    assignmentId: string,
    actualHostPersonId: string,
    reason: string
  ) {
    updateAssignmentMutation.mutate(
      {
        id: assignmentId,
        poolId,
        input: {
          actual_host_person_id: actualHostPersonId,
          reason,
          status: 'delegated',
        },
      },
      {
        onSuccess: () => {
          toast.success(t('toasts.delegateSuccess'));
        },
        onError: () => {
          toast.error(t('toasts.delegateError'));
        },
      }
    );
  }

  function handleReschedule(
    assignmentId: string,
    actualDate: string,
    reason: string
  ) {
    updateAssignmentMutation.mutate(
      {
        id: assignmentId,
        poolId,
        input: { actual_date: actualDate, reason, status: 'rescheduled' },
      },
      {
        onSuccess: () => {
          toast.success(t('toasts.rescheduleSuccess'));
        },
        onError: () => {
          toast.error(t('toasts.rescheduleError'));
        },
      }
    );
  }

  function handleComplete(assignmentId: string) {
    updateAssignmentMutation.mutate(
      {
        id: assignmentId,
        poolId,
        input: {
          status: 'completed',
          actual_date: new Date().toISOString().split('T')[0],
        },
      },
      {
        onSuccess: () => {
          toast.success(t('toasts.completeSuccess'));
        },
        onError: () => {
          toast.error(t('toasts.completeError'));
        },
      }
    );
  }

  const isAssignPending = createAssignmentMutation.isPending;
  const isUpdatePending = updateAssignmentMutation.isPending;

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
                          handleEdit(assignment.id, hostPersonId)
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
                          handleAssign(ceremonyType, personId)
                        }
                        isPending={isAssignPending}
                      />
                    )}

                  {canAction && (
                    <>
                      <DelegateDialog
                        eligibleMembers={eligibleMembers ?? []}
                        onConfirm={(actualHostId, reason) =>
                          handleDelegate(assignment.id, actualHostId, reason)
                        }
                        isPending={isUpdatePending}
                      />
                      <RescheduleDialog
                        onConfirm={(date, reason) =>
                          handleReschedule(assignment.id, date, reason)
                        }
                        isPending={isUpdatePending}
                      />
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleComplete(assignment.id)}
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
