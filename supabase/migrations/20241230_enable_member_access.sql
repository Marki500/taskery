-- =============================================
-- ENABLE MEMBER ACCESS FOR PROJECTS & TASKS
-- =============================================

-- 1. Drop existing restrictive policies (if they exist) to avoid conflicts
DROP POLICY IF EXISTS "Users can create projects in their workspaces" ON projects;
DROP POLICY IF EXISTS "Users can view projects in their workspaces" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their workspaces" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their workspaces" ON projects;

DROP POLICY IF EXISTS "Users can create tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks in accessible projects" ON tasks;

-- 2. Create new policies for PROJECTS allowing MEMBERS access via workspace_members

CREATE POLICY "Members can view projects" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete projects" ON projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = projects.workspace_id
      AND workspace_members.user_id = auth.uid()
       -- Optional: restrict delete to admins only? uncomment next line if desiredaaa
       -- AND workspace_members.role = 'admin'
    )
  );


-- 3. Create new policies for TASKS

CREATE POLICY "Members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can delete tasks" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspace_members ON workspace_members.workspace_id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspace_members.user_id = auth.uid()
    )
  );
