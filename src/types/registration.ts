export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface MemberRegistration {
  id: string;
  full_name: string;
  gender: 1 | 2;
  birth_year?: number;
  birth_place?: string;
  phone?: string;
  email?: string;
  parent_name?: string;
  generation?: number;
  chi?: number;
  relationship?: string;
  notes?: string;
  status: RegistrationStatus;
  reject_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  person_id?: string;
  created_at: string;
}

export interface CreateRegistrationInput {
  full_name: string;
  gender: 1 | 2;
  birth_year?: number;
  birth_place?: string;
  phone?: string;
  email?: string;
  parent_name?: string;
  generation?: number;
  chi?: number;
  relationship?: string;
  notes?: string;
  honeypot?: string;
}

export interface RegistrationsListFilters {
  status?: string;
  search?: string;
  page: number;
  pageSize: 20 | 30 | 50;
}
