ALTER TABLE public.tasks DROP CONSTRAINT tasks_language_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_language_check CHECK (language IN ('python','java','sql'));