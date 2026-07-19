export interface Person {
  id: string;
  handle: string;
  display_name: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  pen_name?: string; // Tên tự (courtesy name)
  taboo_name?: string; // Tên húy (taboo name)
  gender: 1 | 2; // 1=Male, 2=Female
  generation: number;
  chi?: number;

  // Birth
  birth_date?: string;
  birth_year?: number;
  birth_place?: string;

  // Death
  death_date?: string;
  death_year?: number;
  death_place?: string;
  death_lunar?: string; // "15/7" format

  // Status
  is_living: boolean;
  is_patrilineal: boolean;

  // Contact
  phone?: string;
  email?: string;
  zalo?: string;
  facebook?: string;
  address?: string;
  hometown?: string;

  // Bio
  occupation?: string;
  biography?: string;
  notes?: string;
  avatar_url?: string;

  // Privacy: 0=public, 1=members only, 2=private
  privacy_level: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export type CreatePersonInput = Omit<Person, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePersonInput = Partial<CreatePersonInput>;

/** Filters for Supabase `search_people_filtered` RPC (people list page). */
export interface PeopleListFilters {
  search: string;
  generation: number | null;
  chi: number | null;
  isLiving: boolean | null;
  ignoreAccents?: boolean;
}

/** Distinct filter dropdown values from `get_people_filter_options` RPC. */
export interface PeopleFilterOptions {
  generations: number[];
  chiValues: number[];
}
