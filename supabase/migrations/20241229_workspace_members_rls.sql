-- Allow users to insert themselves as workspace members
-- This is needed for accepting invitations
CREATE POLICY "Users can add themselves to workspaces" ON workspace_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view workspace members if they are also a member
CREATE POLICY "Workspace members can view other members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid()
    )
  );

-- Allow workspace admins to update member roles
CREATE POLICY "Admins can update member roles" ON workspace_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.role = 'admin'
    )
  );

-- Allow workspace admins to remove members
CREATE POLICY "Admins can remove members" ON workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm 
      WHERE wm.workspace_id = workspace_members.workspace_id 
      AND wm.user_id = auth.uid() 
      AND wm.role = 'admin'
    )
    OR auth.uid() = user_id  -- Users can also remove themselves
  );
