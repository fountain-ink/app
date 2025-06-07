-- Add comprehensive RLS policies for all tables

-- First, ensure RLS is enabled on all tables (some might already have it)
ALTER TABLE IF EXISTS public.banlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.curated ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with consistent naming
DROP POLICY IF EXISTS "Allow all users to read any blog" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to delete own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to insert own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to update own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Users can delete own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can insert own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can read own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can update own drafts" ON public.drafts;
DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can read own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- BANLIST TABLE POLICIES
-- Public read access (needed to check if addresses are banned)
CREATE POLICY "banlist_select_public"
ON public.banlist FOR SELECT
TO public
USING (true);

-- Only service role can insert/update/delete (admin operations handled at app layer)
-- No additional policies needed as service role bypasses RLS

-- BLOGS TABLE POLICIES
-- Public read access to all blogs
CREATE POLICY "blogs_select_public"
ON public.blogs FOR SELECT
TO public
USING (true);

-- Authenticated users can create blogs they own
CREATE POLICY "blogs_insert_owner"
ON public.blogs FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = owner
);

-- Blog owners can update their own blogs
CREATE POLICY "blogs_update_owner"
ON public.blogs FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = owner
);

-- Blog owners can delete their own blogs
CREATE POLICY "blogs_delete_owner"
ON public.blogs FOR DELETE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = owner
);

-- CURATED TABLE POLICIES
-- Public read access to curated posts
CREATE POLICY "curated_select_public"
ON public.curated FOR SELECT
TO public
USING (true);

-- Only service role can manage curated posts (admin operations)
-- No additional policies needed

-- DRAFTS TABLE POLICIES
-- Authors can read their own drafts
CREATE POLICY "drafts_select_author"
ON public.drafts FOR SELECT
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authenticated users can read drafts they are contributors to
CREATE POLICY "drafts_select_contributors"
ON public.drafts FOR SELECT
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = ANY(contributors)
);

-- Authors can create their own drafts
CREATE POLICY "drafts_insert_author"
ON public.drafts FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authors can update their own drafts
CREATE POLICY "drafts_update_author"
ON public.drafts FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Contributors can update drafts they contribute to
CREATE POLICY "drafts_update_contributors"
ON public.drafts FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = ANY(contributors)
);

-- Authors can delete their own drafts
CREATE POLICY "drafts_delete_author"
ON public.drafts FOR DELETE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- FEEDBACK TABLE POLICIES
-- Authors can read their own feedback
CREATE POLICY "feedback_select_author"
ON public.feedback FOR SELECT
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authenticated users can create feedback
CREATE POLICY "feedback_insert_authenticated"
ON public.feedback FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authors can update their own feedback (e.g., to mark as resolved)
CREATE POLICY "feedback_update_author"
ON public.feedback FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- POSTS TABLE POLICIES
-- Public read access to all posts
CREATE POLICY "posts_select_public"
ON public.posts FOR SELECT
TO public
USING (true);

-- Authors can create their own posts
CREATE POLICY "posts_insert_author"
ON public.posts FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authors can update their own posts
CREATE POLICY "posts_update_author"
ON public.posts FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- Authors can delete their own posts
CREATE POLICY "posts_delete_author"
ON public.posts FOR DELETE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = author
);

-- USERS TABLE POLICIES
-- Public read access to user profiles (non-sensitive data)
CREATE POLICY "users_select_public"
ON public.users FOR SELECT
TO public
USING (true);

-- Users can insert their own profile
CREATE POLICY "users_insert_self"
ON public.users FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = address
);

-- Users can update their own profile
CREATE POLICY "users_update_self"
ON public.users FOR UPDATE
TO public
USING (
  (auth.jwt() ->> 'sub'::text) IS NOT NULL AND
  (auth.jwt() ->> 'sub'::text) = address
);

-- Users cannot delete profiles (handled at app layer if needed)
-- No delete policy for users table

-- Add helpful comments
COMMENT ON POLICY "banlist_select_public" ON public.banlist IS 'Allow public read access to check if addresses are banned';
COMMENT ON POLICY "blogs_select_public" ON public.blogs IS 'Allow public read access to all blogs';
COMMENT ON POLICY "blogs_insert_owner" ON public.blogs IS 'Only blog owners can create blogs';
COMMENT ON POLICY "blogs_update_owner" ON public.blogs IS 'Only blog owners can update their blogs';
COMMENT ON POLICY "blogs_delete_owner" ON public.blogs IS 'Only blog owners can delete their blogs';
COMMENT ON POLICY "curated_select_public" ON public.curated IS 'Allow public read access to curated posts';
COMMENT ON POLICY "drafts_select_author" ON public.drafts IS 'Authors can read their own drafts';
COMMENT ON POLICY "drafts_select_contributors" ON public.drafts IS 'Contributors can read drafts they contribute to';
COMMENT ON POLICY "drafts_insert_author" ON public.drafts IS 'Authors can create their own drafts';
COMMENT ON POLICY "drafts_update_author" ON public.drafts IS 'Authors can update their own drafts';
COMMENT ON POLICY "drafts_update_contributors" ON public.drafts IS 'Contributors can update drafts they contribute to';
COMMENT ON POLICY "drafts_delete_author" ON public.drafts IS 'Authors can delete their own drafts';
COMMENT ON POLICY "feedback_select_author" ON public.feedback IS 'Users can read their own feedback';
COMMENT ON POLICY "feedback_insert_authenticated" ON public.feedback IS 'Authenticated users can submit feedback';
COMMENT ON POLICY "feedback_update_author" ON public.feedback IS 'Users can update their own feedback';
COMMENT ON POLICY "posts_select_public" ON public.posts IS 'Allow public read access to all posts';
COMMENT ON POLICY "posts_insert_author" ON public.posts IS 'Authors can create their own posts';
COMMENT ON POLICY "posts_update_author" ON public.posts IS 'Authors can update their own posts';
COMMENT ON POLICY "posts_delete_author" ON public.posts IS 'Authors can delete their own posts';
COMMENT ON POLICY "users_select_public" ON public.users IS 'Allow public read access to user profiles';
COMMENT ON POLICY "users_insert_self" ON public.users IS 'Users can create their own profile';
COMMENT ON POLICY "users_update_self" ON public.users IS 'Users can update their own profile';