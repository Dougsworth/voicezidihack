-- View all tables in your database
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- View columns for voice_jobs table (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'voice_jobs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- View columns for voice_gigs table (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'voice_gigs' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count records in each voice table (if they exist)
SELECT 'voice_jobs' as table_name, COUNT(*) as record_count 
FROM voice_jobs
UNION ALL
SELECT 'voice_gigs' as table_name, COUNT(*) as record_count 
FROM voice_gigs;

-- Sample data from voice_jobs (if exists)
SELECT id, transcription, gig_type, caller_phone, status, created_at
FROM voice_jobs 
ORDER BY created_at DESC 
LIMIT 3;

-- Sample data from voice_gigs (if exists)  
SELECT id, transcription, gig_type, whatsapp_number, status, created_at
FROM voice_gigs 
ORDER BY created_at DESC 
LIMIT 3;