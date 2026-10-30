/**
 * @project AncestorTree
 * @file src/components/cau-duong/cau-duong-members-tab.tsx
 * @description Public Cầu đương members tab — eligible members in DFS
 *              rotation order with generation, chi, hometown, lunar age
 * @version 1.0.0
 * @updated 2026-10-29
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import type { CauDuongEligibleMember } from '@types';

interface CauDuongMembersTabProps {
  eligibleMembers: CauDuongEligibleMember[] | undefined;
  isLoading: boolean;
}

export function CauDuongMembersTab({
  eligibleMembers,
  isLoading,
}: CauDuongMembersTabProps) {
  const t = useTranslations('CauDuong');

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base'>{t('rotationTitle')}</CardTitle>
        <CardDescription>{t('rotationDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-2'>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className='animate-pulse h-10 bg-muted rounded' />
            ))}
          </div>
        ) : !eligibleMembers || eligibleMembers.length === 0 ? (
          <p className='text-center text-muted-foreground py-8'>
            {t('noEligible')}
          </p>
        ) : (
          <div className='space-y-2'>
            {eligibleMembers.map((member, idx) => (
              <div
                key={member.person.id}
                className='flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50 transition-colors'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-mono text-muted-foreground w-7 text-right'>
                    {idx + 1}.
                  </span>
                  <div>
                    <p className='font-medium'>
                      {member.person.display_name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {t('generationLabel', {
                        generation: member.person.generation,
                      })}
                      {member.person.chi
                        ? ` • ${t('chiLabel', { chi: member.person.chi })}`
                        : ''}
                      {member.person.hometown
                        ? ` • ${member.person.hometown}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className='text-right text-xs text-muted-foreground'>
                  {member.ageLunar > 0 && (
                    <span>
                      {t('ageLunar', { age: member.ageLunar })}
                    </span>
                  )}
                  {member.person.birth_year && (
                    <p className='text-muted-foreground/60'>
                      {t('born', { year: member.person.birth_year })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
