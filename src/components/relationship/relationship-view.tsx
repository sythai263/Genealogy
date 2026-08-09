/**
 * @project AncestorTree
 * @file src/components/relationship/relationship-view.tsx
 * @description Relationship finder — select two people and show connection
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { Route } from 'lucide-react';
import { PersonCombobox } from '@components/people';
import { LoadingState, PageHeader } from '@components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui';
import { useRelationship } from '@hooks';
import type { Person } from '@types';
import { RelationshipResultCard } from './relationship-result-card';

export function RelationshipView() {
  const [personA, setPersonA] = useState<Person | null>(null);
  const [personB, setPersonB] = useState<Person | null>(null);
  const { result, isLoading } = useRelationship(
    personA?.id ?? null,
    personB?.id ?? null
  );

  return (
    <div className="container mx-auto space-y-6 p-4">
      <div>
        <PageHeader icon={Route} title="Tìm quan hệ giữa 2 thành viên" />
        <p className="text-muted-foreground">
          Chọn 2 thành viên để tìm quan hệ theo tổ tông 18 đời — danh xưng Hán-Việt
          kèm diễn giải (ví dụ: <strong>Tằng Tổ (ông cố)</strong>,{' '}
          <strong>Huyền Tôn (chút trai)</strong>)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chọn thành viên</CardTitle>
          <CardDescription>
            Nhập tên để tìm kiếm (tối thiểu 2 ký tự)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <PersonCombobox
              label="Người 1"
              selected={personA}
              onSelect={setPersonA}
              excludeId={personB?.id}
            />
            <PersonCombobox
              label="Người 2"
              selected={personB}
              onSelect={setPersonB}
              excludeId={personA?.id}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && personA && personB && <LoadingState variant="detail" />}

      {result && !isLoading && personA && (
        <RelationshipResultCard
          result={result}
          treeRootId={personA.id}
        />
      )}
    </div>
  );
}
