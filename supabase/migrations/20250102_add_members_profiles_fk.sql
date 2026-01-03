-- Add explicit FK relationship between workspace_members and profiles
-- This allows PostgREST to detect the relationship for joins

ALTER TABLE workspace_members
DROP CONSTRAINT IF EXISTS workspace_members_user_id_fkey_profiles;

ALTER TABLE workspace_members
ADD CONSTRAINT workspace_members_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
