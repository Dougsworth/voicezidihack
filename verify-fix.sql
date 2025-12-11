-- Verify the categorization fix

-- 1. Count records by gig_type
SELECT gig_type, COUNT(*) as count
FROM voice_jobs 
GROUP BY gig_type
ORDER BY count DESC;

-- 2. Check records that should be work_request (seeking work)
SELECT id, transcription, gig_type, created_at
FROM voice_jobs 
WHERE transcription ILIKE '%I need a job%' 
   OR transcription ILIKE '%I need work%'
   OR transcription ILIKE '%looking for work%'
   OR transcription ILIKE '%available for work%'
ORDER BY created_at DESC;

-- 3. Check records that should be job_posting (hiring)
SELECT id, transcription, gig_type, created_at
FROM voice_jobs 
WHERE transcription ILIKE '%need someone%'
   OR transcription ILIKE '%need a handyman%'
   OR transcription ILIKE '%want someone%'
   OR transcription ILIKE '%fix my%'
   OR transcription ILIKE '%clean my%'
   OR transcription ILIKE '%paint my%'
ORDER BY created_at DESC;

-- 4. Check if default value was removed from schema
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'voice_jobs' 
  AND column_name = 'gig_type';

-- 5. Show all recent records with their categorization
SELECT id, 
       LEFT(transcription, 60) as transcription_preview,
       gig_type,
       created_at
FROM voice_jobs 
ORDER BY created_at DESC 
LIMIT 10;