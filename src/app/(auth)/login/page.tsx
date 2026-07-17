/**
 * @project AncestorTree
 * @file src/app/(auth)/login/page.tsx
 * @description Login page — email+password or OTP email (configurable)
 * @version 2.2.0
 * @updated 2026-07-17
 */

import { LoginForm } from '@components/auth';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
