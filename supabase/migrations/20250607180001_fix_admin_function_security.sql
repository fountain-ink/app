-- Fix security issue with is_admin function by setting immutable search_path
-- This prevents search_path manipulation attacks

-- Create or replace the function with secure settings
-- This preserves existing dependencies on the function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '' -- Empty search path prevents manipulation
STABLE -- Function is stable (same results for same inputs within a transaction)
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

-- Add comment explaining the admin system
COMMENT ON FUNCTION public.is_admin() IS 'Checks if the current user has admin privileges based on JWT metadata.isAdmin flag. Uses empty search_path for security.';