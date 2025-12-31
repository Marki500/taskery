-- Create subtasks table
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);

-- Enable RLS
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage subtasks if they are members of the workspace
CREATE POLICY "Workspace members can view subtasks" ON subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = subtasks.task_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create subtasks" ON subtasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = subtasks.task_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update subtasks" ON subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = subtasks.task_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete subtasks" ON subtasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = subtasks.task_id
      AND wm.user_id = auth.uid()
    )
  );
