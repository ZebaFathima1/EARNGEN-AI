-- Fix: trigger was inserting into old 'name' column but the table now has 'full_name' and 'email'.
-- This also backfills existing users who have NULL full_name / email.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, college)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(NEW.raw_user_meta_data->>'full_name', '')),
    COALESCE(NEW.raw_user_meta_data->>'college', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email     = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    college   = COALESCE(NULLIF(EXCLUDED.college,   ''), profiles.college);
  RETURN NEW;
END;
$$;

-- Ensure updated_at exists (the update_updated_at_column trigger expects it)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Disable triggers during backfill to avoid trigger conflicts
ALTER TABLE public.profiles DISABLE TRIGGER ALL;

-- Backfill existing users whose email / full_name is still NULL
UPDATE public.profiles p
SET
  email     = u.email,
  full_name = COALESCE(
    NULLIF(p.full_name, ''),
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'full_name',
    ''
  )
FROM auth.users u
WHERE p.id = u.id
  AND (p.email IS NULL OR p.full_name IS NULL OR p.full_name = '');

ALTER TABLE public.profiles ENABLE TRIGGER ALL;
