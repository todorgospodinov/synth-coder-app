-- Admin access to tasks via the JWT app_metadata claim (no auth.users lookups).
-- The is_admin flag is only writable server-side, so the claim is trustworthy.
CREATE POLICY "Admins read all tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');

CREATE POLICY "Admins update task status"
ON public.tasks
FOR UPDATE
TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true')
WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');