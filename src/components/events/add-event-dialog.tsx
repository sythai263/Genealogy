/**
 * @project AncestorTree
 * @file src/components/events/add-event-dialog.tsx
 * @description Dialog form for adding new events
 * @version 1.2.0
 * @updated 2026-08-09
 */

'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';

import { EVENT_TYPE_ORDER } from '@constants';
import { PersonCombobox } from '@components/people';
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
import { useCreateEvent } from '@hooks';
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
  const [eventLunar, setEventLunar] = useState('');
  const [lunarError, setLunarError] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(true);

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
    setSelectedPerson(person);

    if (person && eventType === 'gio') {
      setTitle(t('autoGioTitle', { name: person.display_name }));
      if (person.death_lunar) {
        setEventLunar(person.death_lunar);
        setLunarError('');
      }
    }
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
        <PersonCombobox
          label={t('form.memorialPerson')}
          placeholder={t('form.searchPerson')}
          emptyMessage={t('form.noDeceasedFound')}
          deceasedOnly
          selected={selectedPerson}
          onSelect={handlePersonChange}
        />
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
