// Voice Jobs Service - for Twilio voice_jobs table
import { supabase } from '../lib/supabase'
import type { VoiceJob } from '../types'
import { TranscriptionService } from './transcriptionService'

export class VoiceJobsService {
  static async getVoiceJobs(filters?: { gigType?: 'job_posting' | 'work_request' }): Promise<VoiceJob[]> {
    console.log('🔍 DEBUG: Fetching from voice_jobs table...', filters)
    
    let query = supabase
      .from('voice_jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.gigType) {
      query = query.eq('gig_type', filters.gigType)
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ ERROR fetching voice jobs:', error)
      return []
    }

    console.log('✅ SUCCESS: Fetched', data?.length || 0, 'voice jobs')
    console.log('📊 RAW DATA:', data)
    
    return data as VoiceJob[]
  }

  static async getVoiceJobById(id: string): Promise<VoiceJob | null> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching voice job:', error)
      return null
    }

    return data as VoiceJob
  }

  static async getVoiceJobByRecordingSid(recordingSid: string): Promise<VoiceJob | null> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .select('*')
      .eq('recording_sid', recordingSid)
      .single()

    if (error) {
      console.error('Error fetching voice job by recording SID:', error)
      return null
    }

    return data as VoiceJob
  }

  static async getVoiceJobsByStatus(status: 'processing' | 'completed' | 'error'): Promise<VoiceJob[]> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching voice jobs by status:', error)
      return []
    }

    return data as VoiceJob[]
  }

  static async getVoiceJobsByPhone(phone: string): Promise<VoiceJob[]> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .select('*')
      .eq('caller_phone', phone)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching voice jobs by phone:', error)
      return []
    }

    return data as VoiceJob[]
  }

  static async updateVoiceJobTranscription(
    id: string, 
    transcription: string, 
    status: 'completed' | 'error' = 'completed'
  ): Promise<VoiceJob | null> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .update({ 
        transcription,
        status
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating voice job transcription:', error)
      return null
    }

    return data as VoiceJob
  }

  static async createVoiceJob(voiceJob: Omit<VoiceJob, 'id' | 'created_at'>): Promise<VoiceJob | null> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .insert(voiceJob)
      .select()
      .single()

    if (error) {
      console.error('Error creating voice job:', error)
      return null
    }

    return data as VoiceJob
  }

  // Create voice job from frontend recording (without Twilio fields)
  static async createFromFrontend(
    transcription: string,
    gigType: 'job_posting' | 'work_request',
    callerPhone?: string
  ): Promise<VoiceJob | null> {
    console.log('📝 Creating voice job from frontend recording...')
    
    const voiceJob = {
      caller_phone: callerPhone || 'web_user',
      recording_sid: `web_${Date.now()}`,
      recording_url: '', // No recording URL for web submissions
      gradio_event_id: `web_${Date.now()}`,
      status: 'completed' as const,
      transcription,
      gig_type: gigType
    }

    const { data, error } = await supabase
      .from('voice_jobs')
      .insert(voiceJob)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating frontend voice job:', error)
      return null
    }

    console.log('✅ Frontend voice job created:', data)
    return data as VoiceJob
  }

  static async deleteVoiceJob(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('voice_jobs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting voice job:', error)
      return false
    }

    return true
  }

  static async getStats(): Promise<{
    total: number
    processing: number
    completed: number
    error: number
  }> {
    const { data, error } = await supabase
      .from('voice_jobs')
      .select('status')

    if (error) {
      console.error('Error fetching voice jobs stats:', error)
      return { total: 0, processing: 0, completed: 0, error: 0 }
    }

    const total = data.length
    const processing = data.filter(job => job.status === 'processing').length
    const completed = data.filter(job => job.status === 'completed').length
    const errorCount = data.filter(job => job.status === 'error').length

    return { total, processing, completed, error: errorCount }
  }

  // TEST METHOD: Update existing record with transcription
  static async updateExistingRecordWithTranscription(): Promise<VoiceJob | null> {
    console.log('🧪 Updating existing record with transcription...')
    
    // Update the existing record that has null transcription
    const { data, error } = await supabase
      .from('voice_jobs')
      .update({ 
        transcription: 'I need a promo to fix my biofilm sink, the job is in Kingston and I\'ll pay five thousand dollars.',
        status: 'completed'
      })
      .eq('caller_phone', '+18764318697')  // From your screenshot
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating existing record:', error)
      return null
    }

    console.log('✅ Updated existing record:', data)
    return data as VoiceJob
  }

  // TEST METHOD: Create sample data for testing
  static async createSampleData(): Promise<VoiceJob | null> {
    console.log('🧪 Creating sample voice job for testing...')
    
    const sampleJob: Omit<VoiceJob, 'id' | 'created_at'> = {
      caller_phone: '+1876555123',
      recording_sid: 'RE_sample_test_123',
      recording_url: 'https://api.twilio.com/sample.wav',
      gradio_event_id: 'sample_event_123',
      status: 'completed',
      transcription: 'I need a promo to fix my biofilm sink, the job is in Kingston and I\'ll pay five thousand dollars.'
    }

    const result = await this.createVoiceJob(sampleJob)
    
    if (result) {
      console.log('✅ Sample data created:', result)
    } else {
      console.error('❌ Failed to create sample data')
    }
    
    return result
  }

  // Process all pending voice jobs (transcribe recordings)
  static async processPendingTranscriptions(): Promise<{
    processed: number
    failed: number
    results: Array<{ id: string; status: 'success' | 'error'; transcription?: string; error?: string }>
  }> {
    console.log('🔄 Processing pending transcriptions...')
    
    // Get all jobs with status 'processing'
    const pendingJobs = await this.getVoiceJobsByStatus('processing')
    console.log(`📋 Found ${pendingJobs.length} pending jobs`)
    
    const results: Array<{ id: string; status: 'success' | 'error'; transcription?: string; error?: string }> = []
    let processed = 0
    let failed = 0
    
    for (const job of pendingJobs) {
      if (!job.id) {
        console.log(`⏭️ Skipping job - no ID`)
        continue
      }
      
      try {
        console.log(`🎤 Transcribing job ${job.id}...`)
        
        let transcription: string
        
        // If we have a Gradio event ID, try to get the result from that
        if (job.gradio_event_id && !job.gradio_event_id.startsWith('web_')) {
          console.log('📡 Using Gradio event ID to poll for transcription...')
          transcription = await TranscriptionService.retryTranscriptionByEventId(job.gradio_event_id)
        } else if (job.recording_url && !job.recording_url.includes('api.twilio.com')) {
          // For non-Twilio URLs, we can fetch directly
          transcription = await TranscriptionService.transcribeFromUrl(job.recording_url)
        } else {
          console.log(`⏭️ Skipping job ${job.id} - Twilio URL requires backend transcription`)
          continue
        }
        
        // Update the database
        const updated = await this.updateVoiceJobTranscription(job.id, transcription, 'completed')
        
        if (updated) {
          console.log(`✅ Job ${job.id} transcribed:`, transcription.substring(0, 50) + '...')
          results.push({ id: job.id, status: 'success', transcription })
          processed++
        } else {
          throw new Error('Failed to update database')
        }
        
      } catch (error) {
        console.error(`❌ Failed to transcribe job ${job.id}:`, error)
        
        // Don't mark as error if it's just a Twilio URL issue - leave as processing
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        if (!errorMsg.includes('Twilio')) {
          await supabase
            .from('voice_jobs')
            .update({ status: 'error' })
            .eq('id', job.id)
        }
        
        results.push({ 
          id: job.id, 
          status: 'error', 
          error: errorMsg 
        })
        failed++
      }
    }
    
    console.log(`✅ Processed: ${processed}, Failed: ${failed}`)
    return { processed, failed, results }
  }

  // Transcribe a single voice job by ID
  static async transcribeVoiceJob(jobId: string): Promise<VoiceJob | null> {
    console.log(`🎤 Transcribing single job: ${jobId}`)
    
    const job = await this.getVoiceJobById(jobId)
    if (!job) {
      console.error('Job not found')
      return null
    }
    
    try {
      let transcription: string
      
      // If we have a Gradio event ID, try to get the result from that
      if (job.gradio_event_id && !job.gradio_event_id.startsWith('web_')) {
        console.log('📡 Using Gradio event ID to get transcription...')
        transcription = await TranscriptionService.retryTranscriptionByEventId(job.gradio_event_id)
      } else if (job.recording_url && !job.recording_url.includes('api.twilio.com')) {
        // For non-Twilio URLs, we can fetch directly
        transcription = await TranscriptionService.transcribeFromUrl(job.recording_url)
      } else {
        throw new Error('Cannot transcribe: Twilio recordings require the backend webhook to handle transcription. Please wake up the HuggingFace Space at https://huggingface.co/spaces/dougsworth/linkup-asr and try calling again.')
      }
      
      return await this.updateVoiceJobTranscription(jobId, transcription, 'completed')
    } catch (error) {
      console.error('Transcription failed:', error)
      await supabase
        .from('voice_jobs')
        .update({ status: 'error' })
        .eq('id', jobId)
      return null
    }
  }
}