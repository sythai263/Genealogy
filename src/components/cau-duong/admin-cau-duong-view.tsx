/**
 * @project AncestorTree
 * @file src/components/cau-duong/admin-cau-duong-view.tsx
 * @description Admin view: quản lý nhóm và phân công Cầu đương
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Pencil,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  useCauDuongAssignments,
  useCauDuongPools,
  useCreateCauDuongAssignment,
  useCreateCauDuongPool,
  useEligibleMembers,
  useNextHostInRotation,
  useUpdateCauDuongAssignment,
  useUpdateCauDuongPool,
} from '@hooks';
import { CAU_DUONG_YEAR_OPTIONS, getCauDuongCurrentYear } from '@constants';
import type { CauDuongPoolFormData } from '@schemas';
import type { CauDuongCeremonyType, CauDuongPool } from '@types';
import { AssignmentList } from './assignment-list';
import { PoolForm } from './pool-form';
import { RotationList } from './rotation-list';
import { AccessDenied } from '@components/shared';

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

export function AdminCauDuongView() {
  const t = useTranslations('Admin');
  const tCauDuong = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const { isEditor, profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(getCauDuongCurrentYear());
  const [poolDialogOpen, setPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<CauDuongPool | undefined>();

  const { data: pools, isLoading: poolsLoading } = useCauDuongPools();
  const createPoolMutation = useCreateCauDuongPool();
  const updatePoolMutation = useUpdateCauDuongPool();

  const firstPool = pools?.[0];
  const poolId = firstPool?.id;

  const { data: assignments, isLoading: assignmentsLoading } =
    useCauDuongAssignments(poolId, selectedYear);
  const { data: eligibleMembers } = useEligibleMembers(poolId, selectedYear);
  const { data: nextHost } = useNextHostInRotation(poolId);
  const createAssignmentMutation = useCreateCauDuongAssignment();
  const updateAssignmentMutation = useUpdateCauDuongAssignment();

  function getCeremonyLabel(ceremonyType: CauDuongCeremonyType): string {
    if (isCauDuongCeremonyType(ceremonyType)) {
      return tCauDuong(`ceremonies.${ceremonyType}`);
    }
    return ceremonyType;
  }

  if (!isEditor) {
    return <AccessDenied />;
  }

  function handleCreatePool(data: CauDuongPoolFormData) {
    createPoolMutation.mutate(
      { ...data, is_active: true },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.createPoolSuccess'));
          setPoolDialogOpen(false);
        },
        onError: () => {
          toast.error(tCauDuong('toasts.createPoolError'));
        },
      }
    );
  }

  function handleUpdatePool(data: CauDuongPoolFormData) {
    if (!editingPool) return;
    updatePoolMutation.mutate(
      {
        id: editingPool.id,
        input: { ...data, is_active: editingPool.is_active },
      },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.updatePoolSuccess'));
          setPoolDialogOpen(false);
          setEditingPool(undefined);
        },
        onError: () => {
          toast.error(tCauDuong('toasts.updatePoolError'));
        },
      }
    );
  }

  function handleManualAssign(
    ceremonyType: CauDuongCeremonyType,
    hostPersonId: string
  ) {
    if (!poolId) return;
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
            t('features.cauDuong.assignSuccess', {
              ceremony: getCeremonyLabel(ceremonyType),
              host: hostName ?? tCommon('unknown'),
            })
          );
        },
        onError: (error) => {
          toast.error(
            error.message || t('features.cauDuong.assignError')
          );
        },
      }
    );
  }

  function handleEditAssignment(assignmentId: string, hostPersonId: string) {
    if (!poolId) return;
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
              ? t('features.cauDuong.reassignSuccess', { host: hostName })
              : t('features.cauDuong.reassignSuccessGeneric')
          );
        },
        onError: () => {
          toast.error(tCauDuong('toasts.assignErrorGeneric'));
        },
      }
    );
  }

  function handleDelegate(
    assignmentId: string,
    actualHostPersonId: string,
    reason: string
  ) {
    if (!poolId) return;
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
          toast.success(tCauDuong('toasts.delegateSuccess'));
        },
        onError: () => {
          toast.error(tCauDuong('toasts.delegateError'));
        },
      }
    );
  }

  function handleReschedule(
    assignmentId: string,
    actualDate: string,
    reason: string
  ) {
    if (!poolId) return;
    updateAssignmentMutation.mutate(
      {
        id: assignmentId,
        poolId,
        input: { actual_date: actualDate, reason, status: 'rescheduled' },
      },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.rescheduleSuccess'));
        },
        onError: () => {
          toast.error(tCauDuong('toasts.rescheduleError'));
        },
      }
    );
  }

  function handleMarkComplete(assignmentId: string) {
    if (!poolId) return;
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
          toast.success(tCauDuong('toasts.completeSuccess'));
        },
        onError: () => {
          toast.error(tCauDuong('toasts.completeError'));
        },
      }
    );
  }

  function handleReorder(orderedIds: string[]) {
    if (!firstPool) return;
    updatePoolMutation.mutate(
      {
        id: firstPool.id,
        input: { custom_order: orderedIds },
      },
      {
        onError: () => {
          toast.error(tCauDuong('toasts.reorderError'));
        },
      }
    );
  }

  function handleResetOrder() {
    if (!firstPool) return;
    updatePoolMutation.mutate(
      {
        id: firstPool.id,
        input: { custom_order: undefined },
      },
      {
        onSuccess: () => {
          toast.success(tCauDuong('toasts.restoreSuccess'));
        },
        onError: () => {
          toast.error(tCauDuong('toasts.restoreError'));
        },
      }
    );
  }

  function handlePoolDialogOpenChange(open: boolean) {
    setPoolDialogOpen(open);
    if (!open) setEditingPool(undefined);
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <RotateCcw className="h-6 w-6 text-primary" />
            {t('features.cauDuong.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('features.cauDuong.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(Number(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAU_DUONG_YEAR_OPTIONS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {tCauDuong('yearLabel', { year })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog
            open={poolDialogOpen}
            onOpenChange={handlePoolDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {firstPool
                  ? t('features.cauDuong.editPool')
                  : t('features.cauDuong.createPool')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPool
                    ? t('features.cauDuong.editPoolTitle')
                    : t('features.cauDuong.createPoolTitle')}
                </DialogTitle>
              </DialogHeader>
              <PoolForm
                key={editingPool?.id || 'new'}
                pool={editingPool}
                onSubmit={editingPool ? handleUpdatePool : handleCreatePool}
                isPending={
                  createPoolMutation.isPending || updatePoolMutation.isPending
                }
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {poolsLoading ? (
        <Card>
          <CardContent className="animate-pulse py-4">
            <div className="h-4 w-48 rounded bg-muted" />
          </CardContent>
        </Card>
      ) : !firstPool ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            <RotateCcw className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="mb-1 font-medium">
              {t('features.cauDuong.emptyPool')}
            </p>
            <p className="text-sm">{t('features.cauDuong.emptyPoolHint')}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <div className="text-sm">
              <span className="font-medium">{firstPool.name}</span>
              <span className="ml-2 text-muted-foreground">
                {t('features.cauDuong.poolSummary', {
                  min: firstPool.min_generation,
                  max: firstPool.max_age_lunar,
                })}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingPool(firstPool);
                setPoolDialogOpen(true);
              }}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              {tCommon('edit')}
            </Button>
          </CardContent>
        </Card>
      )}

      {firstPool && (
        <>
          <AssignmentList
            selectedYear={selectedYear}
            assignments={assignments}
            isLoading={assignmentsLoading}
            eligibleMembers={eligibleMembers}
            nextHostPersonId={nextHost?.member.person.id}
            isAssignPending={createAssignmentMutation.isPending}
            isUpdatePending={updateAssignmentMutation.isPending}
            onAssign={handleManualAssign}
            onEdit={handleEditAssignment}
            onDelegate={handleDelegate}
            onReschedule={handleReschedule}
            onComplete={handleMarkComplete}
          />
          <RotationList
            pool={firstPool}
            eligibleMembers={eligibleMembers}
            isPending={updatePoolMutation.isPending}
            onReorder={handleReorder}
            onResetOrder={handleResetOrder}
          />
        </>
      )}
    </div>
  );
}
