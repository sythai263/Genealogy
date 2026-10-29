/**
 * @project AncestorTree
 * @file src/components/registrations/registration-card.tsx
 * @description One member-registration card — identity, details grid, status
 *              badge, approve/reject/delete actions. Approve owns its
 *              mutation; reject/delete delegate to parent dialogs.
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, Trash2, X } from 'lucide-react';
import { useAuth } from '@components/auth';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { REGISTRATION_STATUS_MAP } from '@constants';
import { useApproveRegistration } from '@hooks';
import { getRelativeTime } from '@lib';
import type { MemberRegistration, RegistrationStatus } from '@types';

export function registrationStatusLabel(
  status: RegistrationStatus,
  t: ReturnType<typeof useTranslations<'Admin'>>
): string {
  return t(
    `registrations.statuses.${status}` as 'registrations.statuses.pending'
  );
}

interface RegistrationCardProps {
  registration: MemberRegistration;
  onReject: (reg: MemberRegistration) => void;
  onDelete: (reg: MemberRegistration) => void;
}

export function RegistrationCard({
  registration: reg,
  onReject,
  onDelete,
}: RegistrationCardProps) {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const tPeople = useTranslations('People');
  const { isAdmin } = useAuth();
  const approveMutation = useApproveRegistration();

  async function handleApprove() {
    try {
      await approveMutation.mutateAsync({ id: reg.id });
      toast.success(
        t('registrations.toasts.approveSuccess', { name: reg.full_name })
      );
    } catch {
      toast.error(t('registrations.toasts.approveError'));
    }
  }

  return (
    <Card>
      <CardHeader className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{reg.full_name}</CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {reg.gender === 1 ? tCommon('male') : tCommon('female')}
              {reg.birth_year &&
                ` · ${t('registrations.birthYearPrefix', { year: reg.birth_year })}`}
              {reg.birth_place && ` · ${reg.birth_place}`}
            </p>
          </div>
          <Badge
            variant={REGISTRATION_STATUS_MAP[reg.status]?.variant ?? 'outline'}
          >
            {registrationStatusLabel(reg.status, t)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-3">
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          {reg.parent_name && (
            <div>
              <span className="text-muted-foreground">
                {t('registrations.fields.parent')}:{' '}
              </span>
              {reg.parent_name}
            </div>
          )}
          {reg.generation && (
            <div>
              <span className="text-muted-foreground">
                {tCommon('generation')}:{' '}
              </span>
              {reg.generation}
            </div>
          )}
          {reg.chi && (
            <div>
              <span className="text-muted-foreground">{tCommon('chi')}: </span>
              {reg.chi}
            </div>
          )}
          {reg.relationship && (
            <div>
              <span className="text-muted-foreground">
                {t('registrations.fields.relationship')}:{' '}
              </span>
              {reg.relationship}
            </div>
          )}
          {reg.phone && (
            <div>
              <span className="text-muted-foreground">
                {tPeople('form.phone')}:{' '}
              </span>
              {reg.phone}
            </div>
          )}
          {reg.email && (
            <div>
              <span className="text-muted-foreground">
                {tPeople('form.email')}:{' '}
              </span>
              {reg.email}
            </div>
          )}
        </div>
        {reg.notes && (
          <p className="border-t pt-2 text-xs text-muted-foreground">
            {reg.notes}
          </p>
        )}
        {reg.reject_reason && (
          <p className="border-t pt-2 text-xs text-red-500">
            {t('registrations.rejectReasonLabel', {
              reason: reg.reject_reason,
            })}
          </p>
        )}

        <div className="flex items-center justify-between border-t pt-2">
          <span className="text-[10px] text-muted-foreground">
            {getRelativeTime(reg.created_at)}
          </span>
          <div className="flex gap-1.5">
            {reg.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={() => void handleApprove()}
                  disabled={approveMutation.isPending}
                >
                  <Check className="mr-1 h-3 w-3" />
                  {t('registrations.actions.approve')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => onReject(reg)}
                >
                  <X className="mr-1 h-3 w-3" />
                  {t('registrations.actions.reject')}
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(reg)}
                title={t('registrations.actions.delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
