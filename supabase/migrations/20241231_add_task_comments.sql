-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage comments if they are members of the workspace
CREATE POLICY "Workspace members can view comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = task_comments.task_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create comments" ON task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN projects p ON t.project_id = p.id
      JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
      WHERE t.id = task_comments.task_id
      AND wm.user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Users can only update their own comments
CREATE POLICY "Users can update own comments" ON task_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can only delete their own comments
CREATE POLICY "Users can delete own comments" ON task_comments
  FOR DELETE USING (user_id = auth.uid());
