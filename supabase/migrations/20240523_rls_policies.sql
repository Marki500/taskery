-- =============================================
-- RLS POLICIES FOR WORKSPACES, PROJECTS & TASKS
-- =============================================
-- Run this in Supabase Studio SQL Editor

-- WORKSPACES: Users can create and manage their own workspaces
CREATE POLICY "Users can create workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own workspaces" ON workspaces
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own workspaces" ON workspaces
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own workspaces" ON workspaces
  FOR DELETE USING (owner_id = auth.uid());

-- WORKSPACE_MEMBERS: Members can view workspaces they belong to
CREATE POLICY "Members can view their workspace memberships" ON workspace_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owners can manage workspace members" ON workspace_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_members.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- PROJECTS: Users can manage projects in their workspaces
CREATE POLICY "Users can create projects in their workspaces" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = projects.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view projects in their workspaces" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = projects.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update projects in their workspaces" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = projects.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete projects in their workspaces" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = projects.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- TASKS: Users can manage tasks in projects they have access to
CREATE POLICY "Users can create tasks in accessible projects" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view tasks in accessible projects" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in accessible projects" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks in accessible projects" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- MESSAGES: Similar pattern for chat messages
CREATE POLICY "Users can create messages in accessible projects" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = messages.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in accessible projects" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = messages.project_id 
      AND workspaces.owner_id = auth.uid()
    )
  );
