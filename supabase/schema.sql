-- Create voice_gigs table
CREATE TABLE voice_gigs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- WhatsApp data
  whatsapp_number TEXT NOT NULL,
  whatsapp_message_id TEXT UNIQUE,
  
  -- Voice note data
  voice_url TEXT,
  transcription TEXT,
  duration_seconds INTEGER,
  
  -- Gig details
  gig_type TEXT CHECK (gig_type IN ('job_posting', 'work_request')),
  title TEXT,
  description TEXT,
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
CREATE INDEX idx_voice_gigs_status ON voice_gigs(status);
CREATE INDEX idx_voice_gigs_created_at ON voice_gigs(created_at DESC);
CREATE INDEX idx_voice_gigs_whatsapp_number ON voice_gigs(whatsapp_number);

-- Create matches table for connecting workers with jobs
CREATE TABLE gig_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  job_gig_id UUID REFERENCES voice_gigs(id),
  worker_gig_id UUID REFERENCES voice_gigs(id),
  
  status TEXT DEFAULT 'potential' CHECK (status IN ('potential', 'contacted', 'accepted', 'rejected', 'completed')),
  
  UNIQUE(job_gig_id, worker_gig_id)
);

-- Enable Row Level Security
ALTER TABLE voice_gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_matches ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth strategy)
CREATE POLICY "Public read access" ON voice_gigs FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON voice_gigs FOR ALL USING (true);