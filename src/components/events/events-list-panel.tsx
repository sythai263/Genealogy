/**
 * @project AncestorTree
 * @file src/components/events/events-list-panel.tsx
 * @description Filterable event list with optional delete for editors
 * @version 1.0.0
 * @updated 2026-07-18
 */

'use client';

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
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui';
import { QueryBoundary } from '@components/shared';
import { EVENT_TYPE_META, EVENT_TYPE_ORDER, isEventType } from '@constants';
import { cn } from '@lib';
import type { Event, Person } from '@types';
import { CalendarDays, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface EventsListPanelProps {
  events: Event[];
  people: Person[];
  isLoading: boolean;
  isEditor: boolean;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  onDelete: (id: string) => void;
}

export function EventsListPanel({
  events,
  people,
  isLoading,
  isEditor,
  typeFilter,
  onTypeFilterChange,
  onDelete,
}: EventsListPanelProps) {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardDescription>
            {isLoading ? 'Đang tải...' : `${events.length} sự kiện`}
          </CardDescription>
          <Select
            value={typeFilter}
            onValueChange={value => {
              if (value === 'all' || isEventType(value)) {
                onTypeFilterChange(value);
              }
            }}>
            <SelectTrigger className='w-40'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              {EVENT_TYPE_ORDER.map(eventType => (
                <SelectItem key={eventType} value={eventType}>
                  {EVENT_TYPE_META[eventType].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <QueryBoundary
          isLoading={isLoading}
          isEmpty={events.length === 0}
          emptyIcon={CalendarDays}
          emptyTitle='Chưa có sự kiện nào'
          skeletonRows={4}
          surface='plain'>
          <div className='space-y-3'>
            {events.map(event => {
              const typeInfo = EVENT_TYPE_META[event.event_type];
              const TypeIcon = typeInfo.icon;
              const person = event.person_id
                ? people.find(item => item.id === event.person_id)
                : undefined;
              return (
                <div
                  key={event.id}
                  className='flex items-center gap-3 rounded-lg border p-3'>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      typeInfo.color
                    )}>
                    <TypeIcon className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='font-medium'>{event.title}</div>
                    <div className='text-sm text-muted-foreground'>
                      {event.event_lunar && (
                        <span>{event.event_lunar} (ÂL)</span>
                      )}
                      {event.event_date && (
                        <span>
                          {event.event_lunar && ' · '}
                          {new Date(event.event_date).toLocaleDateString(
                            'vi-VN'
                          )}
                        </span>
                      )}
                      {event.location && ` · ${event.location}`}
                      {person && (
                        <>
                          {' · '}
                          <Link
                            href={`/people/${person.id}`}
                            className='hover:underline'>
                            {person.display_name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <div className='flex shrink-0 items-center gap-2'>
                    <Badge variant='outline'>{typeInfo.label}</Badge>
                    {event.recurring && (
                      <Badge variant='secondary' className='text-xs'>
                        Hàng năm
                      </Badge>
                    )}
                    {isEditor && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-destructive'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xóa sự kiện</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa &ldquo;{event.title}
                              &rdquo;? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(event.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
