BEGIN;

ALTER POLICY "Users can update own enrollment tokens"
ON public.agent_enrollment_tokens
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.servers AS s
    WHERE s.id = agent_enrollment_tokens.server_id
      AND s.user_id = auth.uid()
  )
);

COMMIT;