/**
 * @project AncestorTree
 * @file src/components/people/avatar-upload.tsx
 * @description Avatar component with upload capability
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui';
import { useUpdatePerson } from '@hooks';
import { uploadFile } from '@lib';
import type { Person } from '@types';

interface AvatarUploadProps {
  person: Person;
  canEdit: boolean;
  size?: 'sm' | 'lg';
}

export function AvatarUpload({
  person,
  canEdit,
  size = 'lg',
}: AvatarUploadProps) {
  const t = useTranslations('People');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdatePerson();

  const sizeClass = size === 'lg' ? 'h-24 w-24' : 'h-14 w-14';
  const iconSize = size === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
  const textSize = size === 'lg' ? 'text-2xl' : 'text-base';

  const initials = person.display_name
    .split(' ')
    .map((n) => n[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const genderColor =
    person.gender === 1 ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file, person.id, 'avatar');
      await updateMutation.mutateAsync({
        id: person.id,
        input: { avatar_url: url },
      });
      toast.success(t('avatar.updateSuccess'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('avatar.uploadError')
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="group relative">
      <Avatar className={sizeClass}>
        <AvatarImage src={person.avatar_url} alt={person.display_name} />
        <AvatarFallback className={`${genderColor} ${textSize}`}>
          {initials || <User className={iconSize} />}
        </AvatarFallback>
      </Avatar>

      {canEdit && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </button>
        </>
      )}
    </div>
  );
}
