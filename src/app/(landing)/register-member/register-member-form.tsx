/**
 * @project AncestorTree
 * @file src/app/(landing)/register-member/register-member-form.tsx
 * @description Client component — public registration form with honeypot
 * @version 1.1.0
 * @updated 2026-08-09
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@components/ui';
import { useClanSettings, useSubmitRegistration } from '@hooks';
import { CLAN_NAME } from '@lib';
import { CheckCircle, Loader2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

export function RegisterMemberForm() {
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Common');
  const { data: cs } = useClanSettings();
  const clanName = cs?.clan_name ?? CLAN_NAME;
  const submitMutation = useSubmitRegistration();
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<string>('');
  const [birthYear, setBirthYear] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [generation, setGeneration] = useState('');
  const [chi, setChi] = useState('');
  const [relationship, setRelationship] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !gender) return;

    try {
      await submitMutation.mutateAsync({
        full_name: fullName.trim(),
        gender: parseInt(gender) as 1 | 2,
        birth_year: birthYear ? parseInt(birthYear) : undefined,
        birth_place: birthPlace.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        parent_name: parentName.trim() || undefined,
        generation: generation ? parseInt(generation) : undefined,
        chi: chi ? parseInt(chi) : undefined,
        relationship: relationship.trim() || undefined,
        notes: notes.trim() || undefined,
        honeypot,
      });
      setSubmitted(true);
    } catch {
      // Error handled by mutation state
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-16 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">
          {t('pages.registerMember.successTitle')}
        </h1>
        <p className="text-gray-600">
          {t('pages.registerMember.successBody', { clanName })}
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="text-sm text-primary hover:underline">
            {t('pages.registerMember.backHome')}
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/council" className="text-sm text-primary hover:underline">
            {t('pages.registerMember.viewCouncil')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="space-y-3 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
          <UserPlus className="h-7 w-7" />
          {t('pages.registerMember.title')}
        </h1>
        <p className="text-gray-600">
          {t('pages.registerMember.forDescendants', { clanName })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('pages.registerMember.formTitle')}
          </CardTitle>
          <CardDescription>
            {t('pages.registerMember.formDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('pages.registerMember.fullName')}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('pages.registerMember.fullNamePlaceholder')}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('pages.registerMember.gender')}</Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="mt-1">
                    <SelectValue
                      placeholder={t('pages.registerMember.selectGender')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">{tCommon('male')}</SelectItem>
                    <SelectItem value="2">{tCommon('female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('pages.registerMember.birthYear')}</Label>
                <Input
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="1990"
                  min={1900}
                  max={2030}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('pages.registerMember.birthPlace')}</Label>
                <Input
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder={t('pages.registerMember.birthPlacePlaceholder')}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>{t('pages.registerMember.phone')}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('pages.registerMember.email')}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t('pages.registerMember.parentName')}</Label>
              <Input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder={t('pages.registerMember.parentPlaceholder')}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>{t('pages.registerMember.generation')}</Label>
                <Input
                  type="number"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  placeholder="5"
                  min={1}
                  max={30}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('pages.registerMember.chi')}</Label>
                <Input
                  type="number"
                  value={chi}
                  onChange={(e) => setChi(e.target.value)}
                  placeholder="1"
                  min={1}
                  max={20}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('pages.registerMember.relationship')}</Label>
                <Input
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder={t(
                    'pages.registerMember.relationshipPlaceholder'
                  )}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>{t('pages.registerMember.notes')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t('pages.registerMember.notesPlaceholder')}
                className="mt-1"
              />
            </div>

            {submitMutation.isError && (
              <p className="text-sm text-red-500">
                {t('pages.registerMember.submitError')}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                submitMutation.isPending || !fullName.trim() || !gender
              }
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('pages.registerMember.submitting')}
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('pages.registerMember.submit')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="text-sm text-primary hover:underline">
          {t('pageNav.home')}
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/council" className="text-sm text-primary hover:underline">
          {t('pageNav.council')}
        </Link>
      </div>
    </div>
  );
}
