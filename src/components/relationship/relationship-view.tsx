/**
 * @project AncestorTree
 * @file src/components/relationship/relationship-view.tsx
 * @description Relationship finder — select two people and show connection
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

import { useState } from 'react';
import { Loader2, Route } from 'lucide-react';
import { PersonCombobox } from '@components/people';
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
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Route className="h-6 w-6" />
          Tìm quan hệ giữa 2 thành viên
        </h1>
        <p className="text-muted-foreground">
          Chọn 2 thành viên bất kỳ để tìm mối quan hệ và tổ tiên chung
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

      {isLoading && personA && personB && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tìm quan hệ...
          </CardContent>
        </Card>
      )}

      {result && !isLoading && personA && (
        <RelationshipResultCard
          result={result}
          treeRootId={personA.id}
        />
      )}
    </div>
  );
}
