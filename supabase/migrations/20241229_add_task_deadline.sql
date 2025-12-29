-- Add deadline column to tasks table
ALTER TABLE tasks ADD COLUMN deadline timestamp with time zone;

-- Create index for efficient deadline queries
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
