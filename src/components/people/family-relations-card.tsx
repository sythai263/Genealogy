/**
 * @project AncestorTree
 * @file src/components/people/family-relations-card.tsx
 * @description Card showing family relations (parents, siblings, spouse, children) for a person
 * @version 1.2.0
 * @updated 2026-10-29
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Users } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from '@components/ui';
import { usePersonRelations } from '@hooks';
import type { Person } from '@types';
import {
  AddRelationDialog,
  type AddRelationDialogMode,
} from './add-relation-dialog';
import { OwnFamilySection } from './own-family-section';
import { PersonLink } from './person-link';

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
  const [dialogMode, setDialogMode] = useState<AddRelationDialogMode | null>(
    null
  );
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
