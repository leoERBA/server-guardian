-- Applied manually in Supabase SQL Editor on 2026-09-25.
-- Restore the permission required by the enrollment lookup.
-- Prerequisite: public.agent_enrollment_tokens already exists.

GRANT SELECT
ON TABLE public.agent_enrollment_tokens
TO service_role;