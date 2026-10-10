CREATE OR REPLACE FUNCTION public.tasks_force_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- System/back-office operations (no signed-in user) are left untouched.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  IF coalesce((auth.jwt() -> 'app_metadata' ->> 'is_admin'), 'false') <> 'true' THEN
    NEW.status := 'for_review';
    NEW.is_published := false;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_force_review
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.tasks_force_review();

CREATE POLICY "Authors update own tasks" ON public.tasks
FOR UPDATE TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors delete own tasks" ON public.tasks
FOR DELETE TO authenticated
USING (author_id = auth.uid());

CREATE POLICY "Admins delete tasks" ON public.tasks
FOR DELETE TO authenticated
USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin') = 'true');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;