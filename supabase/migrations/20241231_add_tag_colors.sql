-- Add tag_color column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tag_color TEXT DEFAULT NULL;

-- Optional: Update existing tags with a default color (blue)
-- UPDATE tasks SET tag_color = 'blue' WHERE tag IS NOT NULL AND tag_color IS NULL;
