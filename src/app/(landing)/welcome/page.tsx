/**
 * @project AncestorTree
 * @file src/app/(landing)/welcome/page.tsx
 * @description Legacy /welcome → redirect to public home `/`
 * @version 3.0.0
 * @updated 2026-07-19
 */

import { redirect } from 'next/navigation';

export default function WelcomeRedirectPage() {
  redirect('/');
}
