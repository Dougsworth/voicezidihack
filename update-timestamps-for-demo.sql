-- Update timestamps for demo - makes existing jobs appear recent
-- Run this in Supabase SQL editor to update existing job timestamps

-- Update timestamps to be within the last few hours for better demo
UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '5 minutes'
WHERE transcription = 'I need a promo to fix my biofilm sink, the job is in Kingston and I\'ll pay five thousand dollars.';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '12 minutes'  
WHERE transcription LIKE '%handyman%' AND transcription LIKE '%five hundred%';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '25 minutes'
WHERE transcription LIKE '%AC%' AND transcription LIKE '%2 p.m.%';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '35 minutes'
WHERE transcription LIKE '%fence%' AND transcription LIKE '%Thursday%';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '45 minutes'
WHERE transcription LIKE '%tree%' AND transcription LIKE '%Kingston%';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '55 minutes'
WHERE transcription LIKE '%Gardner%' OR transcription LIKE '%Cofgrass%';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '1 hour 10 minutes'
WHERE transcription = 'Thank you.';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '1 hour 20 minutes'
WHERE transcription = 'Yes.';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '2 hours 5 minutes'
WHERE transcription = 'I\'m in Papine, Jamaica.';

UPDATE voice_jobs 
SET created_at = NOW() - INTERVAL '3 hours 15 minutes'
WHERE transcription LIKE '%bus pipe%';

-- Show the updated timestamps
SELECT 
  transcription,
  created_at,
  NOW() - created_at AS age,
  CASE 
    WHEN NOW() - created_at < INTERVAL '1 minute' THEN 'Just now'
    WHEN NOW() - created_at < INTERVAL '1 hour' THEN EXTRACT(EPOCH FROM (NOW() - created_at))/60 || ' minutes ago'
    WHEN NOW() - created_at < INTERVAL '1 day' THEN EXTRACT(EPOCH FROM (NOW() - created_at))/3600 || ' hours ago'
    ELSE EXTRACT(EPOCH FROM (NOW() - created_at))/86400 || ' days ago'
  END AS formatted_time
FROM voice_jobs 
ORDER BY created_at DESC
LIMIT 10;