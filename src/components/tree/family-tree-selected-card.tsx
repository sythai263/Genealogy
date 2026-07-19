/**
 * @project AncestorTree
 * @file src/components/tree/family-tree-selected-card.tsx
 * @description Floating card for the currently selected tree person
 * @version 1.1.0
 * @updated 2026-07-19
 */

'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
} from '@components/ui';
import { cn, getInitials, getPersonTreeNameParts } from '@lib';
import type { Person } from '@types';
import { X } from 'lucide-react';
import Link from 'next/link';

interface FamilyTreeSelectedCardProps {
  person: Person;
  onClose: () => void;
  /** When false, hide the authenticated "Chi tiết" link (public landing). */
  showDetailLink?: boolean;
  /** Optional login CTA when detail link is hidden. */
  loginHref?: string;
  className?: string;
}

export function FamilyTreeSelectedCard({
  person,
  onClose,
  showDetailLink = true,
  loginHref = '/login',
  className,
}: FamilyTreeSelectedCardProps) {
  const { givenName, familyLine } = getPersonTreeNameParts(person);

  return (
    <Card
      className={cn(
        'animate-in fade-in slide-in-from-bottom-8 fixed bottom-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 shadow-2xl sm:bottom-6 sm:w-[90%]',
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-2 rounded-xl bg-background p-3 sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/10 sm:h-12 sm:w-12">
            <AvatarImage src={person.avatar_url || ''} />
            <AvatarFallback className="bg-muted text-base font-semibold text-muted-foreground sm:text-lg">
              {getInitials(givenName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
              {givenName}
            </h3>
            {familyLine ? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {familyLine}
              </p>
            ) : null}
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              <span>Chi: {person.chi != null ? person.chi : ''}</span>
              <span className="ml-1">Đời: {person.generation}</span>
            </p>
          </div>  
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {showDetailLink ? (
            <Button asChild size="sm" className="rounded-full px-4 sm:px-6">
              <Link href={`/people/${person.id}`}>Chi tiết</Link>
            </Button>
          ) : (
            <Button asChild size="sm" variant="outline" className="rounded-full px-3 text-xs sm:px-4 sm:text-sm">
              <Link href={loginHref}>Đăng nhập</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
