import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unyttmpquqfypoxsbkve.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type VoiceGig = {
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
}