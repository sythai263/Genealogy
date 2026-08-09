/**
 * @project AncestorTree
 * @file src/components/cau-duong/rotation-list.tsx
 * @description Danh sách xoay vòng Cầu đương với sắp xếp thứ tự
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { ArrowDown, ArrowUp, ListRestart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import type { CauDuongEligibleMember, CauDuongPool } from '@types';

interface RotationListProps {
  pool: CauDuongPool;
  eligibleMembers: CauDuongEligibleMember[] | undefined;
  isPending: boolean;
  onReorder: (orderedIds: string[]) => void;
  onResetOrder: () => void;
}

export function RotationList({
  pool,
  eligibleMembers,
  isPending,
  onReorder,
  onResetOrder,
}: RotationListProps) {
  const t = useTranslations('CauDuong');

  function moveMember(index: number, direction: -1 | 1) {
    if (!eligibleMembers) return;
    const ids = eligibleMembers.map(member => member.person.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= ids.length) return;
    const currentId = ids[index];
    const targetId = ids[targetIndex];
    if (!currentId || !targetId) return;
    ids[index] = targetId;
    ids[targetIndex] = currentId;
    onReorder(ids);
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base'>{t('rotationTitle')}</CardTitle>
            <CardDescription>
              {pool.custom_order?.length
                ? t('rotationCustom')
                : t('rotationDefault')}
            </CardDescription>
          </div>
          {pool.custom_order?.length ? (
            <Button
              variant='ghost'
              size='sm'
              onClick={onResetOrder}
              disabled={isPending}>
              <ListRestart className='mr-1 h-3.5 w-3.5' />
              {t('defaultOrder')}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {!eligibleMembers || eligibleMembers.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            {t('noEligible')}
          </p>
        ) : (
          <div className='space-y-1'>
            {eligibleMembers.map((member, index) => (
              <div
                key={member.person.id}
                className='flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted/50'>
                <div className='flex items-center gap-3'>
                  <span className='w-6 text-right font-mono text-xs text-muted-foreground'>
                    {index + 1}.
                  </span>
                  <div>
                    <p className='font-medium'>{member.person.display_name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {t('generationLabel', {
                        generation: member.person.generation,
                      })}
                      {member.person.chi
                        ? ` · ${t('chiLabel', { chi: member.person.chi })}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-muted-foreground'>
                    {member.ageLunar > 0
                      ? t('ageLunar', { age: member.ageLunar })
                      : ''}
                  </span>
                  <div className='flex gap-0.5'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6'
                      disabled={index === 0 || isPending}
                      onClick={() => moveMember(index, -1)}>
                      <ArrowUp className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-6 w-6'
                      disabled={
                        index === eligibleMembers.length - 1 || isPending
                      }
                      onClick={() => moveMember(index, 1)}>
                      <ArrowDown className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
