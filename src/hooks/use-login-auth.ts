'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createMfaChallenge,
  getVerifiedTotpFactorId,
  sendLoginOtp,
  signOutAuth,
  verifyLoginOtp,
  verifyMfaCode,
} from '@services/auth';

export function useSendLoginOtp() {
  return useMutation({
    mutationFn: (email: string) => sendLoginOtp(email),
  });
}

export function useVerifyLoginOtp() {
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) =>
      verifyLoginOtp(email, token),
  });
}

export function useMfaChallenge(factorId: string) {
  return useQuery({
    queryKey: ['mfa-challenge', factorId],
    queryFn: () => createMfaChallenge(factorId),
    staleTime: 0,
    retry: false,
  });
}

export function useRefreshMfaChallenge() {
  return useMutation({
    mutationFn: (factorId: string) => createMfaChallenge(factorId),
  });
}

export function useVerifyMfaCode() {
  return useMutation({
    mutationFn: ({
      factorId,
      code,
      challengeId,
    }: {
      factorId: string;
      code: string;
      challengeId: string | null;
    }) => verifyMfaCode(factorId, code, challengeId),
  });
}

export function useVerifiedTotpFactor() {
  return useMutation({
    mutationFn: () => getVerifiedTotpFactorId(),
  });
}

export function useSignOutAuth() {
  return useMutation({
    mutationFn: () => signOutAuth(),
  });
}
