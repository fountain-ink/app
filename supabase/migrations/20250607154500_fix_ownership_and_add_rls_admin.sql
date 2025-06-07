-- Fix table ownership to prevent future migration failures
-- Run this migration through Supabase SQL editor as admin

-- Step 1: Change ownership of problematic tables to postgres
-- This ensures future migrations can modify these tables
ALTER TABLE public.banlist OWNER TO postgres;
ALTER TABLE public.curated OWNER TO postgres;
ALTER TABLE public.posts OWNER TO postgres;

-- Step 2: Add missing RLS policies (with checks for existing policies)

DO $$
BEGIN
  -- BANLIST TABLE POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'banlist' AND policyname = 'banlist_select_public') THEN
    CREATE POLICY "banlist_select_public" ON public.banlist FOR SELECT TO public USING (true);
  END IF;

  -- CURATED TABLE POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'curated' AND policyname = 'curated_select_public') THEN
    CREATE POLICY "curated_select_public" ON public.curated FOR SELECT TO public USING (true);
  END IF;

  -- POSTS TABLE POLICIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_select_public') THEN
    CREATE POLICY "posts_select_public" ON public.posts FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_insert_author') THEN
    CREATE POLICY "posts_insert_author" ON public.posts FOR INSERT TO public 
    WITH CHECK ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_update_author') THEN
    CREATE POLICY "posts_update_author" ON public.posts FOR UPDATE TO public 
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname = 'posts_delete_author') THEN
    CREATE POLICY "posts_delete_author" ON public.posts FOR DELETE TO public 
    USING ((auth.jwt() ->> 'sub'::text) IS NOT NULL AND (auth.jwt() ->> 'sub'::text) = author);
  END IF;
END $$;

-- Step 3: Verify ownership and policies
DO $$
DECLARE
  v_result text := '';
  r record;
BEGIN
  -- Check ownership
  v_result := 'Table ownership after changes:' || E'\n';
  FOR r IN 
    SELECT tablename, tableowner 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  LOOP
    v_result := v_result || '  ' || r.tablename || ': ' || r.tableowner || E'\n';
  END LOOP;
  
  v_result := v_result || E'\nRLS policies per table:' || E'\n';
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

-- Note: This migration is automatically tracked by Supabase when applied