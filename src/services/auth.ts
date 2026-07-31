import { supabase } from '@lib';

export class AuthServiceError extends Error {
  readonly status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AuthServiceError';
    this.status = status;
  }
}

export function isAuthServiceError(error: Error): error is AuthServiceError {
  return error.name === 'AuthServiceError';
}

function throwAuthError(error: { message: string; status?: number }): never {
  throw new AuthServiceError(error.message, error.status);
}

export async function requestPasswordReset(
  email: string,
  redirectTo: string
): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throwAuthError(error);
}

export async function sendLoginOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) throwAuthError(error);
}

export async function verifyLoginOtp(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throwAuthError(error);
}

export async function createMfaChallenge(factorId: string): Promise<string> {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) throwAuthError(error);
  return data.id;
}

export async function verifyMfaCode(
  factorId: string,
  code: string,
  challengeId: string | null
): Promise<void> {
  if (challengeId) {
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });
    if (error) throwAuthError(error);
    return;
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });
  if (error) throwAuthError(error);
}

export async function getVerifiedTotpFactorId(): Promise<string | null> {
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalData?.currentLevel !== 'aal1' || aalData?.nextLevel !== 'aal2') {
    return null;
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors();
  const totp = factorsData?.totp?.find((factor) => factor.status === 'verified');
  return totp?.id ?? null;
}

export async function signOutAuth(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throwAuthError(error);
}

export async function signUpAuth(
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throwAuthError(error);
}

export async function getAuthSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throwAuthError(error);
  return data.session;
}

export function subscribeToAuthStateChange(
  onEvent: (event: string) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    onEvent(event);
  });
  return () => subscription.unsubscribe();
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throwAuthError(error);
}
