-- Apply once in Supabase SQL Editor with the postgres role.
-- Creates a new function; it does not replace an existing function silently.
BEGIN;

CREATE FUNCTION public.enroll_agent_atomic(
  p_enrollment_token_hash text,
  p_agent_token_hash text
)
RETURNS uuid
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_server_id uuid;
  v_server_owner uuid;
  v_token public.agent_enrollment_tokens%ROWTYPE;
  v_consumed_id uuid;
  v_checked_at timestamptz;
BEGIN
  -- Only hashes cross the API/database boundary.
  IF p_enrollment_token_hash IS NULL
     OR p_agent_token_hash IS NULL
     OR p_enrollment_token_hash !~ '^[0-9a-f]{64}$'
     OR p_agent_token_hash !~ '^[0-9a-f]{64}$'
  THEN
    RETURN NULL;
  END IF;

  SELECT t.server_id
  INTO v_server_id
  FROM public.agent_enrollment_tokens AS t
  WHERE t.token_hash = p_enrollment_token_hash;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- All calls lock the server before the token, in the same order.
  -- NO KEY UPDATE remains compatible with the foreign keys' KEY SHARE locks.
  SELECT s.user_id
  INTO v_server_owner
  FROM public.servers AS s
  WHERE s.id = v_server_id
  FOR NO KEY UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Read the current token again after waiting for the server lock.
  SELECT t.*
  INTO v_token
  FROM public.agent_enrollment_tokens AS t
  WHERE t.token_hash = p_enrollment_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_token.server_id IS DISTINCT FROM v_server_id
     OR v_token.user_id IS DISTINCT FROM v_server_owner
  THEN
    RETURN NULL;
  END IF;

  -- Database wall clock, checked after both locks have been acquired.
  v_checked_at := pg_catalog.clock_timestamp();

  IF v_token.used_at IS NOT NULL
     OR NOT pg_catalog.isfinite(v_token.expires_at)
     OR v_token.expires_at <= v_checked_at
  THEN
    DELETE FROM public.agent_enrollment_tokens AS t
    WHERE t.id = v_token.id;
    RETURN NULL;
  END IF;

  DELETE FROM public.agent_enrollment_tokens AS t
  WHERE t.id = v_token.id
    AND t.token_hash = p_enrollment_token_hash
  RETURNING t.id INTO v_consumed_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Preserve the existing reenrollment rule: replace the server's credential.
  INSERT INTO public.agent_credentials (
    server_id, token_hash, created_at, last_used_at, revoked_at
  )
  VALUES (
    v_server_id, p_agent_token_hash, v_checked_at, NULL, NULL
  )
  ON CONFLICT (server_id) DO UPDATE
  SET token_hash = EXCLUDED.token_hash,
      created_at = EXCLUDED.created_at,
      last_used_at = NULL,
      revoked_at = NULL;

  -- No exception handler here: SQL failures must roll back the DELETE too.
  RETURN v_server_id;
END;
$function$;

ALTER FUNCTION public.enroll_agent_atomic(text, text) OWNER TO postgres;

-- Prevent a window of public access: creation and ACL changes commit together.
REVOKE ALL ON FUNCTION public.enroll_agent_atomic(text, text)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enroll_agent_atomic(text, text)
TO service_role;

DO $check$
BEGIN
  IF pg_catalog.has_function_privilege(
       'anon', 'public.enroll_agent_atomic(text,text)', 'EXECUTE'
     )
     OR pg_catalog.has_function_privilege(
       'authenticated', 'public.enroll_agent_atomic(text,text)', 'EXECUTE'
     )
     OR NOT pg_catalog.has_function_privilege(
       'service_role', 'public.enroll_agent_atomic(text,text)', 'EXECUTE'
     )
  THEN
    RAISE EXCEPTION 'Unexpected enrollment function privileges. Migration aborted.';
  END IF;
END;
$check$;

NOTIFY pgrst, 'reload schema';
COMMIT;
