/**
 * @project AncestorTree
 * @file src/components/names/name-card.tsx
 * @description Single name card — given name, gender + word-count badges,
 *              meaning, and the full-name preview with the chosen prefix
 * @version 1.0.0
 * @updated 2026-10-30
 */

import { useTranslations } from 'next-intl';
import { Badge, Card, CardContent } from '@components/ui';
import { cn } from '@lib';
import type { NameEntry } from '@types';

interface NameCardProps {
  entry: NameEntry;
  prefix: string;
}

export function NameCard({ entry, prefix }: NameCardProps) {
  const t = useTranslations('Names');

  return (
    <Card className="h-full">
      <CardContent className="space-y-2 pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-base font-bold text-foreground">
            {entry.name}
          </span>
          <div className="flex shrink-0 gap-1">
            <Badge
              variant="secondary"
              className={cn(
                entry.gender === 'male' && 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
                entry.gender === 'female' && 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
                entry.gender === 'both' && 'bg-muted text-muted-foreground'
              )}
            >
              {entry.gender === 'both'
                ? t('card.both')
                : t(`filters.${entry.gender}`)}
            </Badge>
            <Badge variant="outline">
              {entry.name_word_count === 1
                ? t('card.words3')
                : t('card.words4')}
            </Badge>
          </div>
        </div>
        {entry.meanings.length > 0 ? (
          <ul className="space-y-1">
            {entry.meanings.map((m) => (
              <li
                key={m.id}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {entry.meanings.length > 1 && '· '}
                {m.meaning}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('card.noMeaning')}
          </p>
        )}
        {prefix.trim() && (
          <p className="text-xs text-muted-foreground/80">
            {t('prefix.preview')}:{' '}
            <span className="font-medium text-foreground">
              {prefix.trim()} {entry.name}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
