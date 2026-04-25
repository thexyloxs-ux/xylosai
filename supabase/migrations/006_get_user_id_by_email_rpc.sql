-- Returns the auth user ID for a given email address.
-- Queries auth.users directly so it's always accurate, even if profiles.email
-- has drifted (e.g. user changed their email in Supabase Auth).
-- Used by cancelSubscription to reliably resolve a Paystack customer email → user ID.
CREATE OR REPLACE FUNCTION get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
$$;
