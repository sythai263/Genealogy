/**
 * @project AncestorTree
 * @file src/components/documents/document-form.tsx
 * @description Form for creating and editing clan documents
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PersonCombobox } from '@components/people';
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
import { DOCUMENT_CATEGORY_ORDER, DOCUMENT_PRIVACY_LEVELS } from '@constants';
import { usePerson } from '@hooks';
import { formatFileSize } from '@lib';
import type {
  ClanDocument,
  CreateClanDocumentInput,
  DocumentCategory,
  Person,
} from '@types';

const PRIVACY_DETAIL_KEYS = [
  'privacy.publicDetail',
  'privacy.membersDetail',
  'privacy.internalDetail',
] as const;

interface DocumentFormProps {
  document?: ClanDocument;
  onSubmit: (data: CreateClanDocumentInput, file?: File) => void;
  isPending: boolean;
}

export function DocumentForm({
  document: doc,
  onSubmit,
  isPending,
}: DocumentFormProps) {
  const t = useTranslations('Documents');
  const tCommon = useTranslations('Common');
  const { data: loadedPerson } = usePerson(doc?.person_id);
  const [title, setTitle] = useState(doc?.title || '');
  const [category, setCategory] = useState<DocumentCategory>(
    doc?.category || 'khac'
  );
  const [description, setDescription] = useState(doc?.description || '');
  const [tags, setTags] = useState(doc?.tags || '');
  // `undefined` = user has not touched the picker yet, so fall back to the
  // person loaded from the document being edited.
  const [pickedPerson, setPickedPerson] = useState<Person | null | undefined>();
  const [privacyLevel, setPrivacyLevel] = useState(doc?.privacy_level ?? 1);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPerson =
    pickedPerson !== undefined ? pickedPerson : (loadedPerson ?? null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error(t('toasts.titleRequired'));
      return;
    }
    if (!doc && !file) {
      toast.error(t('toasts.fileRequired'));
      return;
    }
    onSubmit(
      {
        title,
        category,
        description: description || undefined,
        tags: tags || undefined,
        person_id: selectedPerson?.id ?? undefined,
        file_url: doc?.file_url || '',
        file_type: file?.type || doc?.file_type,
        file_size: file?.size || doc?.file_size,
        privacy_level: privacyLevel,
      },
      file || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>{t('form.titleRequired')}</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('form.titlePlaceholder')}
        />
      </div>
      {!doc && (
        <div>
          <Label>{t('form.fileRequired')}</Label>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.mp4,.webm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          {file && (
            <p className="mt-1 text-xs text-muted-foreground">
              {file.name} ({formatFileSize(file.size)})
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{t('form.category')}</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as DocumentCategory)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_CATEGORY_ORDER.map((value) => (
                <SelectItem key={value} value={value}>
                  {t(`categories.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <PersonCombobox
            label={t('form.relatedPerson')}
            selected={selectedPerson}
            onSelect={setPickedPerson}
          />
        </div>
      </div>
      <div>
        <Label>{t('form.description')}</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder={t('form.descriptionPlaceholder')}
        />
      </div>
      <div>
        <Label>{t('form.tags')}</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t('form.tagsPlaceholder')}
        />
      </div>
      <div>
        <Label>{t('form.privacy')}</Label>
        <Select
          value={privacyLevel.toString()}
          onValueChange={(v) => setPrivacyLevel(parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_PRIVACY_LEVELS.map((level) => (
              <SelectItem key={level} value={level.toString()}>
                {t(PRIVACY_DETAIL_KEYS[level])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending
          ? tCommon('saving')
          : doc
            ? tCommon('update')
            : tCommon('upload')}
      </Button>
    </form>
  );
}
