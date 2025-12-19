-- Add tag and color columns to tasks
ALTER TABLE tasks ADD COLUMN tag text;
ALTER TABLE tasks ADD COLUMN tag_color text;
