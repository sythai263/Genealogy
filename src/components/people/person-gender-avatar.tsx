/**
 * @project AncestorTree
 * @file src/components/people/person-gender-avatar.tsx
 * @description Small gendered initial avatar — blue for male, pink for
 *              female; shows the last char of the person's name (Vietnamese
 *              given name comes last)
 * @version 1.0.0
 * @updated 2026-10-29
 */

import { cn } from '@lib';

interface PersonGenderAvatarProps {
  gender: number;
  name: string;
  className?: string;
}

export function PersonGenderAvatar({
  gender,
  name,
  className,
}: PersonGenderAvatarProps) {
  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        gender === 1 ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700',
        className
      )}
    >
      {name.slice(-1)}
    </div>
  );
}
