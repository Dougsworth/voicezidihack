// Database Service - Supabase operations
import { supabase } from '../lib/supabase'
import type { VoiceGig, CaribbeanASRResult, AppStats } from '../types'
import type { CaribbeanLocation } from './geolocationService'
import { DB_CONFIG } from '../constants'

export class DatabaseService {
  // Simple create for voice gig (from transcription)
  static async createSimpleVoiceGig(
    transcription: string,
    gigType: 'job_posting' | 'work_request',
    location?: CaribbeanLocation
  ): Promise<VoiceGig> {
    const title = transcription.substring(0, 50) + (transcription.length > 50 ? '...' : '')
    
    const data = {
      transcription,
      gig_type: gigType,
      title,
      description: transcription,
      currency: DB_CONFIG.defaultCurrency,
      status: DB_CONFIG.defaultStatus,
      contact_method: DB_CONFIG.defaultContactMethod,
      whatsapp_number: 'web_user',
      processed_at: new Date().toISOString(),
      ...(location?.detectedIsland && { location: location.detectedIsland })
    }

    const { data: result, error } = await supabase
      .from('voice_gigs')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return result as VoiceGig
  }

  static async createVoiceGig(
    analysis: CaribbeanASRResult,
    gigType: 'job_posting' | 'work_request',
    title: string,
    location?: CaribbeanLocation,
    phoneNumber?: string
  ): Promise<VoiceGig> {
    const budget = analysis.jobExtraction.budget
    
    const basicData: any = {
      transcription: analysis.transcription,
      gig_type: gigType,
      title,
      description: analysis.transcription,
      budget_min: budget.amount,
      budget_max: budget.amount,
      currency: budget.currency || DB_CONFIG.defaultCurrency,
      status: DB_CONFIG.defaultStatus,
      contact_method: DB_CONFIG.defaultContactMethod,
      ...(phoneNumber && { whatsapp_number: phoneNumber }),
      processed_at: new Date().toISOString(),
      ...(analysis.jobExtraction.location && { location: analysis.jobExtraction.location })
    }
    
    try {
      const { data, error } = await supabase
        .from('voice_gigs')
        .insert({
          ...basicData,
          asr_confidence: analysis.confidence,
          accent_primary: analysis.accent.primary,
          skills: analysis.jobExtraction.skills,
          urgency: analysis.jobExtraction.urgency,
          asr_analysis: analysis as any
        })
        .select()
        .single()

      if (error) throw error
      return data as VoiceGig
      
    } catch (error: any) {
      if (error.message?.includes('column') || error.code === 'PGRST204') {
        console.warn('📊 ASR columns not found, using basic insert')
        
        const { data, error: basicError } = await supabase
          .from('voice_gigs')
          .insert(basicData)
          .select()
          .single()

        if (basicError) throw basicError
        return data as VoiceGig
      }
      
      throw error
    }
  }

  static async getVoiceGigs(
    filters: {
      gigType?: 'job_posting' | 'work_request'
      status?: string
      limit?: number
    } = {}
  ): Promise<VoiceGig[]> {
    let query = supabase
      .from('voice_gigs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters.gigType) {
      query = query.eq('gig_type', filters.gigType)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error
    return data as VoiceGig[]
  }

  static async getAppStats(): Promise<AppStats> {
    const { data, error } = await supabase
      .from('voice_gigs')
      .select('gig_type, status')
    
    if (error) throw error

    const totalJobs = data.filter(g => g.gig_type === 'job_posting').length
    const totalWorkers = data.filter(g => g.gig_type === 'work_request').length
    const activeGigs = data.filter(g => g.status === 'active').length

    return { totalJobs, totalWorkers, activeGigs }
  }

  static async searchVoiceGigs(
    searchTerm: string,
    filters: {
      gigType?: 'job_posting' | 'work_request'
      accent?: string
      location?: string
      skills?: string[]
    } = {}
  ): Promise<VoiceGig[]> {
    let query = supabase
      .from('voice_gigs')
      .select('*')
      .or(`transcription.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters.gigType) {
      query = query.eq('gig_type', filters.gigType)
    }

    if (filters.accent) {
      query = query.eq('accent_primary', filters.accent)
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }

    if (filters.skills && filters.skills.length > 0) {
      query = query.overlaps('skills', filters.skills)
    }

    const { data, error } = await query

    if (error) throw error
    return data as VoiceGig[]
  }

  static async getVoiceGigById(id: string): Promise<VoiceGig | null> {
    const { data, error } = await supabase
      .from('voice_gigs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as VoiceGig
  }

  static async updateVoiceGigStatus(
    id: string, 
    status: 'pending' | 'active' | 'completed' | 'cancelled'
  ): Promise<VoiceGig> {
    const { data, error } = await supabase
      .from('voice_gigs')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as VoiceGig
  }
}
