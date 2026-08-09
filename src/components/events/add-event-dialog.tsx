/**
 * @project AncestorTree
 * @file src/components/events/add-event-dialog.tsx
 * @description Dialog form for adding new events
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { EVENT_TYPE_ORDER } from '@constants';
import {
  Button,
  Checkbox,
  DialogFooter,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { useCreateEvent, useSearchPeople } from '@hooks';
import { parseLunarString, cn } from '@lib';
import type { EventType, Person } from '@types';

interface AddEventDialogProps {
  onClose: () => void;
}

export function AddEventDialog({ onClose }: AddEventDialogProps) {
  const t = useTranslations('Events');
  const tCommon = useTranslations('Common');
  const createEvent = useCreateEvent();
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('gio');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personQuery, setPersonQuery] = useState('');
  const [personDropOpen, setPersonDropOpen] = useState(false);
  const [eventLunar, setEventLunar] = useState('');
  const [lunarError, setLunarError] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(true);

  const { data: searchResults, isFetching } = useSearchPeople(personQuery);
  const filteredResults = (searchResults ?? []).filter(
    person => !person.is_living
  );

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

    if (eventType === 'gio') {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error(t('toasts.titleRequired'));
      return;
    }

    if (eventLunar && !parseLunarString(eventLunar)) {
      toast.error(t('toasts.lunarInvalid'));
      return;
    }

    try {
      await createEvent.mutateAsync({
        title: title.trim(),
        event_type: eventType,
        person_id: selectedPerson?.id,
        event_lunar: eventLunar || undefined,
        event_date: eventDate || undefined,
        location: location || undefined,
        description: description || undefined,
        recurring,
      });
      toast.success(t('toasts.addSuccess'));
      onClose();
    } catch {
      toast.error(t('toasts.addError'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label>{t('form.type')}</Label>
        <Select
          value={eventType}
          onValueChange={value => setEventType(value as EventType)}>
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

      {eventType === 'gio' && (
        <div className='space-y-2'>
          <Label>{t('form.memorialPerson')}</Label>
          {selectedPerson ? (
            <div className='flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2'>
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  selectedPerson.gender === 1
                    ? 'bg-primary/10 text-primary'
                    : 'bg-secondary text-secondary-foreground'
                )}>
                {selectedPerson.display_name.slice(-1)}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>
                  {selectedPerson.display_name}
                </p>
                <p className='text-xs text-muted-foreground'>
                  {selectedPerson.death_lunar
                    ? t('form.memorialLunar', {
                        date: selectedPerson.death_lunar,
                      })
                    : t('form.generation', {
                        generation: selectedPerson.generation,
                      })}
                </p>
              </div>
              <Button
                variant='ghost'
                size='icon-sm'
                type='button'
                className='shrink-0'
                onClick={handleClearPerson}
                aria-label={t('form.clearMemorialPerson')}>
                <X className='size-3' />
              </Button>
            </div>
          ) : (
            <div className='relative'>
              <Search className='absolute top-2.5 left-3 size-4 text-muted-foreground' />
              <Input
                placeholder={t('form.searchPerson')}
                value={personQuery}
                onChange={e => {
                  setPersonQuery(e.target.value);
                  setPersonDropOpen(e.target.value.length >= 2);
                }}
                onFocus={() => {
                  if (personQuery.length >= 2) {
                    setPersonDropOpen(true);
                  }
                }}
                onBlur={() => setTimeout(() => setPersonDropOpen(false), 150)}
                className='pl-9'
              />
              {personDropOpen && (
                <div className='absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md'>
                  {isFetching ? (
                    <p className='p-3 text-sm text-muted-foreground'>
                      {t('form.searching')}
                    </p>
                  ) : filteredResults.length === 0 ? (
                    <p className='p-3 text-sm text-muted-foreground'>
                      {personQuery.length >= 2
                        ? t('form.noDeceasedFound')
                        : t('form.minChars')}
                    </p>
                  ) : (
                    filteredResults.map(person => (
                      <button
                        key={person.id}
                        type='button'
                        className='flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground'
                        onMouseDown={e => {
                          e.preventDefault();
                          handleSelectPerson(person);
                        }}>
                        <div
                          className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                            person.gender === 1
                              ? 'bg-primary/10 text-primary'
                              : 'bg-secondary text-secondary-foreground'
                          )}>
                          {person.display_name.slice(-1)}
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium'>
                            {person.display_name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {t('form.generation', {
                              generation: person.generation,
                            })}
                            {person.death_lunar
                              ? ` · ${t('form.memorialLunar', {
                                  date: person.death_lunar,
                                })}`
                              : ''}
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
      )}

      <div className='space-y-2'>
        <Label htmlFor='title'>{t('form.title')}</Label>
        <Input
          id='title'
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('form.titlePlaceholderShort')}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='lunar'>{t('form.lunarDateFormat')}</Label>
          <Input
            id='lunar'
            value={eventLunar}
            onChange={e => validateLunar(e.target.value)}
            placeholder={t('form.lunarDateHint')}
            className={cn(lunarError && 'border-destructive')}
            aria-invalid={Boolean(lunarError)}
            aria-describedby={lunarError ? 'lunar-error' : undefined}
          />
          {lunarError && (
            <p id='lunar-error' className='text-xs text-destructive'>
              {lunarError}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <Label htmlFor='date'>{t('form.solarDate')}</Label>
          <Input
            id='date'
            type='date'
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='location'>{t('form.location')}</Label>
        <Input
          id='location'
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder={t('form.locationPlaceholderShort')}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='desc'>{t('form.notes')}</Label>
        <Textarea
          id='desc'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className='flex items-center gap-2'>
        <Checkbox
          id='recurring'
          checked={recurring}
          onCheckedChange={checked => setRecurring(checked === true)}
        />
        <Label htmlFor='recurring' className='font-normal'>
          {t('form.recurring')}
        </Label>
      </div>

      <DialogFooter>
        <Button type='button' variant='outline' onClick={onClose}>
          {tCommon('cancel')}
        </Button>
        <Button type='submit' disabled={createEvent.isPending}>
          {createEvent.isPending ? tCommon('saving') : t('add')}
        </Button>
      </DialogFooter>
    </form>
  );
}
