import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://unyttmpquqfypoxsbkve.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVueXR0bXBxdXFmeXBveHNia3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODUzMTYsImV4cCI6MjA4MDg2MTMxNn0.0C2uxEYluWN_fuoKE7JCTiMQrPhddL9xPxnC9Cj6Erc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase types now imported from centralized types
export type { VoiceGig, CaribbeanASRResult, AppStats } from '../types'