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
import { toast } from 'sonner';
import {
  Button,
  Checkbox,
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
import { usePerson } from '@hooks';
import { parseLunarString } from '@lib';
import { PersonCombobox } from '@components/people';
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
  // undefined = fall back to the event's linked person; null = user cleared it
  const [personOverride, setPersonOverride] = useState<Person | null>();

  // Resolve initial person if editing
  const { data: initialPerson } = usePerson(event?.person_id);

  const resolvedPerson =
    personOverride !== undefined ? personOverride : (initialPerson ?? null);

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

  function handlePersonChange(person: Person | null) {
    setPersonOverride(person);
    if (person && eventType === 'gio' && !title) {
      setTitle(t('autoGioTitle', { name: person.display_name }));
      if (person.death_lunar) {
        setEventLunar(person.death_lunar);
        setLunarError('');
      }
    }
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

      <PersonCombobox
        label={t('form.relatedPersonOptional')}
        placeholder={t('form.searchPerson')}
        selected={resolvedPerson}
        onSelect={handlePersonChange}
      />

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
        <Checkbox
          id='recurring'
          checked={recurring}
          onCheckedChange={checked => setRecurring(checked === true)}
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
