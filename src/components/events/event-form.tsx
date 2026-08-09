/**
 * @project AncestorTree
 * @file src/components/events/event-form.tsx
 * @description Event create/edit form with person search and lunar validation
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { EVENT_TYPE_ORDER } from '@constants';
import { usePerson, useSearchPeople } from '@hooks';
import { parseLunarString } from '@lib';
import type { CreateEventInput, Event, EventType, Person } from '@types';

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventInput) => void;
  isPending: boolean;
}

export function EventForm({ event, onSubmit, isPending }: EventFormProps) {
  const t = useTranslations('Events');
  const tCommon = useTranslations('Common');
  const [eventType, setEventType] = useState<EventType>(
    event?.event_type || 'gio'
  );
  const [title, setTitle] = useState(event?.title || '');
  const [eventLunar, setEventLunar] = useState(event?.event_lunar || '');
  const [lunarError, setLunarError] = useState('');
  const [eventDate, setEventDate] = useState(event?.event_date || '');
  const [location, setLocation] = useState(event?.location || '');
  const [description, setDescription] = useState(event?.description || '');
  const [recurring, setRecurring] = useState(event?.recurring ?? true);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personQuery, setPersonQuery] = useState('');
  const [personDropOpen, setPersonDropOpen] = useState(false);

  // Resolve initial person if editing
  const { data: initialPerson } = usePerson(event?.person_id);

  const resolvedPerson = selectedPerson ?? initialPerson ?? null;

  const { data: searchResults, isFetching } = useSearchPeople(personQuery);

  function validateLunar(value: string) {
    setEventLunar(value);
    if (!value) {
      setLunarError('');
      return;
    }
    setLunarError(
      parseLunarString(value) ? '' : t('form.lunarFormatError')
    );
  }

  function handleSelectPerson(person: Person) {
    setSelectedPerson(person);
    setPersonQuery('');
    setPersonDropOpen(false);
    if (eventType === 'gio' && !title) {
      setTitle(t('autoGioTitle', { name: person.display_name }));
      if (person.death_lunar) {
        setEventLunar(person.death_lunar);
        setLunarError('');
      }
    }
  }

  function handleClearPerson() {
    setSelectedPerson(null);
    setPersonQuery('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t('toasts.titleRequired'));
      return;
    }
    if (eventLunar && !parseLunarString(eventLunar)) {
      toast.error(t('toasts.lunarInvalid'));
      return;
    }
    onSubmit({
      title: title.trim(),
      event_type: eventType,
      person_id: resolvedPerson?.id || undefined,
      event_lunar: eventLunar || undefined,
      event_date: eventDate || undefined,
      location: location || undefined,
      description: description || undefined,
      recurring,
    });
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <Label>{t('form.typeRequired')}</Label>
        <Select
          value={eventType}
          onValueChange={v => setEventType(v as EventType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPE_ORDER.map(type => (
              <SelectItem key={type} value={type}>
                {t(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t('form.titleRequired')}</Label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('form.titlePlaceholder')}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label>{t('form.lunarDateFormat')}</Label>
          <Input
            value={eventLunar}
            onChange={e => validateLunar(e.target.value)}
            placeholder={t('form.lunarDateHint')}
            className={lunarError ? 'border-destructive' : ''}
          />
          {lunarError && (
            <p className='text-xs text-destructive mt-1'>{lunarError}</p>
          )}
        </div>
        <div>
          <Label>{t('form.solarDate')}</Label>
          <Input
            type='date'
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>{t('form.relatedPersonOptional')}</Label>
        {resolvedPerson ? (
          <div className='flex items-center gap-2 p-2 rounded-md border bg-muted/50 mt-1'>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                resolvedPerson.gender === 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-pink-100 text-pink-700'
              }`}>
              {resolvedPerson.display_name.slice(-1)}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>
                {resolvedPerson.display_name}
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('form.generation', {
                  generation: resolvedPerson.generation,
                })}
              </p>
            </div>
            <Button
              variant='ghost'
              size='sm'
              type='button'
              className='h-7 w-7 p-0 shrink-0'
              onClick={handleClearPerson}>
              <X className='h-3 w-3' />
            </Button>
          </div>
        ) : (
          <div className='relative mt-1'>
            <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={t('form.searchPerson')}
              value={personQuery}
              onChange={e => {
                setPersonQuery(e.target.value);
                setPersonDropOpen(e.target.value.length >= 2);
              }}
              onFocus={() => personQuery.length >= 2 && setPersonDropOpen(true)}
              onBlur={() => setTimeout(() => setPersonDropOpen(false), 150)}
              className='pl-9'
            />
            {personDropOpen && (
              <div className='absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-52 overflow-y-auto'>
                {isFetching ? (
                  <p className='p-3 text-sm text-muted-foreground'>
                    {t('form.searching')}
                  </p>
                ) : !searchResults?.length ? (
                  <p className='p-3 text-sm text-muted-foreground'>
                    {t('form.noPersonFound')}
                  </p>
                ) : (
                  searchResults.map(person => (
                    <button
                      key={person.id}
                      type='button'
                      className='w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent transition-colors'
                      onMouseDown={e => {
                        e.preventDefault();
                        handleSelectPerson(person);
                      }}>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                          person.gender === 1
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                        {person.display_name.slice(-1)}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium truncate'>
                          {person.display_name}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {t('form.generation', {
                            generation: person.generation,
                          })}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label>{t('form.location')}</Label>
        <Input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder={t('form.locationPlaceholder')}
        />
      </div>

      <div>
        <Label>{t('form.notes')}</Label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder={t('form.descriptionPlaceholder')}
        />
      </div>

      <div className='flex items-center gap-2'>
        <input
          type='checkbox'
          id='recurring'
          checked={recurring}
          onChange={e => setRecurring(e.target.checked)}
          className='rounded border-gray-300'
        />
        <Label htmlFor='recurring' className='font-normal'>
          {t('form.recurring')}
        </Label>
      </div>

      <Button type='submit' disabled={isPending} className='w-full'>
        {isPending
          ? tCommon('saving')
          : event
            ? tCommon('update')
            : t('addNew')}
      </Button>
    </form>
  );
}
