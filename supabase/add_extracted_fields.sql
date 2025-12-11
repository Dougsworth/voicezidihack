-- Add extracted job details fields to voice_jobs table
-- Run this in your Supabase SQL Editor

ALTER TABLE voice_jobs 
ADD COLUMN IF NOT EXISTS extracted_location TEXT,
ADD COLUMN IF NOT EXISTS extracted_budget TEXT,
ADD COLUMN IF NOT EXISTS extracted_skill TEXT,
ADD COLUMN IF NOT EXISTS extracted_timing TEXT,
ADD COLUMN IF NOT EXISTS extracted_description TEXT,
ADD COLUMN IF NOT EXISTS extraction_completed BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_jobs_extraction ON voice_jobs(extraction_completed);
CREATE INDEX IF NOT EXISTS idx_voice_jobs_skill ON voice_jobs(extracted_skill);
CREATE INDEX IF NOT EXISTS idx_voice_jobs_location ON voice_jobs(extracted_location);