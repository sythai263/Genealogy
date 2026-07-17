export type FundTransactionType = 'income' | 'expense';
export type FundCategory = 'dong_gop' | 'hoc_bong' | 'khen_thuong' | 'other';

export interface FundTransaction {
  id: string;
  type: FundTransactionType;
  category: FundCategory;
  amount: number;
  donor_name?: string;
  donor_person_id?: string;
  recipient_id?: string;
  description?: string;
  transaction_date: string;
  academic_year?: string;
  created_by?: string;
  created_at: string;
}

export type CreateFundTransactionInput = Omit<FundTransaction, 'id' | 'created_at'>;

export interface FundBalance {
  income: number;
  expense: number;
  balance: number;
}

export type ScholarshipType = 'hoc_bong' | 'khen_thuong';
export type ScholarshipStatus = 'pending' | 'approved' | 'paid';

export interface Scholarship {
  id: string;
  person_id: string;
  type: ScholarshipType;
  amount: number;
  reason?: string;
  academic_year: string;
  school?: string;
  grade_level?: string;
  status: ScholarshipStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export type CreateScholarshipInput = Omit<
  Scholarship,
  'id' | 'approved_by' | 'approved_at' | 'created_at'
>;
