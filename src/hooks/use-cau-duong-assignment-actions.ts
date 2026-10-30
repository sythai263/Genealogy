/**
 * @project AncestorTree
 * @file src/hooks/use-cau-duong-assignment-actions.ts
 * @description Cầu đương assignment mutations — assign, edit host, delegate,
 *              reschedule, complete. Wraps create/update mutations with
 *              toasts and pending flags.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  useCreateCauDuongAssignment,
  useUpdateCauDuongAssignment,
} from '@hooks';
import type {
  CauDuongCeremonyType,
  CauDuongEligibleMember,
} from '@types';

function isCauDuongCeremonyType(
  ceremonyType: string
): ceremonyType is CauDuongCeremonyType {
  return (
    ceremonyType === 'tet' ||
    ceremonyType === 'ram_thang_gieng' ||
    ceremonyType === 'gio_to' ||
    ceremonyType === 'ram_thang_bay'
  );
}

interface UseCauDuongAssignmentActionsParams {
  poolId: string;
  selectedYear: number;
  eligibleMembers: CauDuongEligibleMember[] | undefined;
}

export function useCauDuongAssignmentActions({
  poolId,
  selectedYear,
  eligibleMembers,
}: UseCauDuongAssignmentActionsParams) {
  const t = useTranslations('CauDuong');
  const tAdmin = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const { profile } = useAuth();
  const createAssignmentMutation = useCreateCauDuongAssignment();
  const updateAssignmentMutation = useUpdateCauDuongAssignment();

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

  return {
    handleAssign,
    handleEdit,
    handleDelegate,
    handleReschedule,
    handleComplete,
    isAssignPending: createAssignmentMutation.isPending,
    isUpdatePending: updateAssignmentMutation.isPending,
  };
}
