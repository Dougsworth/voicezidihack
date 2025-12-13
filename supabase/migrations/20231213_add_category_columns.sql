-- Add category confidence and indicators columns to voice_jobs table
ALTER TABLE voice_jobs
ADD COLUMN IF NOT EXISTS category_confidence DECIMAL(3,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS category_indicators TEXT[] DEFAULT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_jobs_category_confidence ON voice_jobs(category_confidence);
CREATE INDEX IF NOT EXISTS idx_voice_jobs_gig_type ON voice_jobs(gig_type);