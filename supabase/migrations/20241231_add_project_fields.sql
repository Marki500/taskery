-- Add color and icon fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'indigo';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'FolderKanban';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS url TEXT DEFAULT NULL;
