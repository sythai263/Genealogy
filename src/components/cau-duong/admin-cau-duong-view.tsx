/**
 * @project AncestorTree
 * @file src/components/cau-duong/admin-cau-duong-view.tsx
 * @description Admin view: quản lý nhóm và phân công Cầu đương — orchestrates
 *              queries + pool dialog state; assignment/reorder mutations live
 *              in sibling components
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, RotateCcw } from 'lucide-react';
import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
import {
  Button,
  Card,
  CardContent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  useCauDuongAssignments,
  useCauDuongPools,
  useEligibleMembers,
  useNextHostInRotation,
} from '@hooks';
import { CAU_DUONG_YEAR_OPTIONS, getCauDuongCurrentYear } from '@constants';
import type { CauDuongPool } from '@types';
import { AssignmentList } from './assignment-list';
import { CauDuongPoolDialog } from './cau-duong-pool-dialog';
import { RotationList } from './rotation-list';

export function AdminCauDuongView() {
  const t = useTranslations('Admin');
  const tCauDuong = useTranslations('CauDuong');
  const tCommon = useTranslations('Common');
  const { isEditor } = useAuth();
  const [selectedYear, setSelectedYear] = useState(getCauDuongCurrentYear());
  const [poolDialogOpen, setPoolDialogOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<CauDuongPool | undefined>();

  const { data: pools, isLoading: poolsLoading } = useCauDuongPools();

  const firstPool = pools?.[0];
  const poolId = firstPool?.id;

  const { data: assignments, isLoading: assignmentsLoading } =
    useCauDuongAssignments(poolId, selectedYear);
  const { data: eligibleMembers } = useEligibleMembers(poolId, selectedYear);
  const { data: nextHost } = useNextHostInRotation(poolId);

  if (!isEditor) {
    return <AccessDenied />;
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

          <CauDuongPoolDialog
            pool={firstPool}
            editingPool={editingPool}
            open={poolDialogOpen}
            onOpenChange={handlePoolDialogOpenChange}
          />
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

      {firstPool && poolId && (
        <>
          <AssignmentList
            poolId={poolId}
            selectedYear={selectedYear}
            assignments={assignments}
            isLoading={assignmentsLoading}
            eligibleMembers={eligibleMembers}
            nextHostPersonId={nextHost?.member.person.id}
          />
          <RotationList pool={firstPool} eligibleMembers={eligibleMembers} />
        </>
      )}
    </div>
  );
}
