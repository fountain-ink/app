-- Cleanup duplicate RLS policies on blogs table

-- Drop the old policies with inconsistent naming
DROP POLICY IF EXISTS "Allow users to delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to read any blog" ON public.blogs;
DROP POLICY IF EXISTS "Allow users to update their own blogs" ON public.blogs;