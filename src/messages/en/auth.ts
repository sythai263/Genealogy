/**
 * @project AncestorTree
 * @file src/messages/en/auth.ts
 * @description Auth pages: login, register, OTP, MFA, password reset
 * @version 1.1.0
 * @updated 2026-08-09
 */

import type { AppMessages } from '../types';

export const Auth = {
  login: {
    title: 'Sign in',
    description: 'Family tree portal',
    otpTitle: 'Sign in with OTP',
    otpDescription: 'No password needed',
    totpTitle: 'Two-factor authentication',
    totpDescription: 'Enter the code from your authenticator app',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in...',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    registerLink: 'Sign up',
    tabPassword: 'Password',
    tabOtp: 'OTP code',
    success: 'Signed in successfully!',
    failed: 'Sign-in failed',
    suspended:
      'Your account has been locked. Please contact an administrator.',
    lockout: 'Too many failed attempts. Try again in {seconds} seconds.',
    retryAfter: 'Retry in {seconds}s',
  },
  otp: {
    sendCode: 'Send OTP',
    sending: 'Sending...',
    sendingCode: 'Sending code...',
    codeSent: 'An OTP has been sent to your email',
    codeSentBanner:
      'OTP sent to <email></email>. Check your inbox (including spam).',
    enterCode: 'Enter the 6-digit OTP',
    codeLabel: 'OTP code',
    codeLabelDigits: 'OTP code (6 digits)',
    validFor: 'Code is valid for 15 minutes',
    emailHint:
      'Enter your registered email — we will send a 6-digit OTP so you can sign in without a password.',
    changeEmail: 'Change email',
    passwordLogin: 'Sign in with password',
    resend: 'Resend code',
    noAccount: 'This email has no account. Please sign up first.',
    sendFailed: 'Could not send OTP',
    invalidCode: 'Invalid OTP',
    expiredCode: 'OTP is incorrect or expired. Please try again.',
  },
  totp: {
    confirm: 'Confirm',
    confirming: 'Confirming...',
    verifying: 'Verifying...',
    success: 'Two-factor authentication successful!',
    invalidCode:
      'Code is incorrect or expired. Check your device clock and try again.',
    codeLabel: 'Authentication code',
    hint: 'Enter the 6-digit code from your authenticator app (Google Authenticator).',
    backToLogin: 'Back to sign in',
  },
  register: {
    title: 'Sign up',
    description: 'Create an account to access the family tree',
    fullName: 'Full name',
    fullNamePlaceholder: 'John Doe',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    submit: 'Sign up',
    submitting: 'Signing up...',
    failed: 'Sign-up failed',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
    checkEmailTitle: 'Check your email',
    checkEmailDescription:
      'We sent a confirmation email. Please open your inbox and follow the instructions.',
    checkEmailSentTo: 'We sent a confirmation email to <email></email>',
    checkEmailAdminNote:
      'Please click the link in the email to confirm your account. After email confirmation, an administrator will approve your account.',
    alreadyVerified: 'Already confirmed? Sign in',
  },
  forgotPassword: {
    title: 'Forgot password',
    description: 'Enter your email to receive a reset link',
    email: 'Email',
    submit: 'Send reset link',
    submitting: 'Sending...',
    success: 'Password reset email sent!',
    failed: 'Failed to send email',
    backToLogin: 'Back to sign in',
    sentTo:
      'A password reset email was sent to <email></email>. Please check your inbox (including spam).',
  },
  resetPassword: {
    title: 'Reset password',
    description: 'Enter a new password for your account',
    password: 'New password',
    confirmPassword: 'Confirm password',
    submit: 'Reset password',
    submitting: 'Saving...',
    updating: 'Updating...',
    verifyingLink: 'Verifying password reset link...',
    success: 'Password reset successfully!',
    failed: 'Password reset failed',
  },
  pendingVerification: {
    title: 'Awaiting account verification',
    description:
      'Your account was created but has not been verified by an admin. Please contact the clan administrators.',
    registeredSuccess: 'Your account was registered successfully.',
    waitMessage:
      'Please wait for an administrator to verify your account before full access. You will be notified when it is activated.',
    contactHint: 'Provide your full name and relationship to the clan when contacting.',
    contactIfError:
      'If you believe this is an error, please contact a clan administrator.',
    logout: 'Sign out',
  },
  verificationGuard: {
    title: 'Account not verified',
    message: 'An admin must verify your account before you can use this feature.',
  },
} as const satisfies AppMessages['Auth'];
