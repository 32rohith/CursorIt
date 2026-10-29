-- Add docs column to projects table
-- Run this migration in your Supabase SQL editor

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS docs jsonb;

COMMENT ON COLUMN projects.docs IS 'Generated comprehensive project documentation (PRD, Architecture, Database schema, API specification, Token-optimized AI prompt, Implementation roadmap)';
