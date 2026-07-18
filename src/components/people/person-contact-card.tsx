/**
 * @project AncestorTree
 * @file src/components/people/person-contact-card.tsx
 * @description Contact info card for person detail
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui';
import type { Person } from '@types';

interface PersonContactCardProps {
  person: Person;
}

export function PersonContactCard({ person }: PersonContactCardProps) {
  const hasContact =
    !!person.phone ||
    !!person.email ||
    !!person.zalo ||
    !!person.facebook ||
    !!person.address;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Liên hệ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {person.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${person.phone}`}
              className="text-primary hover:underline"
            >
              {person.phone}
            </a>
          </div>
        )}
        {person.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${person.email}`}
              className="text-primary hover:underline"
            >
              {person.email}
            </a>
          </div>
        )}
        {person.zalo && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            <span>Zalo: {person.zalo}</span>
          </div>
        )}
        {person.facebook && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a
              href={person.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Facebook
            </a>
          </div>
        )}
        {person.address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{person.address}</span>
          </div>
        )}
        {!hasContact && (
          <p className="text-muted-foreground">Chưa có thông tin liên hệ</p>
        )}
      </CardContent>
    </Card>
  );
}
