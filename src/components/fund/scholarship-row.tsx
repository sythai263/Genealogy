/**
 * @project AncestorTree
 * @file src/components/fund/scholarship-row.tsx
 * @description One scholarship row — recipient, type/amount/year, status
 *              badge, approve/disburse actions, delete confirm (owns its
 *              mutations + toasts)
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import {
  useDeleteScholarship,
  useUpdateScholarshipStatus,
} from '@hooks';
import { formatVND } from '@lib';
import type { Person, Scholarship, ScholarshipStatus } from '@types';
import { ScholarshipStatusBadge } from './scholarship-status-badge';

interface ScholarshipRowProps {
  scholarship: Scholarship;
  person: Person | undefined;
}

export function ScholarshipRow({ scholarship: s, person }: ScholarshipRowProps) {
  const t = useTranslations('Admin');
  const tFund = useTranslations('Fund');
  const tCommon = useTranslations('Common');
  const { profile } = useAuth();
  const updateSchStatus = useUpdateScholarshipStatus();
  const deleteSch = useDeleteScholarship();

  const handleApprove = async (status: ScholarshipStatus) => {
    try {
      await updateSchStatus.mutateAsync({
        id: s.id,
        status,
        approvedBy: profile?.id,
      });
      toast.success(
        status === 'approved'
          ? t('features.fund.approved')
          : t('features.fund.paid')
      );
    } catch {
      toast.error(tFund('toasts.updateError'));
    }
  };

  return (
    <Card>
      <CardContent className="p-3 flex items-center justify-between">
        <div>
          <p className="font-medium text-sm">
            {person?.display_name || tCommon('unknown')}
          </p>
          <p className="text-xs text-muted-foreground">
            {tFund(`scholarshipTypes.${s.type}`)} · {formatVND(s.amount)} ·{' '}
            {s.academic_year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScholarshipStatusBadge status={s.status} />
          {s.status === 'pending' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove('approved')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('features.fund.approve')}
            </Button>
          )}
          {s.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApprove('paid')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              {t('features.fund.disburse')}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('features.fund.deleteSchTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('features.fund.deleteConfirmDescription')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteSch
                      .mutateAsync(s.id)
                      .then(() =>
                        toast.success(tFund('toasts.deleteSuccess'))
                      )
                      .catch(() => toast.error(tFund('toasts.deleteError')))
                  }
                >
                  {tCommon('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
