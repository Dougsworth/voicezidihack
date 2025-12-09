-- Fix schema to support web users without WhatsApp
-- Run this in your Supabase SQL Editor

-- Make whatsapp_number optional (for web users)
ALTER TABLE voice_gigs 
ALTER COLUMN whatsapp_number DROP NOT NULL;

-- Add contact_info column if it doesn't exist (for future use)
ALTER TABLE voice_gigs 
ADD COLUMN IF NOT EXISTS contact_info TEXT;

-- Add geolocation columns if they don't exist
ALTER TABLE voice_gigs 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_accuracy INTEGER,
ADD COLUMN IF NOT EXISTS detected_island TEXT,
ADD COLUMN IF NOT EXISTS nearest_town TEXT,
ADD COLUMN IF NOT EXISTS parish TEXT,
ADD COLUMN IF NOT EXISTS is_caribbean BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_tourist_area BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Run the ASR migration if not already done
-- (This adds ASR analysis columns)
ALTER TABLE voice_gigs 
ADD COLUMN IF NOT EXISTS asr_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS accent_primary TEXT,
ADD COLUMN IF NOT EXISTS accent_confidence DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert', 'unclear')),
ADD COLUMN IF NOT EXISTS speech_clarity TEXT CHECK (speech_clarity IN ('poor', 'fair', 'good', 'excellent')),
ADD COLUMN IF NOT EXISTS speech_pace TEXT CHECK (speech_pace IN ('slow', 'normal', 'fast')),
ADD COLUMN IF NOT EXISTS speech_formality TEXT CHECK (speech_formality IN ('casual', 'semi-formal', 'formal')),
ADD COLUMN IF NOT EXISTS local_terms TEXT[],
ADD COLUMN IF NOT EXISTS cultural_references TEXT[],
ADD COLUMN IF NOT EXISTS island_specific BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS asr_analysis JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_voice_gigs_accent ON voice_gigs(accent_primary);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_urgency ON voice_gigs(urgency);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_experience ON voice_gigs(experience_level);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_skills ON voice_gigs USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_location ON voice_gigs(location);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_island ON voice_gigs(detected_island);

