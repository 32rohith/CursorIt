-- Add step completion tracking to projects table
-- Run this migration in your Supabase SQL editor

-- Add columns for step tracking
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS completed_steps integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_redo_steps integer[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN projects.completed_steps IS 'Array of completed project steps (1-7)';
COMMENT ON COLUMN projects.needs_redo_steps IS 'Array of steps that need to be redone due to upstream changes';

-- Update existing projects to have empty arrays if null
UPDATE projects 
SET 
  completed_steps = '{}',
  needs_redo_steps = '{}'
WHERE 
  completed_steps IS NULL 
  OR needs_redo_steps IS NULL;
