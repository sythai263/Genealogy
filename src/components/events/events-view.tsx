/**
 * @project AncestorTree
 * @file src/components/events/events-view.tsx
 * @description Memorial calendar and events page with lunar date support —
 *              upcoming-events computation lives in useUpcomingEvents
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@components/auth';
import { ListPagination, PageHeader } from '@components/shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import { LIST_DEFAULT_PAGE_SIZE, type ListPageSize } from '@constants';
import {
  useDeleteEvent,
  useEvents,
  useEventsCalendar,
  usePeopleByIds,
  useResettablePage,
  useUpcomingEvents,
  useUpcomingMemorialPeople,
} from '@hooks';
import type { EventType } from '@types';
import { AddEventDialog } from './add-event-dialog';
import { CalendarGrid } from './calendar-grid';
import { EventsListPanel } from './events-list-panel';
import { UpcomingEventsBanner } from './upcoming-events-banner';

export function EventsView() {
  const t = useTranslations('Events');
  const { data: events, isLoading: eventsLoading } = useEventsCalendar();
  const { data: memorialPeople, isLoading: memorialLoading } =
    useUpcomingMemorialPeople();
  const { isEditor } = useAuth();
  const deleteEvent = useDeleteEvent();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [pageSize, setPageSize] = useState<ListPageSize>(
    LIST_DEFAULT_PAGE_SIZE
  );
  const [page, setPage] = useResettablePage(`${typeFilter}|${pageSize}`);

  const listType = typeFilter === 'all' ? undefined : (typeFilter as EventType);
  const { data: listData, isLoading: listLoading } = useEvents({
    type: listType,
    page,
    pageSize,
  });

  const listItems = useMemo(() => listData?.items ?? [], [listData]);
  const listTotal = listData?.total ?? 0;

  // Name map covers only the person ids actually referenced by loaded events —
  // never the full people table.
  const personIds = useMemo(() => {
    const ids = new Set<string>();
    for (const event of events ?? []) {
      if (event.person_id) ids.add(event.person_id);
    }
    for (const event of listItems) {
      if (event.person_id) ids.add(event.person_id);
    }
    return [...ids];
  }, [events, listItems]);
  const { data: people, isLoading: peopleLoading } = usePeopleByIds(personIds);

  const isLoading = eventsLoading || peopleLoading || memorialLoading;

  const allUpcoming = useUpcomingEvents({
    events,
    people,
    memorialPeople,
  });

  function navigateMonth(direction: number) {
    let month = calendarMonth + direction;
    let year = calendarYear;
    if (month > 12) {
      month = 1;
      year++;
    }
    if (month < 1) {
      month = 12;
      year--;
    }
    setCalendarMonth(month);
    setCalendarYear(year);
  }

  function handleDelete(id: string) {
    deleteEvent.mutate(id, {
      onSuccess: () => {
        toast.success(t('toasts.deleteSuccess'));
      },
      onError: () => {
        toast.error(t('toasts.deleteError'));
      },
    });
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <PageHeader
        className='mb-8'
        icon={Calendar}
        title={t('title')}
        description={t('description')}
        actions={
          isEditor && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' /> {t('add')}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <DialogHeader>
                  <DialogTitle>{t('addDialogTitle')}</DialogTitle>
                  <DialogDescription>
                    {t('addDialogDescription')}
                  </DialogDescription>
                </DialogHeader>
                <AddEventDialog onClose={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <UpcomingEventsBanner events={allUpcoming} />

      <Tabs defaultValue='calendar'>
        <TabsList className='mb-4'>
          <TabsTrigger value='calendar'>{t('tabs.calendar')}</TabsTrigger>
          <TabsTrigger value='list'>{t('tabs.list')}</TabsTrigger>
        </TabsList>

        <TabsContent value='calendar'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => navigateMonth(-1)}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <CardTitle className='text-base'>
                  {t(`months.m${calendarMonth}` as 'months.m1')} {calendarYear}
                </CardTitle>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => navigateMonth(1)}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-100 w-full' />
              ) : (
                <CalendarGrid
                  month={calendarMonth}
                  year={calendarYear}
                  events={events || []}
                  people={people || []}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='list' className='space-y-4'>
          <EventsListPanel
            events={listItems}
            people={people || []}
            isLoading={isLoading || listLoading}
            isEditor={!!isEditor}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            onDelete={handleDelete}
          />
          <ListPagination
            page={page}
            pageSize={pageSize}
            total={listTotal}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            itemLabel={t('itemLabel')}
            disabled={listLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
