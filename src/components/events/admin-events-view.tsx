/**
 * @project AncestorTree
 * @file src/components/events/admin-events-view.tsx
 * @description Admin event management — full CRUD for lịch sự kiện
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useMemo, useState } from 'react';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import {
  AccessDenied,
  ListPagination,
  QueryBoundary,
} from '@components/shared';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import {
  EVENT_TYPE_META,
  EVENT_TYPE_OPTIONS,
  LIST_DEFAULT_PAGE_SIZE,
  type ListPageSize,
} from '@constants';
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  usePeopleByIds,
  useResettablePage,
  useUpdateEvent,
} from '@hooks';
import type { CreateEventInput, Event, EventType, Person } from '@types';
import { EventForm } from './event-form';

export function AdminEventsView() {
  const { isEditor } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | undefined>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [pageSize, setPageSize] = useState<ListPageSize>(LIST_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useResettablePage(`${search}|${typeFilter}|${pageSize}`);

  const { data, isLoading } = useEvents({
    type: typeFilter === 'all' ? undefined : typeFilter,
    search: search || undefined,
    page,
    pageSize,
  });
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  const personIds = useMemo(
    () => [...new Set(items.map((ev) => ev.person_id).filter((id): id is string => Boolean(id)))],
    [items]
  );
  const { data: people } = usePeopleByIds(personIds);
  const peopleMap = useMemo(() => {
    const map = new Map<string, Person>();
    for (const p of people || []) map.set(p.id, p);
    return map;
  }, [people]);

  if (!isEditor) {
    return <AccessDenied />;
  }

  async function handleCreate(data: CreateEventInput) {
    try {
      await createMutation.mutateAsync(data);
      toast.success('Đã thêm sự kiện');
      setDialogOpen(false);
    } catch {
      toast.error('Lỗi khi thêm sự kiện');
    }
  }

  async function handleUpdate(data: CreateEventInput) {
    if (!editingItem) return;
    try {
      await updateMutation.mutateAsync({ id: editingItem.id, input: data });
      toast.success('Đã cập nhật sự kiện');
      setDialogOpen(false);
      setEditingItem(undefined);
    } catch {
      toast.error('Lỗi khi cập nhật');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Đã xóa sự kiện');
    } catch {
      toast.error('Lỗi khi xóa');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Lịch sự kiện</h1>
          <p className="text-muted-foreground">Thêm, sửa, xóa ngày giỗ và sự kiện dòng họ</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingItem(undefined); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Thêm sự kiện</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}</DialogTitle>
            </DialogHeader>
            <EventForm
              key={editingItem?.id || 'new'}
              event={editingItem}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              isPending={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Tìm kiếm theo tiêu đề..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as EventType | 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Lọc loại sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {EVENT_TYPE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <QueryBoundary
        isLoading={isLoading}
        isEmpty={items.length === 0}
        emptyIcon={Calendar}
        emptyTitle={
          search || typeFilter !== 'all'
            ? 'Không tìm thấy sự kiện phù hợp'
            : 'Chưa có sự kiện nào'
        }
        skeletonRows={3}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {items.map(ev => {
              const typeInfo = EVENT_TYPE_META[ev.event_type];
              const TypeIcon = typeInfo.icon;
              const person = ev.person_id ? peopleMap.get(ev.person_id) : undefined;
              return (
                <Card key={ev.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${typeInfo.color}`}>
                        <TypeIcon className="h-3 w-3" />
                        {typeInfo.label}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ev.event_lunar && `${ev.event_lunar} ÂL`}
                          {ev.event_lunar && ev.event_date && ' · '}
                          {ev.event_date && new Date(ev.event_date).toLocaleDateString('vi-VN')}
                          {person && ` · ${person.display_name}`}
                          {ev.recurring && ' · Hàng năm'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => { setEditingItem(ev); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa sự kiện?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xóa &quot;{ev.title}&quot;. Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(ev.id)}>Xóa</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel="sự kiện"
          />
        </div>
      </QueryBoundary>
    </div>
  );
}
