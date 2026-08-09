/**
 * @project AncestorTree
 * @file src/components/fund/fund-scholarships-tab.tsx
 * @description Scholarships and rewards lists for education fund
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Award, GraduationCap } from 'lucide-react';
import { Card, CardContent, Separator } from '@components/ui';
import { ListPagination } from '@components/shared';
import type { ListPageSize } from '@constants';
import { formatVND } from '@lib';
import type { Person, Scholarship } from '@types';
import { ScholarshipStatusBadge } from './scholarship-status-badge';

interface FundScholarshipsTabProps {
  scholarships: Scholarship[];
  scholarshipsTotal: number;
  scholarshipsPage: number;
  scholarshipsPageSize: ListPageSize;
  onScholarshipsPageChange: (page: number) => void;
  onScholarshipsPageSizeChange: (pageSize: ListPageSize) => void;
  rewards: Scholarship[];
  rewardsTotal: number;
  rewardsPage: number;
  rewardsPageSize: ListPageSize;
  onRewardsPageChange: (page: number) => void;
  onRewardsPageSizeChange: (pageSize: ListPageSize) => void;
  peopleMap: Map<string, Person>;
}

export function FundScholarshipsTab({
  scholarships,
  scholarshipsTotal,
  scholarshipsPage,
  scholarshipsPageSize,
  onScholarshipsPageChange,
  onScholarshipsPageSizeChange,
  rewards,
  rewardsTotal,
  rewardsPage,
  rewardsPageSize,
  onRewardsPageChange,
  onRewardsPageSizeChange,
  peopleMap,
}: FundScholarshipsTabProps) {
  return (
    <div className="mt-4 space-y-6">
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <GraduationCap className="h-4 w-4" />
          Học bổng ({scholarshipsTotal})
        </h3>
        {scholarships.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có học bổng nào</p>
        ) : (
          <div className="space-y-2">
            {scholarships.map((scholarship) => {
              const person = peopleMap.get(scholarship.person_id);
              return (
                <Card key={scholarship.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {person?.display_name || 'Không rõ'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {scholarship.school && `${scholarship.school} · `}
                        {scholarship.grade_level &&
                          `${scholarship.grade_level} · `}
                        {scholarship.academic_year}
                      </p>
                      {scholarship.reason && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {scholarship.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatVND(scholarship.amount)}
                      </p>
                      <ScholarshipStatusBadge status={scholarship.status} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {scholarshipsTotal > 0 && (
          <div className="mt-3">
            <ListPagination
              page={scholarshipsPage}
              pageSize={scholarshipsPageSize}
              total={scholarshipsTotal}
              onPageChange={onScholarshipsPageChange}
              onPageSizeChange={onScholarshipsPageSizeChange}
              itemLabel="học bổng"
            />
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Award className="h-4 w-4" />
          Khen thưởng ({rewardsTotal})
        </h3>
        {rewards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Chưa có khen thưởng nào
          </p>
        ) : (
          <div className="space-y-2">
            {rewards.map((reward) => {
              const person = peopleMap.get(reward.person_id);
              return (
                <Card key={reward.id}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {person?.display_name || 'Không rõ'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reward.school && `${reward.school} · `}
                        {reward.grade_level && `${reward.grade_level} · `}
                        {reward.academic_year}
                      </p>
                      {reward.reason && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {reward.reason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatVND(reward.amount)}
                      </p>
                      <ScholarshipStatusBadge status={reward.status} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {rewardsTotal > 0 && (
          <div className="mt-3">
            <ListPagination
              page={rewardsPage}
              pageSize={rewardsPageSize}
              total={rewardsTotal}
              onPageChange={onRewardsPageChange}
              onPageSizeChange={onRewardsPageSizeChange}
              itemLabel="khen thưởng"
            />
          </div>
        )}
      </div>
    </div>
  );
}
