export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  /** FK → people.id: which person in the tree this user IS */
  linked_person?: string;
  /** FK → people.id: subtree root this user can edit (null = global editor) */
  edit_root_person_id?: string;
  avatar_url?: string;
  is_verified?: boolean;
  can_verify_members?: boolean;
  is_suspended?: boolean;
  suspension_reason?: string;
  created_at: string;
  updated_at: string;
}
