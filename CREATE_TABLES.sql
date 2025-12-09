-- Run this in your Supabase SQL Editor to create the tables

-- Create voice_gigs table
CREATE TABLE IF NOT EXISTS voice_gigs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- WhatsApp data (for future use)
  whatsapp_number TEXT,
  whatsapp_message_id TEXT UNIQUE,
  
  -- Voice note data
  voice_url TEXT,
  transcription TEXT NOT NULL,
  duration_seconds INTEGER,
  
  -- Gig details
  gig_type TEXT CHECK (gig_type IN ('job_posting', 'work_request')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  location TEXT,
  budget_min DECIMAL,
  budget_max DECIMAL,
  currency TEXT DEFAULT 'JMD',
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Contact preferences
  contact_method TEXT DEFAULT 'whatsapp' CHECK (contact_method IN ('whatsapp', 'voice_call', 'both'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_voice_gigs_status ON voice_gigs(status);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_created_at ON voice_gigs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_gigs_gig_type ON voice_gigs(gig_type);

-- Enable Row Level Security
ALTER TABLE voice_gigs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Anyone can read active gigs" ON voice_gigs 
FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can insert gigs" ON voice_gigs 
FOR INSERT WITH CHECK (true);

-- Insert some sample data for demo
INSERT INTO voice_gigs (transcription, gig_type, title, description, budget_min, budget_max, status, processed_at) VALUES
(
  'I need someone to fix my roof in Kingston. It''s leaking when it rains. Budget is around 15,000 JMD.',
  'job_posting',
  'Roof repair needed in Kingston',
  'I need someone to fix my roof in Kingston. It''s leaking when it rains. Budget is around 15,000 JMD.',
  15000,
  15000,
  'active',
  NOW()
),
(
  'Looking for a graphic designer to create a logo for my bakery. Can pay 8,000 JMD for good work.',
  'job_posting',
  'Logo design for bakery',
  'Looking for a graphic designer to create a logo for my bakery. Can pay 8,000 JMD for good work.',
  8000,
  8000,
  'active',
  NOW()
),
(
  'I''m a plumber available for emergency calls in Spanish Town area. Licensed and experienced.',
  'work_request',
  'Licensed plumber available for emergency calls',
  'I''m a plumber available for emergency calls in Spanish Town area. Licensed and experienced.',
  NULL,
  NULL,
  'active',
  NOW()
),
(
  'Experienced electrician offering services across Kingston. Fair prices and quality work.',
  'work_request',
  'Experienced electrician offering services',
  'Experienced electrician offering services across Kingston. Fair prices and quality work.',
  NULL,
  NULL,
  'active',
  NOW()
),
(
  'Need someone to help move furniture this weekend. Two bedroom apartment in New Kingston.',
  'job_posting',
  'Furniture moving help needed',
  'Need someone to help move furniture this weekend. Two bedroom apartment in New Kingston.',
  NULL,
  NULL,
  'active',
  NOW()
);