'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getAuthSession,
  subscribeToAuthStateChange,
  updatePassword,
} from '@services/auth';

export function usePasswordRecoveryReady() {
  const [recoveryReady, setRecoveryReady] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ['auth-session'],
    queryFn: getAuthSession,
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    return subscribeToAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true);
      }
    });
  }, []);

  return {
    isReady: recoveryReady || !!sessionQuery.data,
    isChecking: sessionQuery.isLoading && !recoveryReady,
  };
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => updatePassword(password),
  });
}
