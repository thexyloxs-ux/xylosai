-- Add marketing_emails flag to profiles.
-- Default TRUE so existing users keep receiving emails.
-- Set FALSE when user hits the /unsubscribe route.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN NOT NULL DEFAULT TRUE;
