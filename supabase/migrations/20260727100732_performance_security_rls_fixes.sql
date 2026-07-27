-- ═══════════════════════════════════════════════════════════════════════════
-- Migration: Fix Performance & Security Advisor RLS warnings
-- Source:
--   supabase/.temp/.data/Supabase Performance Security _performnace.csv
--   supabase/.temp/.data/Supabase Performance Security Lints _info.csv
--
-- Fixes:
--   auth_rls_initplan           — wrap auth.uid() in (SELECT auth.uid())
--   multiple_permissive_policies — TO-scoped policies; split FOR ALL;
--                                  consolidate overlapping SELECT/UPDATE/DELETE
--   unindexed_foreign_keys     — add covering indexes for FK columns
--
-- Unused-index INFO findings are left alone (indexes may be used by app
-- queries that have not hit pg_stat_user_indexes yet).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- Helper: stable role checks (single initplan evaluation of auth.uid())
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('admin', 'editor')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_verified_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = (SELECT auth.uid())
      AND is_verified = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_or_editor() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_verified_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_verified_user() TO authenticated, anon, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- people
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Public read for public non-contact people" ON public.people;
DROP POLICY IF EXISTS "Anon can read non-private people" ON public.people;
DROP POLICY IF EXISTS "Authenticated users can read non-private people" ON public.people;
DROP POLICY IF EXISTS "Admins can read all people" ON public.people;
DROP POLICY IF EXISTS "Admins and editors can insert people" ON public.people;
DROP POLICY IF EXISTS "Admins and editors can update people" ON public.people;
DROP POLICY IF EXISTS "Branch editors can update their subtree" ON public.people;
DROP POLICY IF EXISTS "Linked person can update own info" ON public.people;
DROP POLICY IF EXISTS "Admins can delete people" ON public.people;

CREATE POLICY "Anon can read non-private people"
  ON public.people
  FOR SELECT
  TO anon
  USING (privacy_level < 2);

CREATE POLICY "Authenticated can read people"
  ON public.people
  FOR SELECT
  TO authenticated
  USING (
    privacy_level < 2
    OR public.is_admin()
  );

CREATE POLICY "Admins and editors can insert people"
  ON public.people
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Authorized users can update people"
  ON public.people
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin_or_editor()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.linked_person = people.id
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.role = 'editor'
        AND p.edit_root_person_id IS NOT NULL
        AND public.is_person_in_subtree(p.edit_root_person_id, people.id)
    )
  )
  WITH CHECK (
    public.is_admin_or_editor()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.linked_person = people.id
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.role = 'editor'
        AND p.edit_root_person_id IS NOT NULL
        AND public.is_person_in_subtree(p.edit_root_person_id, people.id)
    )
  );

CREATE POLICY "Admins can delete people"
  ON public.people
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- families / children / events / media
-- Split FOR ALL manage policies so they no longer overlap SELECT reads.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated can read families" ON public.families;
DROP POLICY IF EXISTS "Anon can read families for public tree" ON public.families;
DROP POLICY IF EXISTS "Admins and editors can manage families" ON public.families;

CREATE POLICY "Anon can read families for public tree"
  ON public.families FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can read families"
  ON public.families FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins and editors can insert families"
  ON public.families FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update families"
  ON public.families FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete families"
  ON public.families FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Authenticated can read children" ON public.children;
DROP POLICY IF EXISTS "Anon can read children for public tree" ON public.children;
DROP POLICY IF EXISTS "Admins and editors can manage children" ON public.children;

CREATE POLICY "Anon can read children for public tree"
  ON public.children FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can read children"
  ON public.children FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins and editors can insert children"
  ON public.children FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update children"
  ON public.children FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete children"
  ON public.children FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Authenticated can read events" ON public.events;
DROP POLICY IF EXISTS "Admins and editors can manage events" ON public.events;

CREATE POLICY "Authenticated can read events"
  ON public.events FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins and editors can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Authenticated can read media" ON public.media;
DROP POLICY IF EXISTS "Admins and editors can manage media" ON public.media;

CREATE POLICY "Authenticated can read media"
  ON public.media FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Admins and editors can insert media"
  ON public.media FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update media"
  ON public.media FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete media"
  ON public.media FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

-- ═══════════════════════════════════════════════════════════════════════════
-- cau_duong_pools / cau_duong_assignments
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Anyone can view cau duong pools" ON public.cau_duong_pools;
DROP POLICY IF EXISTS "Admins and editors can manage cau duong pools" ON public.cau_duong_pools;

CREATE POLICY "Anyone can view cau duong pools"
  ON public.cau_duong_pools FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert cau duong pools"
  ON public.cau_duong_pools FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update cau duong pools"
  ON public.cau_duong_pools FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete cau duong pools"
  ON public.cau_duong_pools FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Anyone can view cau duong assignments" ON public.cau_duong_assignments;
DROP POLICY IF EXISTS "Admins and editors can manage cau duong assignments" ON public.cau_duong_assignments;

CREATE POLICY "Anyone can view cau duong assignments"
  ON public.cau_duong_assignments FOR SELECT
  USING (true);

CREATE POLICY "Admins and editors can insert cau duong assignments"
  ON public.cau_duong_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can update cau duong assignments"
  ON public.cau_duong_assignments FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins and editors can delete cau duong assignments"
  ON public.cau_duong_assignments FOR DELETE TO authenticated
  USING (public.is_admin_or_editor());

-- ═══════════════════════════════════════════════════════════════════════════
-- clan_documents — single SELECT policy for authenticated
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Auth view public documents" ON public.clan_documents;
DROP POLICY IF EXISTS "Members can view members-only documents" ON public.clan_documents;
DROP POLICY IF EXISTS "Admins and editors view all documents" ON public.clan_documents;
DROP POLICY IF EXISTS "Editors and admins can create documents" ON public.clan_documents;
DROP POLICY IF EXISTS "Editors and admins can update documents" ON public.clan_documents;
DROP POLICY IF EXISTS "Editors and admins can delete documents" ON public.clan_documents;

CREATE POLICY "Authenticated can view documents by privacy"
  ON public.clan_documents
  FOR SELECT
  TO authenticated
  USING (
    privacy_level = 0
    OR public.is_admin_or_editor()
  );

CREATE POLICY "Editors and admins can create documents"
  ON public.clan_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can update documents"
  ON public.clan_documents
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can delete documents"
  ON public.clan_documents
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor());

-- ═══════════════════════════════════════════════════════════════════════════
-- profiles — consolidate UPDATE; fix initplan on SELECT/INSERT
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can suspend or unsuspend accounts" ON public.profiles;
DROP POLICY IF EXISTS "Sub-admins verify members in subtree" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "Authorized users can update profiles"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (SELECT auth.uid())
        AND p.role IN ('admin', 'editor')
        AND p.can_verify_members = true
        AND (
          p.edit_root_person_id IS NULL
          OR (
            profiles.linked_person IS NOT NULL
            AND public.is_person_in_subtree(p.edit_root_person_id, profiles.linked_person)
          )
        )
    )
  )
  WITH CHECK (
    -- Admins may change any profile fields (incl. suspend)
    public.is_admin()
    -- Own profile (same as prior policy; role escalation guarded in app/triggers)
    OR user_id = (SELECT auth.uid())
    -- Sub-admins may verify members in subtree without changing role/email flags
    OR (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = (SELECT auth.uid())
          AND p.role IN ('admin', 'editor')
          AND p.can_verify_members = true
          AND (
            p.edit_root_person_id IS NULL
            OR (
              profiles.linked_person IS NOT NULL
              AND public.is_person_in_subtree(p.edit_root_person_id, profiles.linked_person)
            )
          )
      )
      AND role = (SELECT role FROM public.profiles p2 WHERE p2.id = profiles.id)
      AND can_verify_members = (SELECT can_verify_members FROM public.profiles p2 WHERE p2.id = profiles.id)
      AND email = (SELECT email FROM public.profiles p2 WHERE p2.id = profiles.id)
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- posts / post_likes / post_comments
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Authenticated users can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin/editor can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Verified users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin/editor can update any post" ON public.posts;
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admin can delete any post" ON public.posts;

CREATE POLICY "Authenticated can view posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR public.is_admin_or_editor()
  );

CREATE POLICY "Verified users can create posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND public.is_verified_user()
  );

CREATE POLICY "Authors or admins can update posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR public.is_admin_or_editor()
  )
  WITH CHECK (
    author_id = (SELECT auth.uid())
    OR public.is_admin_or_editor()
  );

CREATE POLICY "Authors or admins can delete posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Verified users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike (delete own like)" ON public.post_likes;

CREATE POLICY "Verified users can like posts"
  ON public.post_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.is_verified_user()
  );

CREATE POLICY "Users can unlike (delete own like)"
  ON public.post_likes
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Verified users can comment" ON public.post_comments;
DROP POLICY IF EXISTS "Authors can update own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Authors can delete own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Admin can delete any comment" ON public.post_comments;

CREATE POLICY "Verified users can comment"
  ON public.post_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = (SELECT auth.uid())
    AND public.is_verified_user()
  );

CREATE POLICY "Authors can update own comments"
  ON public.post_comments
  FOR UPDATE
  TO authenticated
  USING (author_id = (SELECT auth.uid()))
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors or admins can delete comments"
  ON public.post_comments
  FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT auth.uid())
    OR public.is_admin()
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- contributions / notifications / clan_settings / member_registrations
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can read own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Members can create contributions" ON public.contributions;
DROP POLICY IF EXISTS "Admins can update contributions" ON public.contributions;

CREATE POLICY "Users can read own contributions"
  ON public.contributions
  FOR SELECT
  TO authenticated
  USING (
    author_id IN (
      SELECT id FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
    OR public.is_admin()
  );

CREATE POLICY "Members can create contributions"
  ON public.contributions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can update contributions"
  ON public.contributions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications (mark read)" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications (mark read)"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins and editors can update clan settings" ON public.clan_settings;

CREATE POLICY "Admins and editors can update clan settings"
  ON public.clan_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "Admin/editor can view registrations" ON public.member_registrations;
DROP POLICY IF EXISTS "Admin/editor can update registrations" ON public.member_registrations;
DROP POLICY IF EXISTS "Admin can delete registrations" ON public.member_registrations;

CREATE POLICY "Admin/editor can view registrations"
  ON public.member_registrations
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor());

CREATE POLICY "Admin/editor can update registrations"
  ON public.member_registrations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admin can delete registrations"
  ON public.member_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- achievements / fund_transactions / scholarships / clan_articles
-- (initplan only — already split by command)
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Editors and admins can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Editors and admins can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admins can delete achievements" ON public.achievements;

CREATE POLICY "Editors and admins can insert achievements"
  ON public.achievements FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can update achievements"
  ON public.achievements FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins can delete achievements"
  ON public.achievements FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Editors and admins can insert fund transactions" ON public.fund_transactions;
DROP POLICY IF EXISTS "Editors and admins can update fund transactions" ON public.fund_transactions;
DROP POLICY IF EXISTS "Admins can delete fund transactions" ON public.fund_transactions;

CREATE POLICY "Editors and admins can insert fund transactions"
  ON public.fund_transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can update fund transactions"
  ON public.fund_transactions FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins can delete fund transactions"
  ON public.fund_transactions FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Editors and admins can insert scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Editors and admins can update scholarships" ON public.scholarships;
DROP POLICY IF EXISTS "Admins can delete scholarships" ON public.scholarships;

CREATE POLICY "Editors and admins can insert scholarships"
  ON public.scholarships FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can update scholarships"
  ON public.scholarships FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins can delete scholarships"
  ON public.scholarships FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Editors and admins can insert clan articles" ON public.clan_articles;
DROP POLICY IF EXISTS "Editors and admins can update clan articles" ON public.clan_articles;
DROP POLICY IF EXISTS "Admins can delete clan articles" ON public.clan_articles;

CREATE POLICY "Editors and admins can insert clan articles"
  ON public.clan_articles FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Editors and admins can update clan articles"
  ON public.clan_articles FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

CREATE POLICY "Admins can delete clan articles"
  ON public.clan_articles FOR DELETE TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- Unindexed foreign keys (INFO performance lints)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_cau_duong_assignments_actual_host
  ON public.cau_duong_assignments (actual_host_person_id);

CREATE INDEX IF NOT EXISTS idx_cau_duong_assignments_created_by
  ON public.cau_duong_assignments (created_by);

CREATE INDEX IF NOT EXISTS idx_clan_articles_author_id
  ON public.clan_articles (author_id);

CREATE INDEX IF NOT EXISTS idx_clan_documents_uploaded_by
  ON public.clan_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_clan_settings_updated_by
  ON public.clan_settings (updated_by);

CREATE INDEX IF NOT EXISTS idx_contributions_author_id
  ON public.contributions (author_id);

CREATE INDEX IF NOT EXISTS idx_contributions_reviewed_by
  ON public.contributions (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_contributions_target_person
  ON public.contributions (target_person);

CREATE INDEX IF NOT EXISTS idx_events_person_id
  ON public.events (person_id);

CREATE INDEX IF NOT EXISTS idx_fund_transactions_created_by
  ON public.fund_transactions (created_by);

CREATE INDEX IF NOT EXISTS idx_fund_transactions_donor_person_id
  ON public.fund_transactions (donor_person_id);

CREATE INDEX IF NOT EXISTS idx_fund_transactions_recipient_id
  ON public.fund_transactions (recipient_id);

CREATE INDEX IF NOT EXISTS idx_media_person_id
  ON public.media (person_id);

CREATE INDEX IF NOT EXISTS idx_member_registrations_person_id
  ON public.member_registrations (person_id);

CREATE INDEX IF NOT EXISTS idx_member_registrations_reviewed_by
  ON public.member_registrations (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_notifications_actor_id
  ON public.notifications (actor_id);

CREATE INDEX IF NOT EXISTS idx_scholarships_approved_by
  ON public.scholarships (approved_by);
