ALTER TABLE public.tasks ADD COLUMN language text NOT NULL DEFAULT 'python';
ALTER TABLE public.tasks ADD CONSTRAINT tasks_language_check CHECK (language IN ('python','java'));
CREATE INDEX tasks_language_idx ON public.tasks (language, created_at DESC);