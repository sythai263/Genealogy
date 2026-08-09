/**
 * @project AncestorTree
 * @file src/components/settings/admin-clan-settings-view.tsx
 * @description Admin clan configuration CRUD view
 * @version 2.1.0
 * @updated 2026-08-09
 */

'use client';

import { useAuth } from '@components/auth';
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
import { APP_VERSION_DISPLAY, IS_DESKTOP_MODE } from '@constants';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

export function AdminClanSettingsView() {
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
  // Sprint 18: Council + Ancestral Hall
  const [councilMembers, setCouncilMembers] = useState<CouncilMember[]>([]);
  const [clanHistory, setClanHistory] = useState('');
  const [clanMission, setClanMission] = useState('');
  const [hallAddress, setHallAddress] = useState('');
  const [hallHistory, setHallHistory] = useState('');
  const [ceremonies, setCeremonies] = useState<CeremonyScheduleItem[]>([]);
  // Login config
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
    return (
      <div className='container mx-auto px-4 py-8'>
        <Card>
          <CardContent className='py-12 text-center'>
            <p className='text-muted-foreground'>
              Bạn cần quyền biên tập viên để truy cập trang này
            </p>
            <Button asChild className='mt-4'>
              <Link href='/admin'>Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!clanSettings) return;
    if (!clanName.trim() || !clanFullName.trim()) {
      toast.error('Tên dòng họ không được để trống');
      return;
    }
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      toast.error('Email không hợp lệ');
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
      council_members: councilMembers.filter(m => m.name.trim()),
      clan_history: clanHistory.trim() || undefined,
      clan_mission: clanMission.trim() || undefined,
      ancestral_hall_address: hallAddress.trim() || undefined,
      ancestral_hall_history: hallHistory.trim() || undefined,
      ceremony_schedule: ceremonies.filter(c => c.title.trim()),
    };
    try {
      await updateMutation.mutateAsync({ id: clanSettings.id, input });
      toast.success('Đã lưu thông tin dòng họ');
      router.refresh();
    } catch {
      toast.error('Lỗi khi lưu cài đặt');
    }
  };

  async function handleSaveLoginConfig() {
    if (!clanSettings) return;
    // At least one method must be enabled
    if (loginMethods.length === 0) {
      toast.error('Phải bật ít nhất một phương thức đăng nhập');
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
      toast.success('Đã lưu cấu hình đăng nhập');
    } catch {
      toast.error('Lỗi khi lưu cấu hình đăng nhập');
    } finally {
      setIsSavingLogin(false);
    }
  };

  const previewInitial = deriveClanInitial(clanName || ENV_CLAN_NAME);
  const previewSubtitle = deriveClanSubtitle(
    clanFullName || ENV_CLAN_FULL_NAME,
    clanName || ENV_CLAN_NAME
  );

  return (
    <div className='container mx-auto p-4 space-y-6 max-w-3xl'>
      <div>
        <h1 className='text-2xl font-bold flex items-center gap-2'>
          <Settings className='h-6 w-6' />
          Cài đặt
        </h1>
        <p className='text-muted-foreground'>
          Cấu hình thông tin dòng họ hiển thị trên toàn bộ ứng dụng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            Thông tin dòng họ
          </CardTitle>
          <CardDescription>
            Chỉnh sửa và lưu để cập nhật ngay — không cần build lại ứng dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className='h-10 w-full' />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className='space-y-5'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label>Tên dòng họ (ngắn) *</Label>
                  <Input
                    value={clanName}
                    onChange={e => setClanName(e.target.value)}
                    placeholder='Họ Đặng'
                    className='mt-1'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Hiển thị trên sidebar
                  </p>
                </div>
                <div>
                  <Label>Năm thành lập</Label>
                  <Input
                    type='number'
                    value={foundingYear}
                    onChange={e => setFoundingYear(e.target.value)}
                    placeholder='1750'
                    min={1000}
                    max={2100}
                    className='mt-1'
                  />
                </div>
              </div>

              <div>
                <Label>Tên dòng họ (đầy đủ) *</Label>
                <Input
                  value={clanFullName}
                  onChange={e => setClanFullName(e.target.value)}
                  placeholder='Họ Đặng làng Kỷ Các, Thạch Lâm, Hà Tĩnh'
                  className='mt-1'
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  Hiển thị trên trang chủ, đăng nhập, gia phả sách
                </p>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label>Thủy tổ</Label>
                  <Input
                    value={patriarch}
                    onChange={e => setPatriarch(e.target.value)}
                    placeholder='Cụ Đặng Đình...'
                    className='mt-1'
                  />
                </div>
                <div>
                  <Label>Quê gốc</Label>
                  <Input
                    value={origin}
                    onChange={e => setOrigin(e.target.value)}
                    placeholder='Thạch Lâm, Thạch Hà, Hà Tĩnh'
                    className='mt-1'
                  />
                </div>
              </div>

              <div>
                <Label>Lịch sử / Mô tả</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder='Giới thiệu lịch sử dòng họ...'
                  className='mt-1'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label>Email liên hệ</Label>
                  <Input
                    type='email'
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder='hoidong@example.com'
                    className='mt-1'
                  />
                </div>
                <div>
                  <Label>Điện thoại liên hệ</Label>
                  <Input
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder='0912 345 678'
                    className='mt-1'
                  />
                </div>
              </div>

              {/* Live preview */}
              <div className='rounded-lg border bg-muted/30 p-4 space-y-2'>
                <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Xem trước — Sidebar
                </p>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg shrink-0'>
                    {previewInitial}
                  </div>
                  <div>
                    <p className='font-semibold text-sm'>
                      {clanName || ENV_CLAN_NAME}
                    </p>
                    {previewSubtitle && (
                      <p className='text-xs text-muted-foreground'>
                        {previewSubtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type='submit'
                disabled={updateMutation.isPending || !clanSettings}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Council members */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Hội đồng gia tộc
          </CardTitle>
          <CardDescription>
            Thành viên ban quản trị hiển thị trên trang công khai /council
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {councilMembers.map((m, i) => (
            <div key={i} className='flex gap-2 items-start'>
              <div className='flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2'>
                <Input
                  placeholder='Họ tên'
                  value={m.name}
                  onChange={e => {
                    const updated = [...councilMembers];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setCouncilMembers(updated);
                  }}
                />
                <Input
                  placeholder='Chức vụ'
                  value={m.title}
                  onChange={e => {
                    const updated = [...councilMembers];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setCouncilMembers(updated);
                  }}
                />
                <Input
                  placeholder='Điện thoại (tùy chọn)'
                  value={m.phone ?? ''}
                  onChange={e => {
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
                type='button'
                variant='ghost'
                size='sm'
                className='h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0'
                onClick={() =>
                  setCouncilMembers(councilMembers.filter((_, j) => j !== i))
                }>
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() =>
              setCouncilMembers([...councilMembers, { name: '', title: '' }])
            }>
            <Plus className='h-4 w-4 mr-1' />
            Thêm thành viên
          </Button>
        </CardContent>
      </Card>

      {/* History + Mission */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Globe className='h-4 w-4' />
            Lịch sử & Sứ mệnh
          </CardTitle>
          <CardDescription>
            Hiển thị trên trang Hội đồng gia tộc (/council)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Lịch sử dòng họ</Label>
            <Textarea
              value={clanHistory}
              onChange={e => setClanHistory(e.target.value)}
              rows={4}
              placeholder='Nguồn gốc, lịch sử phát triển dòng họ...'
              className='mt-1'
            />
          </div>
          <div>
            <Label>Sứ mệnh & Tầm nhìn</Label>
            <Textarea
              value={clanMission}
              onChange={e => setClanMission(e.target.value)}
              rows={3}
              placeholder='Sứ mệnh gìn giữ và phát triển...'
              className='mt-1'
            />
          </div>
        </CardContent>
      </Card>

      {/* Ancestral Hall */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Landmark className='h-4 w-4' />
            Nhà thờ họ
          </CardTitle>
          <CardDescription>
            Thông tin nhà thờ hiển thị trên /ancestral-hall
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Địa chỉ nhà thờ</Label>
            <Input
              value={hallAddress}
              onChange={e => setHallAddress(e.target.value)}
              placeholder='Xã Thạch Lâm, Thạch Hà, Hà Tĩnh'
              className='mt-1'
            />
          </div>
          <div>
            <Label>Lịch sử nhà thờ</Label>
            <Textarea
              value={hallHistory}
              onChange={e => setHallHistory(e.target.value)}
              rows={3}
              placeholder='Lịch sử xây dựng, trùng tu nhà thờ...'
              className='mt-1'
            />
          </div>

          {/* Ceremony schedule */}
          <div className='border-t pt-4 space-y-3'>
            <Label className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Lịch tế lễ hàng năm
            </Label>
            <p className='text-xs text-muted-foreground'>
              Hiển thị trên trang Nhà thờ họ (/ancestral-hall)
            </p>
            {ceremonies.map((c, i) => (
              <div key={i} className='flex gap-2 items-start'>
                <div className='flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2'>
                  <Input
                    placeholder='Tên lễ'
                    value={c.title}
                    onChange={e => {
                      const updated = [...ceremonies];
                      updated[i] = { ...updated[i], title: e.target.value };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder='Ngày AL (VD: 15/7)'
                    value={c.lunar_date ?? ''}
                    onChange={e => {
                      const updated = [...ceremonies];
                      updated[i] = {
                        ...updated[i],
                        lunar_date: e.target.value || undefined,
                      };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder='Ngày DL (VD: 20/08)'
                    value={c.solar_date ?? ''}
                    onChange={e => {
                      const updated = [...ceremonies];
                      updated[i] = {
                        ...updated[i],
                        solar_date: e.target.value || undefined,
                      };
                      setCeremonies(updated);
                    }}
                  />
                  <Input
                    placeholder='Ghi chú'
                    value={c.description ?? ''}
                    onChange={e => {
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
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-9 w-9 p-0 text-muted-foreground hover:text-destructive shrink-0'
                  onClick={() =>
                    setCeremonies(ceremonies.filter((_, j) => j !== i))
                  }>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setCeremonies([...ceremonies, { title: '' }])}>
              <Plus className='h-4 w-4 mr-1' />
              Thêm ngày lễ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login config */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Lock className='h-4 w-4' />
            Cấu hình đăng nhập
          </CardTitle>
          <CardDescription>
            Chọn phương thức đăng nhập cho thành viên. Phải bật ít nhất một
            phương thức.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            {/* Email + Password */}
            <label className='flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors'>
              <input
                type='checkbox'
                checked={loginMethods.includes('email_password')}
                onChange={e => {
                  if (e.target.checked) {
                    setLoginMethods(prev => [...prev, 'email_password']);
                  } else {
                    setLoginMethods(prev =>
                      prev.filter(m => m !== 'email_password')
                    );
                  }
                }}
                className='mt-0.5'
              />
              <div className='flex-1'>
                <p className='font-medium text-sm'>Email &amp; Mật khẩu</p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Đăng nhập truyền thống bằng email và mật khẩu. Hỗ trợ xác thực
                  2 bước (TOTP).
                </p>
              </div>
            </label>

            {/* OTP Email */}
            <label className='flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors'>
              <input
                type='checkbox'
                checked={loginMethods.includes('email_otp')}
                onChange={e => {
                  if (e.target.checked) {
                    setLoginMethods(prev => [...prev, 'email_otp']);
                  } else {
                    setLoginMethods(prev =>
                      prev.filter(m => m !== 'email_otp')
                    );
                  }
                }}
                className='mt-0.5'
              />
              <div className='flex-1'>
                <p className='font-medium text-sm'>Mã OTP qua Email</p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Không cần mật khẩu — hệ thống gửi mã 6 chữ số đến email. Phù
                  hợp cho thành viên cao tuổi, không rành công nghệ.
                </p>
                <p className='text-xs text-emerald-600 mt-1'>
                  Miễn phí • Supabase Magic Link
                </p>
              </div>
            </label>
          </div>

          {loginMethods.length === 0 && (
            <p className='text-xs text-destructive'>
              Vui lòng bật ít nhất một phương thức đăng nhập.
            </p>
          )}

          <Button
            type='button'
            size='sm'
            onClick={handleSaveLoginConfig}
            disabled={
              isSavingLogin || loginMethods.length === 0 || !clanSettings
            }>
            {isSavingLogin ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' />
                Lưu cấu hình đăng nhập
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Database className='h-4 w-4' />
            Thông tin hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex justify-between items-center py-2 border-b'>
              <span className='text-sm text-muted-foreground'>Phiên bản</span>
              <Badge variant='outline'>{APP_VERSION_DISPLAY}</Badge>
            </div>
            <div className='flex justify-between items-center py-2 border-b'>
              <span className='text-sm text-muted-foreground'>Chế độ</span>
              <Badge variant={IS_DESKTOP_MODE ? 'default' : 'secondary'}>
                {IS_DESKTOP_MODE ? 'Desktop (Offline)' : 'Web (Online)'}
              </Badge>
            </div>
            <div className='flex justify-between items-center py-2 border-b'>
              <span className='text-sm text-muted-foreground'>
                Cơ sở dữ liệu
              </span>
              <Badge variant='outline'>
                {IS_DESKTOP_MODE ? 'SQLite (local)' : 'PostgreSQL (Supabase)'}
              </Badge>
            </div>
            {clanSettings?.updated_at && (
              <div className='flex justify-between items-center py-2'>
                <span className='text-sm text-muted-foreground'>
                  Cài đặt cập nhật lần cuối
                </span>
                <span className='text-xs text-muted-foreground'>
                  {new Date(clanSettings.updated_at).toLocaleDateString(
                    'vi-VN',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
