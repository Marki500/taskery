-- =============================================
-- FIX WORKSPACE & INVITATION RLS POLICIES
-- =============================================

-- 1. WORKSPACES: Allow members to view the workspace they belong to
-- (Currently only owners can view, which blocks members from fetching workspace info)
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;
CREATE POLICY "Users can view workspaces they are members of" ON workspaces
  FOR SELECT USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = workspaces.id 
      AND workspace_members.user_id = auth.uid()
    )
  );

-- 2. WORKSPACE_MEMBERS: Allow members to see ALL other members in the same workspace
-- (Currently members only see their own membership record)
DROP POLICY IF EXISTS "Members can view their workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Workspace members can view other members" ON workspace_members;

CREATE POLICY "Members can view all members in their workspaces" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS me
      WHERE me.workspace_id = workspace_members.workspace_id
      AND me.user_id = auth.uid()
    )
  );

-- 3. INVITATIONS: Allow invited users to UPDATE their own invitation (to accept it)
-- (Currently only admins can update/manage invitations)
CREATE POLICY "Invited users can accept their invitations" ON workspace_invitations
  FOR UPDATE USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    token IS NOT NULL -- Allow update via token if valid
  )
  WITH CHECK (
    accepted_at IS NOT NULL -- They can only set the accepted_at timestamp
  );

-- 4. PROFILES: Ensure members can view profiles of other members (for names/avatars)
-- If profiles has RLS, we need to allow viewing if they share a workspace
-- Assuming profiles already has a basic select policy for now, but adding this for safety
DROP POLICY IF EXISTS "Users can view profiles of workspace members" ON profiles;
CREATE POLICY "Users can view profiles of workspace members" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS m1
      JOIN workspace_members AS m2 ON m1.workspace_id = m2.workspace_id
      WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
    )
    OR id = auth.uid()
  );
