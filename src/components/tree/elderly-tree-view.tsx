/**
 * @project AncestorTree
 * @file src/components/tree/elderly-tree-view.tsx
 * @description Simplified tree view for elderly users — list grouped by generation
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import { EmptyState } from '@components/shared';
import { Badge, Skeleton } from '@components/ui';
import { useTreeData } from '@hooks';
import type { Person } from '@types';

interface GenerationGroup {
  generation: number;
  members: Array<{
    person: Person;
    fatherName?: string;
  }>;
}

export function ElderlyTreeView() {
  const t = useTranslations('Tree');
  const { data: treeData, isLoading } = useTreeData();

  const groups = useMemo<GenerationGroup[]>(() => {
    if (!treeData) return [];

    const { people, families, children } = treeData;

    const familyFatherMap = new Map<string, string>();
    for (const f of families) {
      if (f.father_id) familyFatherMap.set(f.id, f.father_id);
    }
    const personFatherMap = new Map<string, string>();
    for (const c of children) {
      const fatherId = familyFatherMap.get(c.family_id);
      if (fatherId) personFatherMap.set(c.person_id, fatherId);
    }

    const nameMap = new Map<string, string>();
    for (const p of people) nameMap.set(p.id, p.display_name);

    const genMap = new Map<number, GenerationGroup['members']>();
    for (const person of people) {
      const gen = person.generation;
      const group = genMap.get(gen) || [];
      const fatherId = personFatherMap.get(person.id);
      group.push({
        person,
        fatherName: fatherId ? nameMap.get(fatherId) : undefined,
      });
      genMap.set(gen, group);
    }

    const sorted: GenerationGroup[] = [];
    const generations = [...genMap.keys()].sort((a, b) => a - b);
    for (const gen of generations) {
      const members = genMap.get(gen) || [];
      members.sort((a, b) =>
        a.person.display_name.localeCompare(b.person.display_name, 'vi')
      );
      sorted.push({ generation: gen, members });
    }

    return sorted;
  }, [treeData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return <EmptyState icon={Users} title={t('empty')} />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.generation}>
          <h3 className="sticky top-0 mb-2 bg-background py-1 text-lg font-bold">
            {t('node.generation', { n: group.generation })}
            <Badge variant="outline" className="ml-2">
              {t('elderly.memberCount', { count: group.members.length })}
            </Badge>
          </h3>
          <div className="space-y-1.5">
            {group.members.map(({ person, fatherName }) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="flex items-center justify-between rounded-md border px-4 py-3 transition-colors hover:bg-accent"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`text-lg font-medium ${person.gender === 1 ? 'text-blue-700' : 'text-pink-700'}`}
                  >
                    {person.display_name}
                  </span>
                  {!person.is_living && (
                    <span className="text-muted-foreground">†</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
                  {person.birth_year && <span>{person.birth_year}</span>}
                  {person.death_year && <span>– {person.death_year}</span>}
                  {fatherName && (
                    <span className="hidden sm:inline">
                      {t('elderly.childOf', { name: fatherName })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
