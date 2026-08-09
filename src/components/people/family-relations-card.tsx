/**
 * @project AncestorTree
 * @file src/components/people/family-relations-card.tsx
 * @description Card showing family relations (parents, siblings, spouse, children) for a person
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Plus, Search, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@components/ui';
import {
  useAddChildToFamilyMutation,
  useCreatePerson,
  useCreateSpouseFamily,
  usePersonRelations,
  useSearchPeopleAdvanced,
} from '@hooks';
import {
  buildPersonHandle,
  buildSpousePersonInput,
  splitVietnameseName,
} from '@lib';
import type { Person, PersonRelations } from '@types';

interface PersonLinkProps {
  person: Person;
}

function PersonLink({ person }: PersonLinkProps) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="group flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
          person.gender === 1
            ? 'bg-blue-100 text-blue-700'
            : 'bg-pink-100 text-pink-700'
        }`}
      >
        {person.display_name.slice(-1)}
      </div>
      <span className="text-sm transition-colors group-hover:text-primary">
        {person.display_name}
      </span>
      {person.birth_year && (
        <span className="text-xs text-muted-foreground">
          ({person.birth_year})
        </span>
      )}
      {!person.is_living && (
        <span className="text-xs text-muted-foreground">†</span>
      )}
    </Link>
  );
}

interface QuickPersonData {
  display_name: string;
  gender: 1 | 2;
  birth_year: string;
  generation: number;
}

interface QuickPersonFormProps {
  defaultGender?: 1 | 2;
  defaultGeneration: number;
  onSubmit: (data: QuickPersonData) => Promise<void>;
  isLoading: boolean;
}

function QuickPersonForm({
  defaultGender = 1,
  defaultGeneration,
  onSubmit,
  isLoading,
}: QuickPersonFormProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<1 | 2>(defaultGender);
  const [birthYear, setBirthYear] = useState('');
  const [generation, setGeneration] = useState(defaultGeneration);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      display_name: name.trim(),
      gender,
      birth_year: birthYear,
      generation,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="qf-name">{t('form.firstName')} *</Label>
        <Input
          id="qf-name"
          placeholder={t('form.placeholders.displayName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>{t('form.gender')}</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender(1)}
              className={`flex-1 rounded border py-1.5 text-sm ${
                gender === 1
                  ? 'border-blue-400 bg-blue-50 font-medium text-blue-700'
                  : 'border-muted-foreground/30'
              }`}
            >
              {tCommon('male')}
            </button>
            <button
              type="button"
              onClick={() => setGender(2)}
              className={`flex-1 rounded border py-1.5 text-sm ${
                gender === 2
                  ? 'border-pink-400 bg-pink-50 font-medium text-pink-700'
                  : 'border-muted-foreground/30'
              }`}
            >
              {tCommon('female')}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="qf-year">{t('form.birthYear')}</Label>
          <Input
            id="qf-year"
            placeholder={t('form.placeholders.birthYear')}
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="qf-gen">{t('form.generation')}</Label>
        <Input
          id="qf-gen"
          type="number"
          min={1}
          max={20}
          value={generation}
          onChange={(e) => setGeneration(Number(e.target.value))}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !name.trim()}
      >
        {isLoading ? tCommon('saving') : tCommon('save')}
      </Button>
    </form>
  );
}

interface PersonSearchSelectProps {
  excludeIds?: string[];
  onSelect: (person: Person) => Promise<void>;
  isLoading: boolean;
}

function PersonSearchSelect({
  excludeIds = [],
  onSelect,
  isLoading,
}: PersonSearchSelectProps) {
  const t = useTranslations('People');
  const [query, setQuery] = useState('');
  const { data: results, isFetching } = useSearchPeopleAdvanced(query);

  const filtered = (results || []).filter((p) => !excludeIds.includes(p.id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('relations.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {isFetching && (
        <p className="text-sm text-muted-foreground">{t('relations.searching')}</p>
      )}
      {!isFetching && query.length >= 2 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('relations.notFound')}</p>
      )}
      <div className="max-h-48 space-y-1 overflow-y-auto">
        {filtered.map((person) => (
          <button
            key={person.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(person)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50"
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                person.gender === 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-pink-100 text-pink-700'
              }`}
            >
              {person.display_name.slice(-1)}
            </div>
            <div>
              <p className="text-sm font-medium">{person.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {t('generationN', { n: person.generation })}
                {person.birth_year ? ` · ${person.birth_year}` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type DialogMode = 'spouse' | 'child';

interface AddRelationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: DialogMode;
  currentPerson: Person;
  targetFamilyId?: string;
  targetSpouse?: Person | null;
  excludePersonIds?: string[];
  onSuccess: () => void;
}

function AddRelationDialog({
  open,
  onClose,
  mode,
  currentPerson,
  targetFamilyId,
  targetSpouse,
  excludePersonIds = [],
  onSuccess,
}: AddRelationDialogProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  const [isSaving, setIsSaving] = useState(false);
  const createPersonMutation = useCreatePerson();
  const createSpouseFamilyMutation = useCreateSpouseFamily();
  const addChildMutation = useAddChildToFamilyMutation(currentPerson.id);

  const defaultGender: 1 | 2 =
    mode === 'spouse' ? (currentPerson.gender === 1 ? 2 : 1) : 1;
  const defaultGeneration =
    mode === 'spouse'
      ? currentPerson.generation
      : currentPerson.generation + 1;

  async function linkSpouse(spouseId: string) {
    await createSpouseFamilyMutation.mutateAsync({
      personId: currentPerson.id,
      personGender: currentPerson.gender,
      spouseId,
      targetFamilyId: mode === 'spouse' ? targetFamilyId : undefined,
    });
  }

  async function linkChild(childPersonId: string) {
    await addChildMutation.mutateAsync({
      familyId: targetFamilyId,
      childPersonId,
      parentPersonId: currentPerson.id,
      parentGender: currentPerson.gender,
    });
  }

  async function handleCreateNew(data: QuickPersonData) {
    setIsSaving(true);
    try {
      const birthYear = data.birth_year ? Number(data.birth_year) : undefined;
      const newPerson = await createPersonMutation.mutateAsync(
        mode === 'spouse'
          ? buildSpousePersonInput({
              fullName: data.display_name,
              birthYear,
              marriedTo: currentPerson,
            })
          : {
              handle: buildPersonHandle(data.display_name),
              display_name: data.display_name,
              ...splitVietnameseName(data.display_name),
              gender: data.gender,
              generation: data.generation,
              chi: currentPerson.chi,
              birth_year: birthYear,
              is_living: true,
              is_patrilineal: data.gender === 1,
              privacy_level: currentPerson.privacy_level,
            }
      );

      if (mode === 'spouse') {
        await linkSpouse(newPerson.id);
      } else {
        await linkChild(newPerson.id);
      }

      toast.success(
        mode === 'spouse'
          ? t('relations.toastAddSpouse')
          : t('relations.toastAddChild')
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('relations.toastError')
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectExisting(person: Person) {
    setIsSaving(true);
    try {
      if (mode === 'spouse') {
        await linkSpouse(person.id);
      } else {
        await linkChild(person.id);
      }

      toast.success(
        mode === 'spouse'
          ? t('relations.toastLinkSpouse')
          : t('relations.toastLinkChild')
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('relations.toastError')
      );
    } finally {
      setIsSaving(false);
    }
  }

  const spouseLabel =
    currentPerson.gender === 1
      ? t('relations.wife').toLowerCase()
      : t('relations.husband').toLowerCase();
  const title =
    mode === 'spouse'
      ? t('relations.addSpouseFor', {
          role: spouseLabel,
          name: currentPerson.display_name,
        })
      : targetSpouse
        ? t('relations.addChildForCouple', {
            name: currentPerson.display_name,
            spouse: targetSpouse.display_name,
          })
        : t('relations.addChildFor', { name: currentPerson.display_name });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {mode === 'child' && (
          <p className="text-sm text-muted-foreground">
            {t('relations.childFamilyHint')}{' '}
            <span className="font-medium text-foreground">
              {currentPerson.gender === 1
                ? `${currentPerson.display_name}${targetSpouse ? ` & ${targetSpouse.display_name}` : ''}`
                : `${targetSpouse ? `${targetSpouse.display_name} & ` : ''}${currentPerson.display_name}`}
            </span>
          </p>
        )}

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'new' | 'existing')}
        >
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1">
              <UserPlus className="mr-2 h-4 w-4" />
              {tCommon('create')}
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              {t('relations.selectExisting')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-4">
            <QuickPersonForm
              defaultGender={defaultGender}
              defaultGeneration={defaultGeneration}
              onSubmit={handleCreateNew}
              isLoading={isSaving}
            />
          </TabsContent>

          <TabsContent value="existing" className="mt-4">
            <PersonSearchSelect
              excludeIds={[currentPerson.id, ...excludePersonIds]}
              onSelect={handleSelectExisting}
              isLoading={isSaving}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface OwnFamilySectionProps {
  familyEntry: PersonRelations['ownFamilies'][0];
  currentPerson: Person;
  canEdit: boolean;
  index: number;
  onAddChild: () => void;
  onAddSpouse: (familyId: string) => void;
}

function OwnFamilySection({
  familyEntry,
  currentPerson,
  canEdit,
  index,
  onAddChild,
  onAddSpouse,
}: OwnFamilySectionProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const { family, spouse, children } = familyEntry;
  const spouseLabel =
    currentPerson.gender === 1 ? t('relations.wife') : t('relations.husband');

  return (
    <div className="space-y-3">
      {index > 0 && <Separator />}

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {spouseLabel}
            {family.marriage_date && (
              <span className="ml-2 font-normal normal-case">
                {t('relations.marriedOn', { date: family.marriage_date })}
              </span>
            )}
          </p>
          {canEdit && !spouse && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onAddSpouse(family.id)}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t('relations.addRole', { role: spouseLabel.toLowerCase() })}
            </Button>
          )}
        </div>
        {spouse ? (
          <PersonLink person={spouse} />
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            {tCommon('unknown')}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {t('relations.childrenCount', { count: children.length })}
          </p>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onAddChild}
            >
              <Plus className="mr-1 h-3 w-3" />
              {t('relations.addChild')}
            </Button>
          )}
        </div>
        {children.length > 0 ? (
          <div className="space-y-0.5">
            {children.map((child) => (
              <PersonLink key={child.id} person={child} />
            ))}
          </div>
        ) : (
          <p className="px-2 text-sm text-muted-foreground">
            {t('relations.noChildren')}
          </p>
        )}
      </div>
    </div>
  );
}

interface FamilyRelationsCardProps {
  person: Person;
  canEdit: boolean;
}

export function FamilyRelationsCard({
  person,
  canEdit,
}: FamilyRelationsCardProps) {
  const t = useTranslations('People');
  const tCommon = useTranslations('Common');
  const { data: relations, isLoading, refetch } = usePersonRelations(person.id);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [targetFamilyId, setTargetFamilyId] = useState<string | undefined>();
  const [targetSpouse, setTargetSpouse] = useState<Person | null>(null);
  const [excludePersonIds, setExcludePersonIds] = useState<string[]>([]);

  function openSpouseDialog(familyId?: string) {
    setDialogMode('spouse');
    setTargetFamilyId(familyId);
    setTargetSpouse(null);
    setExcludePersonIds([]);
  }

  function openChildDialog(
    familyId: string | undefined,
    spouse: Person | null,
    existingChildren: Person[]
  ) {
    setDialogMode('child');
    setTargetFamilyId(familyId);
    setTargetSpouse(spouse);
    setExcludePersonIds([
      ...(spouse ? [spouse.id] : []),
      ...existingChildren.map((c) => c.id),
    ]);
  }

  function closeDialog() {
    setDialogMode(null);
    setTargetFamilyId(undefined);
    setTargetSpouse(null);
    setExcludePersonIds([]);
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            {t('relations.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  const { parentFamily, ownFamilies } = relations || {
    parentFamily: null,
    ownFamilies: [],
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              {t('relations.title')}
            </CardTitle>
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSpouseDialog()}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {t('relations.addSpouse')}
                </Button>
                {ownFamilies.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChildDialog(undefined, null, [])}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t('relations.addChild')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {parentFamily && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t('relations.father')}
                  </p>
                  {parentFamily.father ? (
                    <PersonLink person={parentFamily.father} />
                  ) : (
                    <p className="px-2 text-sm text-muted-foreground">
                      {tCommon('unknown')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t('relations.mother')}
                  </p>
                  {parentFamily.mother ? (
                    <PersonLink person={parentFamily.mother} />
                  ) : (
                    <p className="px-2 text-sm text-muted-foreground">
                      {tCommon('unknown')}
                    </p>
                  )}
                </div>
              </div>

              {parentFamily.siblings.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                    {t('relations.siblingsCount', {
                      count: parentFamily.siblings.length,
                    })}
                  </p>
                  <div className="space-y-0.5">
                    {parentFamily.siblings.map((sib) => (
                      <PersonLink key={sib.id} person={sib} />
                    ))}
                  </div>
                </div>
              )}

              <Separator />
            </div>
          )}

          {!parentFamily && (
            <div className="text-sm text-muted-foreground">
              {t('relations.noParents')}
            </div>
          )}

          {ownFamilies.length > 0 ? (
            <div className="space-y-4">
              {ownFamilies.map((familyEntry, idx) => (
                <OwnFamilySection
                  key={familyEntry.family.id}
                  familyEntry={familyEntry}
                  currentPerson={person}
                  canEdit={canEdit}
                  index={idx}
                  onAddChild={() =>
                    openChildDialog(
                      familyEntry.family.id,
                      familyEntry.spouse,
                      familyEntry.children
                    )
                  }
                  onAddSpouse={openSpouseDialog}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('relations.noOwnFamily')}
              </p>
              {canEdit && (
                <p className="text-xs text-muted-foreground">
                  {t('relations.ownFamilyHint')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {dialogMode && (
        <AddRelationDialog
          open={true}
          onClose={closeDialog}
          mode={dialogMode}
          currentPerson={person}
          targetFamilyId={targetFamilyId}
          targetSpouse={targetSpouse}
          excludePersonIds={excludePersonIds}
          onSuccess={() => refetch()}
        />
      )}
    </>
  );
}
