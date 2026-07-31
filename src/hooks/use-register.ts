'use client';

import { useMutation } from '@tanstack/react-query';
import { signUpAuth } from '@services';

interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password, fullName }: SignUpInput) =>
      signUpAuth(email, password, fullName),
  });
}
