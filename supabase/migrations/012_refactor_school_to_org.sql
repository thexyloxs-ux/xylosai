-- 012_refactor_school_to_org.sql

-- 1. Update existing data
UPDATE public.profiles
SET role = 'org_admin'
WHERE role = 'school_admin';

UPDATE public.profiles
SET role = 'member'
WHERE role = 'student';

UPDATE public.profiles
SET plan = 'org'
WHERE plan = 'school';

UPDATE public.organizations
SET plan = 'org'
WHERE plan = 'school';

-- 2. Alter column defaults
ALTER TABLE public.organizations
ALTER COLUMN plan SET DEFAULT 'org';

-- 3. Update Policies for public.profiles
DROP POLICY IF EXISTS "Admins can view org profiles" ON public.profiles;
CREATE POLICY "Admins can view org profiles"
  ON public.profiles FOR SELECT
  USING (
    public.get_my_role() = 'org_admin'
    AND public.get_my_org_id() = org_id
  );

-- 4. Update Policies for public.organizations
DROP POLICY IF EXISTS "Admins can update own organization" ON public.organizations;
CREATE POLICY "Admins can update own organization"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'org_admin'
        AND profiles.org_id = organizations.id
    )
  );

-- 5. Update Policies for public.student_activity (Rename to member_activity in future if needed, for now just update logic)
DROP POLICY IF EXISTS "Admins can view org activity" ON public.student_activity;
CREATE POLICY "Admins can view org activity"
  ON public.student_activity FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'org_admin'
        AND profiles.org_id = student_activity.org_id
    )
  );
