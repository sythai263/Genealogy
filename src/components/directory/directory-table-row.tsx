/**
 * @project AncestorTree
 * @file src/components/directory/directory-table-row.tsx
 * @description Single row in the family directory table
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Badge, TableCell, TableRow } from '@components/ui';
import { DIRECTORY_GENDER_LABELS } from '@constants';
import { cn } from '@lib';
import type { DirectoryContactDisplay, Person } from '@types';
import { ExternalLink, EyeOff, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

interface DirectoryTableRowProps {
  person: Person;
  contact: DirectoryContactDisplay;
}

function MaskedCell() {
  return (
    <span className='flex items-center gap-1 text-sm text-muted-foreground'>
      <EyeOff className='h-3 w-3' /> Ẩn
    </span>
  );
}

export function DirectoryTableRow({ person, contact }: DirectoryTableRowProps) {
  const genderLabel =
    person.gender === 1 || person.gender === 2
      ? DIRECTORY_GENDER_LABELS[person.gender]
      : '—';

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/people/${person.id}`}
          className='flex items-center gap-3 hover:underline'>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white',
              person.gender === 1 ? 'bg-blue-500' : 'bg-pink-500'
            )}>
            {person.display_name.charAt(person.display_name.length - 1)}
          </div>
          <div>
            <div className='font-medium'>{person.display_name}</div>
            <div className='text-xs text-muted-foreground'>
              {genderLabel}
              {!person.is_living && ' · Đã mất'}
            </div>
          </div>
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant='outline'>{person.generation}</Badge>
      </TableCell>
      <TableCell>
        {contact.masked ? (
          <MaskedCell />
        ) : contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className='flex items-center gap-1 text-sm hover:underline'>
            <Phone className='h-3 w-3 text-muted-foreground' />
            {contact.phone}
          </a>
        ) : (
          <span className='text-sm text-muted-foreground'>—</span>
        )}
      </TableCell>
      <TableCell>
        {contact.masked ? (
          <MaskedCell />
        ) : contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className='flex items-center gap-1 text-sm hover:underline'>
            <Mail className='h-3 w-3 text-muted-foreground' />
            {contact.email}
          </a>
        ) : (
          <span className='text-sm text-muted-foreground'>—</span>
        )}
      </TableCell>
      <TableCell>
        {contact.masked ? (
          <MaskedCell />
        ) : contact.address ? (
          <span className='flex items-center gap-1 text-sm'>
            <MapPin className='h-3 w-3 shrink-0 text-muted-foreground' />
            <span className='max-w-45 truncate'>{contact.address}</span>
          </span>
        ) : (
          <span className='text-sm text-muted-foreground'>—</span>
        )}
      </TableCell>
      <TableCell>
        {contact.masked ? (
          <MaskedCell />
        ) : (
          <div className='flex gap-2'>
            {contact.zalo && (
              <Badge variant='secondary' className='text-xs'>
                Zalo
              </Badge>
            )}
            {contact.facebook && (
              <a
                href={contact.facebook}
                target='_blank'
                rel='noopener noreferrer'>
                <Badge variant='secondary' className='gap-1 text-xs'>
                  FB <ExternalLink className='h-2.5 w-2.5' />
                </Badge>
              </a>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
