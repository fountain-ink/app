-- Add remaining RLS policies (skipping those already created by admin migration)

-- Ensure RLS is enabled on all tables
ALTER TABLE public.banlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clean up old blog policies with inconsistent naming
DROP POLICY IF EXISTS "Allow users to delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to read any blog" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to update their own blogs" ON public.blogs;

-- BLOGS TABLE POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_select_public') THEN
    CREATE POLICY "blogs_select_public" ON public.blogs FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_insert_owner') THEN
    CREATE POLICY "blogs_insert_owner" ON public.blogs FOR INSERT TO public
    WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = owner);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_update_owner') THEN
    CREATE POLICY "blogs_update_owner" ON public.blogs FOR UPDATE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = owner);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blogs' AND policyname = 'blogs_delete_owner') THEN
    CREATE POLICY "blogs_delete_owner" ON public.blogs FOR DELETE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = owner);
  END IF;
END $$;

-- The admin migration already added policies for:
-- - banlist_select_public
-- - curated_select_public  
-- - posts_select_public
-- - posts_insert_author
-- - posts_update_author
-- - posts_delete_author

-- So we only need to add the remaining policies for drafts, feedback, and users

-- DRAFTS TABLE POLICIES (some may already exist)
DO $$
BEGIN
  -- Check and create drafts policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_select_author') THEN
    CREATE POLICY "drafts_select_author" ON public.drafts FOR SELECT TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_select_contributors') THEN
    CREATE POLICY "drafts_select_contributors" ON public.drafts FOR SELECT TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = ANY(contributors));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_insert_author') THEN
    CREATE POLICY "drafts_insert_author" ON public.drafts FOR INSERT TO public
    WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_update_author') THEN
    CREATE POLICY "drafts_update_author" ON public.drafts FOR UPDATE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_update_contributors') THEN
    CREATE POLICY "drafts_update_contributors" ON public.drafts FOR UPDATE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = ANY(contributors));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drafts' AND policyname = 'drafts_delete_author') THEN
    CREATE POLICY "drafts_delete_author" ON public.drafts FOR DELETE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;
END $$;

-- FEEDBACK TABLE POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_select_author') THEN
    CREATE POLICY "feedback_select_author" ON public.feedback FOR SELECT TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_insert_authenticated') THEN
    CREATE POLICY "feedback_insert_authenticated" ON public.feedback FOR INSERT TO public
    WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'feedback' AND policyname = 'feedback_update_author') THEN
    CREATE POLICY "feedback_update_author" ON public.feedback FOR UPDATE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;
END $$;

-- USERS TABLE POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_public') THEN
    CREATE POLICY "users_select_public" ON public.users FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_self') THEN
    CREATE POLICY "users_insert_self" ON public.users FOR INSERT TO public
    WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = address);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_self') THEN
    CREATE POLICY "users_update_self" ON public.users FOR UPDATE TO public
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = address);
  END IF;
END $$;

-- Final verification
DO $$
DECLARE
  v_result text := '';
  r record;
BEGIN
  v_result := 'Final RLS policy count per table:' || E'\n';
  FOR r IN 
    SELECT tablename, COUNT(*) as policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    GROUP BY tablename 
    ORDER BY tablename
  LOOP
    v_result := v_result || '  ' || r.tablename || ': ' || r.policy_count || ' policies' || E'\n';
  END LOOP;
  
  RAISE NOTICE '%', v_result;
END $$;