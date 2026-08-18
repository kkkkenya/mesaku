ALTER TABLE public.events ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.merchandise ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_archived ON public.events(archived);
CREATE INDEX IF NOT EXISTS idx_merchandise_archived ON public.merchandise(archived);
CREATE INDEX IF NOT EXISTS idx_announcements_archived ON public.announcements(archived);