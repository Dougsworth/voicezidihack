// Shared TypeScript interfaces and types

export interface CaribbeanASRResult {
  transcription: string
  confidence: number
  accent: {
    detected: string[]
    primary: string
    confidence: number
  }
  speechPatterns: {
    pace: 'slow' | 'normal' | 'fast'
    clarity: 'poor' | 'fair' | 'good' | 'excellent'
    formality: 'casual' | 'semi-formal' | 'formal'
  }
  jobExtraction: {
    jobType: 'job_posting' | 'work_request' | 'unclear'
    skills: string[]
    location: string | null
    urgency: 'low' | 'medium' | 'high'
    experience: 'beginner' | 'intermediate' | 'expert' | 'unclear'
    budget: {
      amount: number | null
      currency: string
      type: 'fixed' | 'hourly' | 'negotiable'
    }
  }
  caribbeanContext: {
    localTerms: string[]
    culturalReferences: string[]
    islandSpecific: boolean
  }
}

// Voice Jobs table (matches Twilio webhook structure)
export interface VoiceJob {
  id?: string
  created_at?: string
  caller_phone: string
  recording_sid: string
  recording_url: string
  gradio_event_id: string
  status: 'processing' | 'completed' | 'error'
  transcription?: string
  processed_at?: string
  gig_type?: 'job_posting' | 'work_request'
  // GPT extracted fields
  extracted_location?: string | null
  extracted_budget?: string | null
  extracted_skill?: string | null
  extracted_timing?: string | null
  extracted_description?: string | null
  extraction_completed?: boolean
}

// Legacy VoiceGig interface (keeping for compatibility)
export interface VoiceGig {
  id: string
  created_at: string
  whatsapp_number?: string
  whatsapp_message_id?: string
  voice_url?: string
  transcription: string
  duration_seconds?: number
  gig_type: 'job_posting' | 'work_request'
  title: string
  description: string
  category?: string
  location?: string
  budget_min?: number
  budget_max?: number
  currency: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  processed_at?: string
  contact_method: 'whatsapp' | 'voice_call' | 'both'
  // ASR Analysis fields
  asr_confidence?: number
  accent_primary?: string
  accent_confidence?: number
  skills?: string[]
  urgency?: 'low' | 'medium' | 'high'
  experience_level?: 'beginner' | 'intermediate' | 'expert' | 'unclear'
  speech_clarity?: 'poor' | 'fair' | 'good' | 'excellent'
  speech_pace?: 'slow' | 'normal' | 'fast'
  speech_formality?: 'casual' | 'semi-formal' | 'formal'
  local_terms?: string[]
  cultural_references?: string[]
  island_specific?: boolean
  asr_analysis?: CaribbeanASRResult | null
  // Geolocation fields
  latitude?: number
  longitude?: number
  location_accuracy?: number
  detected_island?: string
  nearest_town?: string
  parish?: string
  is_caribbean?: boolean
  is_tourist_area?: boolean
  location_timestamp?: string
}

export interface ModerationResult {
  safe: boolean
  reason?: string
}

export interface AppStats {
  totalJobs: number
  totalWorkers: number
  activeGigs: number
}