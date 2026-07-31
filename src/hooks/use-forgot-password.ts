'use client';

import { useMutation } from '@tanstack/react-query';
import { requestPasswordReset } from '@services';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) =>
      requestPasswordReset(email, `${window.location.origin}/reset-password`),
  });
}
