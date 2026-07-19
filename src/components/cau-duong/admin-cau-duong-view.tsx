/**
 * @project AncestorTree
 * @file src/components/cau-duong/admin-cau-duong-view.tsx
 * @description Admin view: quản lý nhóm và phân công Cầu đương
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Pencil, Plus, RotateCcw } from 'lucide-react';
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
  usePeople,
  useUpdateCauDuongAssignment,
  useUpdateCauDuongPool,
} from '@hooks';
import { CAU_DUONG_CEREMONY_LABELS, CAU_DUONG_YEAR_OPTIONS, getCauDuongCurrentYear } from '@constants';
import type { CauDuongPoolFormData } from '@schemas';
import type { CauDuongCeremonyType, CauDuongPool } from '@types';
import { AssignmentList } from './assignment-list';
import { PoolForm } from './pool-form';
import { RotationList } from './rotation-list';

export function AdminCauDuongView() {
  const { isEditor, profile } = useAuth();
  const [selectedYear, setSelectedYear] = useState(getCauDuongCurrentYear());
  const [poolDialogOpen, setPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<CauDuongPool | undefined>();

  const { data: pools, isLoading: poolsLoading } = useCauDuongPools();
  const { data: people } = usePeople();
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

  if (!isEditor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">
              Bạn cần quyền biên tập viên để truy cập trang này
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleCreatePool(data: CauDuongPoolFormData) {
    createPoolMutation.mutate(
      { ...data, is_active: true },
      {
        onSuccess: () => {
          toast.success('Đã tạo nhóm Cầu đương');
          setPoolDialogOpen(false);
        },
        onError: () => {
          toast.error('Lỗi khi tạo nhóm');
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
          toast.success('Đã cập nhật nhóm');
          setPoolDialogOpen(false);
          setEditingPool(undefined);
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật nhóm');
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
            `Đã phân công ${CAU_DUONG_CEREMONY_LABELS[ceremonyType]} cho ${hostName}`
          );
        },
        onError: (error) => {
          toast.error(error.message || 'Lỗi khi phân công');
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
          const hostName =
            eligibleMembers?.find(
              (member) => member.person.id === hostPersonId
            )?.person.display_name ||
            people?.find((person) => person.id === hostPersonId)?.display_name;
          toast.success(`Đã đổi phân công cho ${hostName}`);
        },
        onError: () => {
          toast.error('Lỗi khi sửa phân công');
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
          toast.success('Đã ghi nhận ủy quyền');
        },
        onError: () => {
          toast.error('Lỗi khi ủy quyền');
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
          toast.success('Đã cập nhật ngày thực hiện');
        },
        onError: () => {
          toast.error('Lỗi khi đổi ngày');
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
          toast.success('Đã ghi nhận hoàn thành');
        },
        onError: () => {
          toast.error('Lỗi khi cập nhật');
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
          toast.error('Lỗi khi cập nhật thứ tự');
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
          toast.success('Đã khôi phục thứ tự mặc định');
        },
        onError: () => {
          toast.error('Lỗi khi khôi phục');
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
            Quản lý Cầu đương
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cấu hình nhóm xoay vòng và phân công chủ lễ
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
                  Năm {year}
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
                {firstPool ? 'Sửa nhóm' : 'Tạo nhóm'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPool ? 'Sửa nhóm Cầu đương' : 'Tạo nhóm Cầu đương'}
                </DialogTitle>
              </DialogHeader>
              <PoolForm
                key={editingPool?.id || 'new'}
                pool={editingPool}
                people={people || []}
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
            <p className="mb-1 font-medium">Chưa có nhóm Cầu đương</p>
            <p className="text-sm">Nhấn &quot;Tạo nhóm&quot; để bắt đầu cấu hình</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col justify-between gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <div className="text-sm">
              <span className="font-medium">{firstPool.name}</span>
              <span className="ml-2 text-muted-foreground">
                · Đời {firstPool.min_generation}+ · Dưới {firstPool.max_age_lunar}{' '}
                tuổi âm
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
              Chỉnh sửa
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
