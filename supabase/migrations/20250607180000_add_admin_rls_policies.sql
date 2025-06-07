-- Create function to check if the current user is an admin
-- This checks the JWT metadata for the isAdmin flag
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Extract isAdmin from JWT metadata
  -- The JWT structure is: { metadata: { isAdmin: boolean } }
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::json -> 'metadata' ->> 'isAdmin')::boolean,
    false
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin policies for banlist table
-- Admins can perform all operations on banlist
CREATE POLICY "admin_select_banlist" ON banlist
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_banlist" ON banlist
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_banlist" ON banlist
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_banlist" ON banlist
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admin policies for curated table
-- Admins can manage featured posts
CREATE POLICY "admin_select_curated" ON curated
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_insert_curated" ON curated
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_curated" ON curated
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_curated" ON curated
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admin policies for feedback table
-- Admins can view and update all feedback
CREATE POLICY "admin_select_all_feedback" ON feedback
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_feedback" ON feedback
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for drafts table
-- Admins can read all drafts for moderation
CREATE POLICY "admin_select_all_drafts" ON drafts
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Admin policies for posts table
-- Admins can moderate posts (update/delete)
CREATE POLICY "admin_update_posts" ON posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_posts" ON posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Admin policies for users table
-- Admins can update user records (e.g., to set admin status)
CREATE POLICY "admin_select_all_users" ON users
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_users" ON users
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin policies for blogs table
-- Admins can moderate blogs
CREATE POLICY "admin_select_all_blogs" ON blogs
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "admin_update_blogs" ON blogs
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_blogs" ON blogs
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Create indexes for better performance on admin operations
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_drafts_createdAt ON drafts("createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_curated_created_at ON curated(created_at DESC);

-- Add comment explaining the admin system
COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current user has admin privileges based on JWT metadata.isAdmin flag';