-- =============================================
-- FIX RLS RECURSION WITH SECURITY DEFINER
-- =============================================

-- 1. Create a helper function to check membership safely
-- SECURITY DEFINER allows this function to run with privileges that bypass RLS
-- This breaks the infinite loop of Policy -> Table -> Policy -> Table
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = _workspace_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update WORKSPACES Policy
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    public.is_workspace_member(id)
  );

-- 3. Update WORKSPACE_MEMBERS Policy
DROP POLICY IF EXISTS "Members can view all members in their workspaces" ON workspace_members;
CREATE POLICY "Members can view all members in their workspaces" ON workspace_members
  FOR SELECT USING (
    public.is_workspace_member(workspace_id)
  );

-- 4. Update PROFILES Policy
-- Ensure we don't have recursion here either
DROP POLICY IF EXISTS "Users can view profiles of workspace members" ON profiles;
CREATE POLICY "Users can view profiles of workspace members" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE user_id = profiles.id
      AND public.is_workspace_member(workspace_id)
    )
  );
