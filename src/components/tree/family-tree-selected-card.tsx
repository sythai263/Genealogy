/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-selected-card.tsx
 * @description Floating card for the currently selected tree person
 * @version 1.0.0
 * @updated 2026-07-19
 */

'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import { getInitials, getPersonTreeNameParts } from '@lib';
import type { Person } from '@types';

interface FamilyTreeSelectedCardProps {
  person: Person;
  onClose: () => void;
}

export function FamilyTreeSelectedCard({
  person,
  onClose,
}: FamilyTreeSelectedCardProps) {
  const { givenName, familyLine } = getPersonTreeNameParts(person);

  return (
    <Card className="animate-in fade-in slide-in-from-bottom-8 fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 shadow-2xl">
      <CardContent className="flex items-center justify-between rounded-xl bg-background p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={person.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-lg font-semibold text-muted-foreground">
              {getInitials(givenName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="line-clamp-1 text-base font-semibold">{givenName}</h3>
            {familyLine ? (
              <p className="text-sm text-muted-foreground">{familyLine}</p>
            ) : null}
            <p className="mt-0.5 text-sm text-muted-foreground">
              Đời {person.generation}
              {person.chi != null ? ` • Chi ${person.chi}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="rounded-full px-6">
            <Link href={`/people/${person.id}`}>Chi tiết</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
