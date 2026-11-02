/**
 * @project AncestorTree
 * @file src/components/names/admin-names-view.tsx
 * @description Admin name-dictionary manager — pending/approved tabs,
 *              search, approve, add, edit, delete
 * @version 1.0.0
 * @updated 2026-10-30
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui';
import {
  useAdminNames,
  useApproveName,
  useDeleteName,
  useResettablePage,
} from '@hooks';
import { cn } from '@lib';
import type { AdminNameFilters } from '@lib';
import type { NameEntry, NameStatus } from '@types';
import { NameFormDialog } from './name-form-dialog';
import { NameDeleteDialog } from './name-delete-dialog';

export function AdminNamesView() {
  const t = useTranslations('Names');
  const [status, setStatus] = useState<NameStatus | 'all'>('pending');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useResettablePage(`${status}-${keyword}`);
  const [editTarget, setEditTarget] = useState<NameEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NameEntry | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filters: AdminNameFilters = {
    status: status === 'all' ? undefined : status,
    keyword: keyword || undefined,
    page,
    pageSize: 30,
  };
  const { data, isLoading } = useAdminNames(filters);
  const approve = useApproveName();
  const remove = useDeleteName();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 30));

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
          <p className="text-muted-foreground">{t('admin.subtitle')}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('admin.add')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('search.placeholder')}
            className="pl-8"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as NameStatus | 'all')}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">{t('admin.pending')}</SelectItem>
            <SelectItem value="approved">{t('admin.approved')}</SelectItem>
            <SelectItem value="all">{t('admin.all')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('contribute.name')}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t('contribute.gender')}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t('contribute.meaning')}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t('admin.contributor')}
                  </TableHead>
                  <TableHead>{t('admin.pending')}</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {item.gender === 'both'
                        ? t('card.both')
                        : t(`filters.${item.gender}`)}
                    </TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell">
                      {item.meanings.map((m) => m.meaning).join(' · ') ||
                        '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {item.contributor_name ?? t('admin.anonymous')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          item.status === 'pending' &&
                            'border-amber-400 text-amber-600 dark:text-amber-400'
                        )}
                      >
                        {t(`admin.${item.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {item.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600"
                            disabled={approve.isPending}
                            onClick={() => approve.mutate(item.id)}
                            aria-label={t('admin.approve')}
                            title={t('admin.approve')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditTarget(item)}
                          aria-label={t('admin.edit')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          aria-label={t('admin.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-muted-foreground"
                    >
                      {t('search.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            ‹
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            ›
          </Button>
        </div>
      )}

      <NameFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        target={null}
      />
      {editTarget && (
        <NameFormDialog
          open
          onOpenChange={(o) => !o && setEditTarget(null)}
          target={editTarget}
        />
      )}
      <NameDeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget &&
          remove.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        isPending={remove.isPending}
      />
    </div>
  );
}
