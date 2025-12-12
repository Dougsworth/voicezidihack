-- Demo Worker Profiles for LinkUpWork Hackathon
-- Run this in your Supabase SQL editor to add sample workers

INSERT INTO voice_jobs (
  caller_phone, 
  recording_sid, 
  recording_url, 
  gradio_event_id, 
  status, 
  transcription, 
  gig_type, 
  extracted_location, 
  extracted_skill, 
  extracted_description,
  extraction_completed
) VALUES
-- Plumber in Kingston
(
  '+1876555201',
  'RE_demo_worker_1',
  'https://api.twilio.com/demo1.wav',
  'demo_worker_event_1',
  'completed',
  'I am an experienced plumber available for work in Kingston and surrounding areas.',
  'work_request',
  'Kingston',
  'Plumbing',
  'Experienced plumber available for residential and commercial work',
  true
),

-- AC Technician in Kingston  
(
  '+1876555202',
  'RE_demo_worker_2',
  'https://api.twilio.com/demo2.wav', 
  'demo_worker_event_2',
  'completed',
  'I am an AC technician and electrician available in Kingston area, can fix any cooling system.',
  'work_request',
  'Kingston',
  'Air Conditioning', 
  'HVAC and electrical specialist for all cooling system repairs',
  true
),

-- Carpenter in Spanish Town
(
  '+1876555203',
  'RE_demo_worker_3',
  'https://api.twilio.com/demo3.wav',
  'demo_worker_event_3', 
  'completed',
  'Carpenter available for furniture making and house repairs in Spanish Town area.',
  'work_request',
  'Spanish Town',
  'Carpentry',
  'Skilled carpenter for custom furniture and home repairs',
  true
),

-- Electrician in Kingston
(
  '+1876555204',
  'RE_demo_worker_4',
  'https://api.twilio.com/demo4.wav',
  'demo_worker_event_4',
  'completed',
  'I am an electrician with 10 years experience, available in Kingston and St. Andrew.',
  'work_request', 
  'Kingston',
  'Electrical Work',
  'Licensed electrician for residential and commercial electrical work',
  true
),

-- Cleaner in Kingston
(
  '+1876555205',
  'RE_demo_worker_5',
  'https://api.twilio.com/demo5.wav',
  'demo_worker_event_5',
  'completed',
  'I provide house cleaning services in Kingston area, very reliable.',
  'work_request',
  'Kingston', 
  'Cleaning Services',
  'Professional house cleaning with excellent references',
  true
);

-- Verify the data was inserted
SELECT 
  caller_phone,
  gig_type, 
  extracted_location,
  extracted_skill,
  created_at
FROM voice_jobs 
WHERE gig_type = 'work_request'
ORDER BY created_at DESC;