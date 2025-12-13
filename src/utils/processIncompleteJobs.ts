// Process incomplete voice jobs that were transcribed but not categorized
import { supabase } from '@/lib/supabase'
import { VoiceJobsService } from '@/services/voiceJobsService'

export async function processIncompleteJobs() {
  try {
    console.log('[PROCESSING] Looking for incomplete voice jobs...')
    
    // Find jobs that have transcription but missing gig_type or extraction_completed = false
    const { data: incompleteJobs, error } = await supabase
      .from('voice_jobs')
      .select('*')
      .not('transcription', 'is', null)
      .or('gig_type.is.null,extraction_completed.eq.false')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) {
      console.error('[PROCESSING] Error fetching incomplete jobs:', error)
      return { processed: 0, errors: 1 }
    }
    
    if (!incompleteJobs || incompleteJobs.length === 0) {
      console.log('[PROCESSING] No incomplete jobs found')
      return { processed: 0, errors: 0 }
    }
    
    console.log(`[PROCESSING] Found ${incompleteJobs.length} incomplete jobs`)
    
    let processed = 0
    let errors = 0
    
    for (const job of incompleteJobs) {
      try {
        console.log(`[PROCESSING] Processing job ${job.id}...`)
        
        // Extract details with GPT
        const extractedDetails = await VoiceJobsService.extractJobDetailsWithGPT(job.transcription)
        
        // Use GPT's categorization or fallback to basic logic
        let gigType = extractedDetails.jobType
        if (!gigType) {
          // Basic fallback categorization
          const lower = job.transcription.toLowerCase()
          if (lower.includes('i need') || lower.includes('looking for')) {
            gigType = lower.includes('someone') || lower.includes('promo') ? 'job_posting' : 'work_request'
          } else {
            gigType = 'job_posting' // Default
          }
        }
        
        // Update the job with extracted details
        const { error: updateError } = await supabase
          .from('voice_jobs')
          .update({
            gig_type: gigType,
            extracted_location: extractedDetails.location,
            extracted_budget: extractedDetails.budget,
            extracted_skill: extractedDetails.skill,
            extracted_timing: extractedDetails.timing,
            extracted_description: extractedDetails.description,
            extraction_completed: true
          })
          .eq('id', job.id)
        
        if (updateError) {
          console.error(`[PROCESSING] Error updating job ${job.id}:`, updateError)
          errors++
        } else {
          console.log(`[PROCESSING] Successfully processed job ${job.id} as ${gigType}`)
          processed++
        }
        
        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`[PROCESSING] Error processing job ${job.id}:`, error)
        errors++
      }
    }
    
    console.log(`[PROCESSING] Completed: ${processed} processed, ${errors} errors`)
    return { processed, errors }
    
  } catch (error) {
    console.error('[PROCESSING] Fatal error:', error)
    return { processed: 0, errors: 1 }
  }
}