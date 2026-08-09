/**
 * @project AncestorTree
 * @file src/components/settings/admin-clan-settings-view.tsx
 * @description Admin clan configuration CRUD view
 * @version 2.2.0
 * @updated 2026-08-09
 */

'use client';

import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Skeleton,
  Textarea,
} from '@components/ui';
import { APP_VERSION_DISPLAY } from '@constants';
import { useClanSettings, useUpdateClanSettings } from '@hooks';
import {
  CLAN_FULL_NAME as ENV_CLAN_FULL_NAME,
  CLAN_NAME as ENV_CLAN_NAME,
  deriveClanInitial,
  deriveClanSubtitle,
} from '@lib';
import type {
  CeremonyScheduleItem,
  CouncilMember,
  LoginMethod,
  UpdateClanSettingsInput,
} from '@types';
import {
  Calendar,
  Database,
  Globe,
  Landmark,
  Loader2,
  Lock,
  Plus,
  Save,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

export function AdminClanSettingsView() {
  const t = useTranslations('Admin');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const { isEditor } = useAuth();
  const { data: clanSettings, isLoading } = useClanSettings();
  const updateMutation = useUpdateClanSettings();

  const [clanName, setClanName] = useState('');
  const [clanFullName, setClanFullName] = useState('');
  const [foundingYear, setFoundingYear] = useState('');
  const [origin, setOrigin] = useState('');
  const [patriarch, setPatriarch] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [clanHistory, setClanHistory] = useState('');
  const [clanMission, setClanMission] = useState('');
  const [hallAddress, setHallAddress] = useState('');
  const [hallHistory, setHallHistory] = useState('');
  const [ceremonies, setCeremonies] = useState<CeremonyScheduleItem[]>([]);
  const [loginMethods, setLoginMethods] = useState<LoginMethod[]>([
    'email_password',
    'email_otp',
  ]);
  const [isSavingLogin, setIsSavingLogin] = useState(false);
  const [formSyncKey, setFormSyncKey] = useState<string | null>(null);

  if (clanSettings) {
    const nextKey = `${clanSettings.id}:${clanSettings.updated_at}`;
    if (formSyncKey !== nextKey) {
      setFormSyncKey(nextKey);
      setClanName(clanSettings.clan_name);
      setClanFullName(clanSettings.clan_full_name);
      setFoundingYear(clanSettings.clan_founding_year?.toString() ?? '');
      setOrigin(clanSettings.clan_origin ?? '');
      setPatriarch(clanSettings.clan_patriarch ?? '');
      setDescription(clanSettings.clan_description ?? '');
      setContactEmail(clanSettings.contact_email ?? '');
      setContactPhone(clanSettings.contact_phone ?? '');
      setCouncilMembers(
        (clanSettings.council_members as CouncilMember[]) ?? []
      );
      setClanHistory(clanSettings.clan_history ?? '');
      setClanMission(clanSettings.clan_mission ?? '');
      setHallAddress(clanSettings.ancestral_hall_address ?? '');
      setHallHistory(clanSettings.ancestral_hall_history ?? '');
      setCeremonies(
        (clanSettings.ceremony_schedule as CeremonyScheduleItem[]) ?? []
      );
      setLoginMethods(
        clanSettings.login_config?.methods ?? ['email_password', 'email_otp']
      );
    }
  }

  if (!isEditor) {
    return <AccessDenied />;
  }

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!clanSettings) return;
    if (!clanName.trim() || !clanFullName.trim()) {
      toast.error(t('settings.nameRequired'));
      return;
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      toast.error(t('settings.emailInvalid'));
      return;
    }
    const input: UpdateClanSettingsInput = {
      clan_name: clanName.trim(),
      clan_full_name: clanFullName.trim(),
      clan_founding_year: foundingYear ? parseInt(foundingYear) : undefined,
      clan_origin: origin.trim() || undefined,
      clan_patriarch: patriarch.trim() || undefined,
      clan_description: description.trim() || undefined,
      contact_email: contactEmail.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
      council_members: councilMembers.filter((m) => m.name.trim()),
      clan_history: clanHistory.trim() || undefined,
      clan_mission: clanMission.trim() || undefined,
      ancestral_hall_address: hallAddress.trim() || undefined,
      ancestral_hall_history: hallHistory.trim() || undefined,
      ceremony_schedule: ceremonies.filter((c) => c.title.trim()),
    };
    try {
      await updateMutation.mutateAsync({ id: clanSettings.id, input });
      toast.success(t('settings.toastSuccess'));
      router.refresh();
    } catch {
      toast.error(t('settings.toastError'));
    }
  }

  async function handleSaveLoginConfig() {
    if (!clanSettings) return;
    if (loginMethods.length === 0) {
      toast.error(t('settings.loginRequired'));
      return;
    }
    setIsSavingLogin(true);
    try {
      await updateMutation.mutateAsync({
        id: clanSettings.id,
        input: {
          login_config: {
            methods: loginMethods,
            otp_expiry_minutes:
              clanSettings.login_config?.otp_expiry_minutes ?? 15,
          },
        },
      });
      toast.success(t('settings.toastLoginSuccess'));
    } catch {
      toast.error(t('settings.toastLoginError'));
    } finally {
      setIsSavingLogin(false);
    }
  }

  const previewInitial = deriveClanInitial(clanName || ENV_CLAN_NAME);
  const previewSubtitle = deriveClanSubtitle(
    clanFullName || ENV_CLAN_FULL_NAME,
    clanName || ENV_CLAN_NAME
  );

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('settings.clanInfo.title')}
          </CardTitle>
          <CardDescription>{t('settings.clanInfo.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.fields.shortName')}</Label>
                  <Input
                    value={clanName}
                    onChange={(e) => setClanName(e.target.value)}
                    placeholder={t('settings.placeholders.shortName')}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('settings.fields.shortNameHint')}
                  </p>
                </div>
                <div>
                  <Label>{t('settings.fields.foundingYear')}</Label>
                  <Input
                    type="number"
                    value={foundingYear}
                    onChange={(e) => setFoundingYear(e.target.value)}
                    placeholder="1750"
                    min={1000}
                    max={2100}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>{t('settings.fields.fullName')}</Label>
                <Input
                  value={clanFullName}
                  onChange={(e) => setClanFullName(e.target.value)}
                  placeholder={t('settings.placeholders.fullName')}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('settings.fields.fullNameHint')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.fields.patriarch')}</Label>
                  <Input
                    value={patriarch}
                    onChange={(e) => setPatriarch(e.target.value)}
                    placeholder={t('settings.placeholders.ancestor')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('settings.fields.origin')}</Label>
                  <Input
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder={t('settings.placeholders.hometown')}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>{t('settings.fields.history')}</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('settings.placeholders.intro')}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('settings.fields.contactEmail')}</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="hoidong@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('settings.fields.contactPhone')}</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('settings.preview.sidebar')}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0">
                    {previewInitial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {clanName || ENV_CLAN_NAME}
                    </p>
                    {previewSubtitle && (
                      <p className="text-xs text-muted-foreground">
                        {previewSubtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateMutation.isPending || !clanSettings}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {tCommon('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('settings.saveChanges')}
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('settings.council.title')}
          </CardTitle>
          <CardDescription>{t('settings.council.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {councilMembers.map((m, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  placeholder={t('settings.placeholders.councilName')}
                  value={m.name}
                  onChange={(e) => {
                    const updated = [...councilMembers];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setCouncilMembers(updated);
                  }}
                />
                <Input
                  placeholder={t('settings.placeholders.councilRole')}
                  value={m.title}
                  onChange={(e) => {
                    const updated = [...councilMembers];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setCouncilMembers(updated);
                  }}
                />
                <Input
                  placeholder={t('settings.placeholders.councilPhone')}
                  value={m.phone ?? ''}
                  onChange={(e) => {
                    const updated = [...councilMembers];
                    updated[i] = {
                      ...updated[i],
                      phone: e.target.value || undefined,
                    };
                    setCouncilMembers(updated);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() =>
                  setCouncilMembers(councilMembers.filter((_, j) => j !== i))
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCouncilMembers([...councilMembers, { name: '', title: '' }])
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('settings.council.addMember')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {t('settings.historyMission.title')}
          </CardTitle>
          <CardDescription>
            {t('settings.historyMission.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('settings.historyMission.history')}</Label>
            <Textarea
              value={clanHistory}
              onChange={(e) => setClanHistory(e.target.value)}
              rows={4}
              placeholder={t('settings.placeholders.origin')}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('settings.historyMission.mission')}</Label>
            <Textarea
              value={clanMission}
              onChange={(e) => setClanMission(e.target.value)}
              rows={3}
              placeholder={t('settings.placeholders.mission')}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            {t('settings.ancestralHall.title')}
          </CardTitle>
          <CardDescription>
            {t('settings.ancestralHall.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('settings.ancestralHall.address')}</Label>
            <Input
              value={hallAddress}
              onChange={(e) => setHallAddress(e.target.value)}
              placeholder={t('settings.placeholders.hallLocation')}
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t('settings.ancestralHall.history')}</Label>
            <Textarea
              value={hallHistory}
              onChange={(e) => setHallHistory(e.target.value)}
              rows={3}
              placeholder={t('settings.placeholders.hallHistory')}
              className="mt-1"
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('settings.ancestralHall.ceremonies')}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t('settings.ancestralHall.ceremoniesHint')}
            </p>
            {ceremonies.map((c, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Input
                    placeholder={t('settings.placeholders.ceremonyName')}
                    value={c.title}
                    onChange={(e) => {
                      const updated = [...ceremonies];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder={t('settings.placeholders.lunarDate')}
                    value={c.lunar_date ?? ''}
                    onChange={(e) => {
                      const updated = [...ceremonies];
                      updated[i] = {
                        ...updated[i],
                        lunar_date: e.target.value || undefined,
                      };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder={t('settings.placeholders.solarDate')}
                    value={c.solar_date ?? ''}
                    onChange={(e) => {
                      const updated = [...ceremonies];
                      updated[i] = {
                        ...updated[i],
                        solar_date: e.target.value || undefined,
                      };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder={t('settings.placeholders.note')}
                    value={c.description ?? ''}
                    onChange={(e) => {
                      const updated = [...ceremonies];
                      updated[i] = {
                        ...updated[i],
                        description: e.target.value || undefined,
                      };
                      setCeremonies(updated);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() =>
                    setCeremonies(ceremonies.filter((_, j) => j !== i))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCeremonies([...ceremonies, { title: '' }])}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('settings.ancestralHall.addCeremony')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('settings.login.title')}
          </CardTitle>
          <CardDescription>{t('settings.login.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={loginMethods.includes('email_password')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLoginMethods((prev) => [...prev, 'email_password']);
                  } else {
                    setLoginMethods((prev) =>
                      prev.filter((m) => m !== 'email_password')
                    );
                  }
                }}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {t('settings.login.emailPassword.title')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('settings.login.emailPassword.description')}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors">
              <input
                type="checkbox"
                checked={loginMethods.includes('email_otp')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLoginMethods((prev) => [...prev, 'email_otp']);
                  } else {
                    setLoginMethods((prev) =>
                      prev.filter((m) => m !== 'email_otp')
                    );
                  }
                }}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {t('settings.login.emailOtp.title')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('settings.login.emailOtp.description')}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {t('settings.login.emailOtp.badge')}
                </p>
              </div>
            </label>
          </div>

          {loginMethods.length === 0 && (
            <p className="text-xs text-destructive">
              {t('settings.loginRequiredInline')}
            </p>
          )}

          <Button
            type="button"
            size="sm"
            onClick={handleSaveLoginConfig}
            disabled={
              isSavingLogin || loginMethods.length === 0 || !clanSettings
            }
          >
            {isSavingLogin ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {tCommon('saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('settings.saveLoginConfig')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            {t('settings.system.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">
                {t('settings.system.version')}
              </span>
              <Badge variant="outline">{APP_VERSION_DISPLAY}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">
                {t('settings.system.database')}
              </span>
              <Badge variant="outline">{t('settings.system.databaseValue')}</Badge>
            </div>
            {clanSettings?.updated_at && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">
                  {t('settings.system.lastUpdated')}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(clanSettings.updated_at)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
