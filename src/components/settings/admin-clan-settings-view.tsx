/**
 * @project AncestorTree
 * @file src/components/settings/admin-clan-settings-view.tsx
 * @description Admin clan settings — orchestrates settings state and composes
 *              section cards (info, council, history, hall, login, system)
 * @version 2.0.0
 * @updated 2026-10-29
 */

'use client';

import { useAuth } from '@components/auth';
import { AccessDenied } from '@components/shared';
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
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { AncestralHallCard } from './ancestral-hall-card';
import { ClanInfoCard, type ClanInfoValues } from './clan-info-card';
import { CouncilCard } from './council-card';
import { HistoryMissionCard } from './history-mission-card';
import { LoginMethodsCard } from './login-methods-card';
import { NotificationBroadcastCard } from './notification-broadcast-card';
import { SystemInfoCard } from './system-info-card';

export function AdminClanSettingsView() {
  const t = useTranslations('Admin');
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

  const infoValues: ClanInfoValues = {
    clanName,
    clanFullName,
    foundingYear,
    origin,
    patriarch,
    description,
    contactEmail,
    contactPhone,
  };

  const infoSetters: Record<keyof ClanInfoValues, (v: string) => void> = {
    clanName: setClanName,
    clanFullName: setClanFullName,
    foundingYear: setFoundingYear,
    origin: setOrigin,
    patriarch: setPatriarch,
    description: setDescription,
    contactEmail: setContactEmail,
    contactPhone: setContactPhone,
  };

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          {t('settings.title')}
        </h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <ClanInfoCard
        values={infoValues}
        onFieldChange={(field, value) => infoSetters[field](value)}
        previewInitial={previewInitial}
        previewSubtitle={previewSubtitle}
        fallbackClanName={ENV_CLAN_NAME}
        isLoading={isLoading}
        isSaving={updateMutation.isPending}
        canSubmit={!!clanSettings}
        onSubmit={handleSave}
      />

      <CouncilCard members={councilMembers} onChange={setCouncilMembers} />

      <HistoryMissionCard
        history={clanHistory}
        mission={clanMission}
        onHistoryChange={setClanHistory}
        onMissionChange={setClanMission}
      />

      <AncestralHallCard
        address={hallAddress}
        history={hallHistory}
        ceremonies={ceremonies}
        onAddressChange={setHallAddress}
        onHistoryChange={setHallHistory}
        onCeremoniesChange={setCeremonies}
      />

      <NotificationBroadcastCard />

      <LoginMethodsCard
        methods={loginMethods}
        onMethodsChange={setLoginMethods}
        onSave={handleSaveLoginConfig}
        isSaving={isSavingLogin}
        canSubmit={!!clanSettings}
      />

      <SystemInfoCard updatedAt={clanSettings?.updated_at} />
    </div>
  );
}
