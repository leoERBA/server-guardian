-- Only use after restoring the previous app/api/agent/enroll/route.ts
-- and stopping requests to the new implementation.
-- Does not restore consumed tokens or replaced credentials.
BEGIN;
DROP FUNCTION public.enroll_agent_atomic(text, text);
NOTIFY pgrst, 'reload schema';
COMMIT;
