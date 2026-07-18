/**
 * @project AncestorTree
 * @file src/components/people/person-birth-death-card.tsx
 * @description Birth/death info card for person detail
 * @version 1.0.0
 * @updated 2026-07-18
 */

import { Calendar, MapPin } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@components/ui';
import { getZodiacYear } from '@types';
import type { Person } from '@types';

interface PersonBirthDeathCardProps {
  person: Person;
}

export function PersonBirthDeathCard({ person }: PersonBirthDeathCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Thông tin sinh/mất</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="mb-1 text-sm font-medium text-muted-foreground">
            Ngày sinh
          </h4>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {person.birth_date || person.birth_year || 'Chưa rõ'}
              {person.birth_year && ` (${getZodiacYear(person.birth_year)})`}
            </span>
          </div>
          {person.birth_place && (
            <div className="mt-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{person.birth_place}</span>
            </div>
          )}
        </div>

        {!person.is_living && (
          <>
            <Separator />
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Ngày mất
              </h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {person.death_date || person.death_year || 'Chưa rõ'}
                  {person.death_lunar &&
                    ` (Âm lịch: ${person.death_lunar})`}
                </span>
              </div>
              {person.death_place && (
                <div className="mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{person.death_place}</span>
                </div>
              )}
            </div>
          </>
        )}

        {person.hometown && (
          <>
            <Separator />
            <div>
              <h4 className="mb-1 text-sm font-medium text-muted-foreground">
                Quê quán
              </h4>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{person.hometown}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
