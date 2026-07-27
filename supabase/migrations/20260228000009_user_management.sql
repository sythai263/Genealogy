/**
 * @project AncestorTree
 * @file supabase/migrations/20260228000009_user_management.sql
 * @description Admin account suspension RLS policy.
 *              Columns is_suspended / suspension_reason are defined in database_setup.
 *              MFA (TOTP) is managed entirely by Supabase Auth.
 */

-- RLS: admins can update is_suspended and suspension_reason on any profile
CREATE POLICY "Admin can suspend or unsuspend accounts"
  ON profiles
  FOR UPDATE
  USING (
    (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (true);
