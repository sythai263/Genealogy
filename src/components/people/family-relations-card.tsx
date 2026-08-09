/**
 * @project AncestorTree
 * @file src/components/people/family-relations-card.tsx
 * @description Card showing family relations (parents, siblings, spouse, children) for a person
 * @version 1.0.0
 * @updated 2026-08-09
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePersonRelations, useCreateSpouseFamily, useAddChildToFamilyMutation, useSearchPeople, useCreatePerson } from '@hooks';
import { Card, CardContent, CardHeader, CardTitle, Button, Separator, Skeleton, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui';
import { Users, Plus, Search, UserPlus } from 'lucide-react';
import { buildPersonHandle, buildSpousePersonInput, splitVietnameseName } from '@lib';
import type { Person, PersonRelations } from '@types';

// ─── PersonLink ───────────────────────────────────────────────────────────────

function PersonLink({ person }: { person: Person }) {
  return (
    <Link
      href={`/people/${person.id}`}
      className="flex items-center gap-2 hover:bg-muted rounded-md px-2 py-1 transition-colors group"
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
          person.gender === 1
            ? 'bg-blue-100 text-blue-700'
            : 'bg-pink-100 text-pink-700'
        }`}
      >
        {person.display_name.slice(-1)}
      </div>
      <span className="text-sm group-hover:text-primary transition-colors">
        {person.display_name}
      </span>
      {person.birth_year && (
        <span className="text-xs text-muted-foreground">({person.birth_year})</span>
      )}
      {!person.is_living && <span className="text-xs text-muted-foreground">†</span>}
    </Link>
  );
}

// ─── QuickPersonForm ─────────────────────────────────────────────────────────

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
  const [name, setName] = useState('');
  const [gender, setGender] = useState<1 | 2>(defaultGender);
  const [birthYear, setBirthYear] = useState('');
  const [generation, setGeneration] = useState(defaultGeneration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      display_name: name.trim(),
      gender,
      birth_year: birthYear,
      generation,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="qf-name">Tên *</Label>
        <Input
          id="qf-name"
          placeholder="Nguyễn Văn A"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Giới tính</Label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender(1)}
              className={`flex-1 py-1.5 rounded text-sm border ${
                gender === 1
                  ? 'bg-blue-50 border-blue-400 text-blue-700 font-medium'
                  : 'border-muted-foreground/30'
              }`}
            >
              Nam
            </button>
            <button
              type="button"
              onClick={() => setGender(2)}
              className={`flex-1 py-1.5 rounded text-sm border ${
                gender === 2
                  ? 'bg-pink-50 border-pink-400 text-pink-700 font-medium'
                  : 'border-muted-foreground/30'
              }`}
            >
              Nữ
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="qf-year">Năm sinh</Label>
          <Input
            id="qf-year"
            placeholder="1980"
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="qf-gen">Đời</Label>
        <Input
          id="qf-gen"
          type="number"
          min={1}
          max={20}
          value={generation}
          onChange={(e) => setGeneration(Number(e.target.value))}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !name.trim()}>
        {isLoading ? 'Đang lưu...' : 'Lưu'}
      </Button>
    </form>
  );
}

// ─── PersonSearchSelect ───────────────────────────────────────────────────────

interface PersonSearchSelectProps {
  excludeIds?: string[];
  onSelect: (person: Person) => Promise<void>;
  isLoading: boolean;
}

function PersonSearchSelect({ excludeIds = [], onSelect, isLoading }: PersonSearchSelectProps) {
  const [query, setQuery] = useState('');
  const { data: results, isFetching } = useSearchPeople(query);

  const filtered = (results || []).filter((p) => !excludeIds.includes(p.id));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên... (nhập ít nhất 2 ký tự)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      {isFetching && <p className="text-sm text-muted-foreground">Đang tìm...</p>}
      {!isFetching && query.length >= 2 && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">Không tìm thấy kết quả</p>
      )}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {filtered.map((person) => (
          <button
            key={person.id}
            type="button"
            disabled={isLoading}
            onClick={() => onSelect(person)}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                person.gender === 1 ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {person.display_name.slice(-1)}
            </div>
            <div>
              <p className="text-sm font-medium">{person.display_name}</p>
              <p className="text-xs text-muted-foreground">
                Đời {person.generation}{person.birth_year ? ` · ${person.birth_year}` : ''}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── AddRelationDialog ────────────────────────────────────────────────────────

type DialogMode = 'spouse' | 'child';

interface AddRelationDialogProps {
  open: boolean;
  onClose: () => void;
  mode: DialogMode;
  currentPerson: Person;
  /** Child mode: family to add child to. Spouse mode: optional half-family to fill. */
  targetFamilyId?: string;
  /** Child mode: spouse of the target family (for title + exclusions). */
  targetSpouse?: Person | null;
  /** IDs already related in this context (spouse, existing children). */
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
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  const [isSaving, setIsSaving] = useState(false);
  const createPersonMutation = useCreatePerson();
  const createSpouseFamilyMutation = useCreateSpouseFamily();
  const addChildMutation = useAddChildToFamilyMutation(currentPerson.id);

  const defaultGender: 1 | 2 = mode === 'spouse'
    ? (currentPerson.gender === 1 ? 2 : 1)
    : 1;
  const defaultGeneration = mode === 'spouse'
    ? currentPerson.generation
    : currentPerson.generation + 1;

  const linkSpouse = async (spouseId: string) => {
    await createSpouseFamilyMutation.mutateAsync({
      personId: currentPerson.id,
      personGender: currentPerson.gender,
      spouseId,
      targetFamilyId: mode === 'spouse' ? targetFamilyId : undefined,
    });
  };

  const linkChild = async (childPersonId: string) => {
    await addChildMutation.mutateAsync({
      familyId: targetFamilyId,
      childPersonId,
      parentPersonId: currentPerson.id,
      parentGender: currentPerson.gender,
    });
  };

  const handleCreateNew = async (data: QuickPersonData) => {
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

      toast.success(mode === 'spouse' ? 'Đã thêm vợ/chồng' : 'Đã thêm con');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectExisting = async (person: Person) => {
    setIsSaving(true);
    try {
      if (mode === 'spouse') {
        await linkSpouse(person.id);
      } else {
        await linkChild(person.id);
      }

      toast.success(mode === 'spouse' ? 'Đã liên kết vợ/chồng' : 'Đã liên kết con');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  const spouseLabel = currentPerson.gender === 1 ? 'vợ' : 'chồng';
  const title = mode === 'spouse'
    ? `Thêm ${spouseLabel} cho ${currentPerson.display_name}`
    : targetSpouse
      ? `Thêm con cho ${currentPerson.display_name} & ${targetSpouse.display_name}`
      : `Thêm con cho ${currentPerson.display_name}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {mode === 'child' && (
          <p className="text-sm text-muted-foreground">
            Con sẽ thuộc gia đình này — cha/mẹ:{' '}
            <span className="font-medium text-foreground">
              {currentPerson.gender === 1
                ? `${currentPerson.display_name}${targetSpouse ? ` & ${targetSpouse.display_name}` : ''}`
                : `${targetSpouse ? `${targetSpouse.display_name} & ` : ''}${currentPerson.display_name}`}
            </span>
          </p>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'new' | 'existing')}>
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Tạo mới
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Chọn có sẵn
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

// ─── FamilySection ────────────────────────────────────────────────────────────

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
  const { family, spouse, children } = familyEntry;
  const spouseLabel = currentPerson.gender === 1 ? 'Vợ' : 'Chồng';

  return (
    <div className="space-y-3">
      {index > 0 && <Separator />}

      {/* Spouse */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {spouseLabel}
            {family.marriage_date && (
              <span className="ml-2 normal-case font-normal">
                (kết hôn {family.marriage_date})
              </span>
            )}
          </p>
          {canEdit && !spouse && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => onAddSpouse(family.id)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Thêm {spouseLabel.toLowerCase()}
            </Button>
          )}
        </div>
        {spouse ? (
          <PersonLink person={spouse} />
        ) : (
          <p className="text-sm text-muted-foreground px-2">Chưa rõ</p>
        )}
      </div>

      {/* Children */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Con cái ({children.length})
          </p>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={onAddChild}
            >
              <Plus className="h-3 w-3 mr-1" />
              Thêm con
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
          <p className="text-sm text-muted-foreground px-2">Chưa có con</p>
        )}
      </div>
    </div>
  );
}

// ─── FamilyRelationsCard ──────────────────────────────────────────────────────

interface FamilyRelationsCardProps {
  person: Person;
  canEdit: boolean;
}

export function FamilyRelationsCard({ person, canEdit }: FamilyRelationsCardProps) {
  const { data: relations, isLoading, refetch } = usePersonRelations(person.id);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [targetFamilyId, setTargetFamilyId] = useState<string | undefined>();
  const [targetSpouse, setTargetSpouse] = useState<Person | null>(null);
  const [excludePersonIds, setExcludePersonIds] = useState<string[]>([]);

  const openSpouseDialog = (familyId?: string) => {
    setDialogMode('spouse');
    setTargetFamilyId(familyId);
    setTargetSpouse(null);
    setExcludePersonIds([]);
  };

  const openChildDialog = (
    familyId: string | undefined,
    spouse: Person | null,
    existingChildren: Person[]
  ) => {
    setDialogMode('child');
    setTargetFamilyId(familyId);
    setTargetSpouse(spouse);
    setExcludePersonIds([
      ...(spouse ? [spouse.id] : []),
      ...existingChildren.map((c) => c.id),
    ]);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setTargetFamilyId(undefined);
    setTargetSpouse(null);
    setExcludePersonIds([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Quan hệ gia đình
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

  const { parentFamily, ownFamilies } = relations || { parentFamily: null, ownFamilies: [] };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Quan hệ gia đình
            </CardTitle>
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openSpouseDialog()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm vợ/chồng
                </Button>
                {ownFamilies.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChildDialog(undefined, null, [])}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm con
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parents section */}
          {parentFamily && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Cha
                  </p>
                  {parentFamily.father ? (
                    <PersonLink person={parentFamily.father} />
                  ) : (
                    <p className="text-sm text-muted-foreground px-2">Chưa rõ</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Mẹ
                  </p>
                  {parentFamily.mother ? (
                    <PersonLink person={parentFamily.mother} />
                  ) : (
                    <p className="text-sm text-muted-foreground px-2">Chưa rõ</p>
                  )}
                </div>
              </div>

              {/* Siblings */}
              {parentFamily.siblings.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Anh/Chị/Em ({parentFamily.siblings.length})
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
              Chưa có thông tin cha/mẹ
            </div>
          )}

          {/* Own families (spouse + children) */}
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
              <p className="text-sm text-muted-foreground">Chưa có gia đình riêng</p>
              {canEdit && (
                <p className="text-xs text-muted-foreground">
                  Thêm vợ/chồng để tạo gia đình đủ cặp, hoặc thêm con trước (gia đình một bên).
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
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
