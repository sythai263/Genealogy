export interface CouncilMember {
  name: string;
  title: string;
  phone?: string;
  avatar?: string;
}

export interface CeremonyScheduleItem {
  title: string;
  lunar_date?: string;
  solar_date?: string;
  description?: string;
}

export type LoginMethod = 'email_password' | 'email_otp';

export interface LoginConfig {
  methods: LoginMethod[];
  otp_expiry_minutes?: number;
}

export interface ClanSettings {
  id: string;
  clan_name: string;
  clan_full_name: string;
  clan_founding_year?: number;
  clan_origin?: string;
  clan_patriarch?: string;
  clan_description?: string;
  contact_email?: string;
  contact_phone?: string;
  council_members?: CouncilMember[];
  clan_history?: string;
  clan_mission?: string;
  ancestral_hall_images?: string[];
  ancestral_hall_address?: string;
  ancestral_hall_coordinates?: { lat: number; lng: number } | null;
  ancestral_hall_history?: string;
  ceremony_schedule?: CeremonyScheduleItem[];
  login_config?: LoginConfig;
  updated_at: string;
  updated_by?: string;
}

export type UpdateClanSettingsInput = Partial<
  Omit<ClanSettings, 'id' | 'updated_at' | 'updated_by'>
>;
