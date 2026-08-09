/**
 * @project AncestorTree
 * @file src/components/events/events-list-panel.tsx
 * @description Filterable event list with optional delete for editors
 * @version 1.1.0
 * @updated 2026-08-09
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
import type { Event, EventType, Person } from '@types';
import { CalendarDays, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Events');
  const tCommon = useTranslations('Common');

  function typeLabel(eventType: EventType) {
    return t(`types.${eventType}`);
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardDescription>
            {isLoading
              ? tCommon('loading')
              : t('eventCount', { count: events.length })}
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
              <SelectItem value='all'>{tCommon('all')}</SelectItem>
              {EVENT_TYPE_ORDER.map(eventType => (
                <SelectItem key={eventType} value={eventType}>
                  {typeLabel(eventType)}
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
          emptyTitle={t('emptyTitle')}
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
                        <span>
                          {event.event_lunar} {t('lunarSuffix')}
                        </span>
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
                    <Badge variant='outline'>
                      {typeLabel(event.event_type)}
                    </Badge>
                    {event.recurring && (
                      <Badge variant='secondary' className='text-xs'>
                        {t('recurringShort')}
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
                            <AlertDialogTitle>
                              {t('deleteConfirm.titleSimple')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('deleteConfirm.descriptionWithTitle', {
                                title: event.title,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {tCommon('cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(event.id)}
                              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
                              {tCommon('delete')}
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
