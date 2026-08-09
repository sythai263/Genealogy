/**
 * @project AncestorTree
 * @file src/components/directory/directory-table.tsx
 * @description Results table for the family directory
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import type { DirectoryContactDisplay, Person } from '@types';
import { Lock } from 'lucide-react';
import { DirectoryTableRow } from './directory-table-row';

interface DirectoryTableProps {
  people: Person[];
  /** Total matching rows from server (not just current page). */
  total: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  getContact: (person: Person) => DirectoryContactDisplay;
}

export function DirectoryTable({
  people,
  total,
  isLoading,
  isAuthenticated,
  getContact,
}: DirectoryTableProps) {
  const t = useTranslations('Directory');
  const tCommon = useTranslations('Common');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription>
            {isLoading
              ? tCommon('loading')
              : t('memberCount', { count: total })}
          </CardDescription>
          {!isAuthenticated && (
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              {t('loginPrompt')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : people.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            {t('noResults')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-50">{t('fields.name')}</TableHead>
                  <TableHead className="min-w-15">
                    {t('fields.generation')}
                  </TableHead>
                  <TableHead className="min-w-35">{t('fields.phone')}</TableHead>
                  <TableHead className="min-w-45">{t('fields.email')}</TableHead>
                  <TableHead className="min-w-50">
                    {t('fields.address')}
                  </TableHead>
                  <TableHead className="min-w-20">{t('fields.links')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <DirectoryTableRow
                    key={person.id}
                    person={person}
                    contact={getContact(person)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
