-- Fix workspace_activity foreign key to reference profiles instead of auth.users
-- This is required for PostgREST resource embedding to work with profiles

DO $$
BEGIN
    -- Drop the old constraint if it exists (standard naming convention)
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'workspace_activity_user_id_fkey'
    ) THEN
        ALTER TABLE workspace_activity DROP CONSTRAINT workspace_activity_user_id_fkey;
    END IF;
END $$;

-- Add the new constraint referencing profiles
ALTER TABLE workspace_activity
    ADD CONSTRAINT workspace_activity_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE SET NULL;
