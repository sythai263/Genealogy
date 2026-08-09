/**
 * @project AncestorTree
 * @file src/components/events/events-view.tsx
 * @description Memorial calendar and events page with lunar date support
 * @version 1.0.0
 * @updated 2026-07-27
 */

'use client';

import { useAuth } from '@components/auth';
import { ListPagination } from '@components/shared';
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
import {
  LIST_DEFAULT_PAGE_SIZE,
  MONTHS_VI,
  UPCOMING_EVENTS_WINDOW_DAYS,
  type ListPageSize,
} from '@constants';
import {
  useDeleteEvent,
  useEvents,
  useEventsCalendar,
  usePeopleByIds,
  useResettablePage,
  useUpcomingMemorialPeople,
} from '@hooks';
import {
  formatLunarDate,
  getNextLunarOccurrence,
  parseLunarString,
  solarToLunar,
} from '@lib';
import type { EventType, UpcomingEvent } from '@types';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AddEventDialog } from './add-event-dialog';
import { CalendarGrid } from './calendar-grid';
import { EventsListPanel } from './events-list-panel';
import { UpcomingEventsBanner } from './upcoming-events-banner';

export function EventsView() {
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

  const listItems = listData?.items ?? [];
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

  const upcomingEvents = useMemo<UpcomingEvent[]>(() => {
    if (!events || !people) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const results: UpcomingEvent[] = [];

    for (const event of events) {
      let nextDate: Date | null = null;
      let lunarDisplay = '';

      if (event.event_lunar) {
        const parsed = parseLunarString(event.event_lunar);
        if (parsed) {
          nextDate = getNextLunarOccurrence(parsed.day, parsed.month, now);
          lunarDisplay = formatLunarDate(parsed.day, parsed.month);
        }
      } else if (event.event_date) {
        nextDate = new Date(event.event_date);
        const lunar = solarToLunar(
          nextDate.getDate(),
          nextDate.getMonth() + 1,
          nextDate.getFullYear()
        );
        lunarDisplay = formatLunarDate(lunar.day, lunar.month);
      }

      if (!nextDate) continue;

      const daysUntil = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil > UPCOMING_EVENTS_WINDOW_DAYS) continue;

      const person = event.person_id
        ? people.find(item => item.id === event.person_id)
        : undefined;
      results.push({
        event,
        person,
        nextDate,
        daysUntil,
        lunarDisplay,
        isAuto: false,
      });
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [events, people]);

  const autoGioEvents = useMemo<UpcomingEvent[]>(() => {
    if (!memorialPeople || !events) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const existingPersonIds = new Set(
      events.filter(event => event.person_id).map(event => event.person_id)
    );
    const results: UpcomingEvent[] = [];

    for (const person of memorialPeople) {
      if (
        person.is_living ||
        !person.death_lunar ||
        existingPersonIds.has(person.id)
      ) {
        continue;
      }

      const parsed = parseLunarString(person.death_lunar);
      if (!parsed) continue;

      const nextDate = getNextLunarOccurrence(parsed.day, parsed.month, now);
      const daysUntil = Math.ceil(
        (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil > UPCOMING_EVENTS_WINDOW_DAYS) continue;

      results.push({
        event: {
          id: `gio-auto-${person.id}`,
          title: `Giỗ ${person.display_name}`,
          event_type: 'gio',
          event_lunar: person.death_lunar,
          person_id: person.id,
          recurring: true,
          created_at: new Date().toISOString(),
        },
        person,
        nextDate,
        daysUntil,
        lunarDisplay: formatLunarDate(parsed.day, parsed.month),
        isAuto: true,
      });
    }

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [memorialPeople, events]);

  const allUpcoming = useMemo(() => {
    return [...upcomingEvents, ...autoGioEvents].sort(
      (a, b) => a.daysUntil - b.daysUntil
    );
  }, [upcomingEvents, autoGioEvents]);

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
        toast.success('Đã xóa sự kiện');
      },
      onError: () => {
        toast.error('Lỗi khi xóa sự kiện');
      },
    });
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8 flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50'>
            <Calendar className='h-5 w-5 text-amber-600' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Lịch cúng lễ</h1>
            <p className='text-muted-foreground'>
              Quản lý ngày giỗ, lễ tết và sự kiện dòng họ
            </p>
          </div>
        </div>
        {isEditor && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className='gap-2'>
                <Plus className='h-4 w-4' /> Thêm sự kiện
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Thêm sự kiện mới</DialogTitle>
                <DialogDescription>
                  Thêm ngày giỗ, lễ tết hoặc sự kiện dòng họ
                </DialogDescription>
              </DialogHeader>
              <AddEventDialog onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <UpcomingEventsBanner events={allUpcoming} />

      <Tabs defaultValue='calendar'>
        <TabsList className='mb-4'>
          <TabsTrigger value='calendar'>Lịch</TabsTrigger>
          <TabsTrigger value='list'>Danh sách</TabsTrigger>
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
                  {MONTHS_VI[calendarMonth - 1]} {calendarYear}
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
            itemLabel='sự kiện'
            disabled={listLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
