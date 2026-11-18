ALTER TABLE public.tracker_entries
  ADD COLUMN application_checklist jsonb NOT NULL DEFAULT '[]'::jsonb;