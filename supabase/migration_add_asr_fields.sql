-- Migration: Add ASR analysis fields to voice_gigs table
-- Run this in your Supabase SQL Editor

-- Add ASR analysis columns
ALTER TABLE voice_gigs 
ADD COLUMN IF NOT EXISTS asr_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS accent_primary TEXT,
ADD COLUMN IF NOT EXISTS accent_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS skills TEXT[], -- Array of extracted skills
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert', 'unclear')),
ADD COLUMN IF NOT EXISTS speech_clarity TEXT CHECK (speech_clarity IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS speech_pace TEXT CHECK (speech_pace IN ('slow', 'normal', 'fast')),
ADD COLUMN IF NOT EXISTS speech_formality TEXT CHECK (speech_formality IN ('casual', 'semi-formal', 'formal')),
ADD COLUMN IF NOT EXISTS local_terms TEXT[], -- Caribbean-specific terms detected
ADD COLUMN IF NOT EXISTS cultural_references TEXT[], -- Cultural references
ADD COLUMN IF NOT EXISTS island_specific BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS asr_analysis JSONB; -- Full ASR analysis stored as JSON

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_voice_gigs_accent ON voice_gigs(accent_primary);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_urgency ON voice_gigs(urgency);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_experience ON voice_gigs(experience_level);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_skills ON voice_gigs USING GIN(skills); -- GIN index for array searches
CREATE INDEX IF NOT EXISTS idx_voice_gigs_location ON voice_gigs(location);

-- Add comment for documentation
COMMENT ON COLUMN voice_gigs.asr_analysis IS 'Full Caribbean ASR analysis result stored as JSON for advanced matching and insights';

