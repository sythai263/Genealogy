/**
 * @project AncestorTree
 * @file src/app/(auth)/login/page.tsx
 * @description Login page — email+password or OTP email (configurable)
 * @version 2.2.0
 * @updated 2026-07-17
 */

import { Suspense } from 'react';
import { LoginForm } from '@components/auth/login-form';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
