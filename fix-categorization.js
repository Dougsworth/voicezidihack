// Quick script to fix existing categorization in database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://unyttmpquqfypoxsbkve.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc'
);

function categorizeTranscription(text) {
  const lower = text.toLowerCase();
  
  // Patterns for people SEEKING work (work_request)
  const seeking = /\b(i|me)\s+(need|want|looking\s+for|am\s+looking\s+for)\s+(a\s+)?(job|work|employment)|available\s+(for\s+)?(work|job)|i\s+(can|do|offer)|my\s+skills|experienced\s+(in|at|with)/i;
  
  // Patterns for people HIRING (job_posting) 
  const hiring = /\b(need|want|looking\s+for)\s+(a|an|some|someone|somebody)\s+\w+\s+(to|for|who\s+can)|someone\s+(to|must|should)\s+\w+|fix\s+my|paint\s+my|clean\s+my|repair\s+my/i;
  
  let seekingScore = 0;
  let hiringScore = 0;
  
  if (seeking.test(lower)) seekingScore += 2;
  if (hiring.test(lower)) hiringScore += 2;
  
  return seekingScore > hiringScore ? 'work_request' : 'job_posting';
}

async function fixCategorization() {
  try {
    // Get all records
    const { data: jobs, error } = await supabase
      .from('voice_jobs')
      .select('id, transcription, gig_type')
      .neq('transcription', null);

    if (error) throw error;

    console.log(`📊 Found ${jobs.length} jobs to re-categorize`);

    let fixed = 0;
    
    for (const job of jobs) {
      const correctType = categorizeTranscription(job.transcription);
      
      if (job.gig_type !== correctType) {
        console.log(`🔄 Fixing: "${job.transcription.substring(0, 50)}..." → ${correctType}`);
        
        const { error: updateError } = await supabase
          .from('voice_jobs')
          .update({ gig_type: correctType })
          .eq('id', job.id);
          
        if (updateError) {
          console.error(`❌ Failed to update ${job.id}:`, updateError);
        } else {
          fixed++;
        }
      }
    }
    
    console.log(`✅ Fixed ${fixed} categorizations`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixCategorization();