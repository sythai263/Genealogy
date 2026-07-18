/**
 * @project AncestorTree
 * @file src/components/settings/map-totp-factors.ts
 * @description Map Supabase auth factors to TotpFactor
 * @version 1.0.0
 * @updated 2026-07-18
 */

import type { TotpFactor } from '@types';

interface AuthFactorLike {
  id: string;
  factor_type: string;
  friendly_name?: string;
  status: string;
}

export function mapTotpFactors(
  factors: AuthFactorLike[] | undefined
): TotpFactor[] {
  return (factors ?? [])
    .filter((factor) => factor.factor_type === 'totp')
    .map((factor) => ({
      id: factor.id,
      friendly_name: factor.friendly_name,
      status: factor.status === 'verified' ? 'verified' : 'unverified',
    }));
}
