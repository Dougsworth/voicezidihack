// Advanced ASR Confidence Calculation Service
import type { CaribbeanASRResult } from '../types'

export class AdvancedConfidenceService {
  
  /**
   * Calculate comprehensive ASR confidence based on multiple factors
   */
  static calculateAdvancedConfidence(
    transcription: string,
    analysis: CaribbeanASRResult,
    audioMetadata?: {
      duration: number
      sampleRate: number
      bitrate: number
      signalToNoise?: number
    }
  ): {
    overall: number
    breakdown: {
      linguisticConfidence: number
      semanticConfidence: number
      culturalConfidence: number
      technicalConfidence: number
      contextualConfidence: number
    }
  } {
    
    // 1. LINGUISTIC CONFIDENCE (25%)
    const linguisticConfidence = this.calculateLinguisticConfidence(transcription, analysis)
    
    // 2. SEMANTIC CONFIDENCE (20%) 
    const semanticConfidence = this.calculateSemanticConfidence(analysis)
    
    // 3. CULTURAL CONFIDENCE (20%)
    const culturalConfidence = this.calculateCulturalConfidence(analysis)
    
    // 4. TECHNICAL CONFIDENCE (20%) 
    const technicalConfidence = this.calculateTechnicalConfidence(transcription, audioMetadata)
    
    // 5. CONTEXTUAL CONFIDENCE (15%)
    const contextualConfidence = this.calculateContextualConfidence(analysis)
    
    // Weighted overall confidence
    const overall = (
      linguisticConfidence * 0.25 +
      semanticConfidence * 0.20 +
      culturalConfidence * 0.20 +
      technicalConfidence * 0.20 +
      contextualConfidence * 0.15
    )
    
    return {
      overall: Math.min(overall, 0.98), // Cap at 98%
      breakdown: {
        linguisticConfidence,
        semanticConfidence,
        culturalConfidence,
        technicalConfidence,
        contextualConfidence
      }
    }
  }
  
  /**
   * 1. Linguistic Confidence - Grammar, coherence, vocabulary
   */
  private static calculateLinguisticConfidence(
    transcription: string, 
    analysis: CaribbeanASRResult
  ): number {
    let confidence = 0.3 // Base
    
    // Grammar coherence (check for proper sentence structure)
    const sentences = transcription.split(/[.!?]/).filter(s => s.trim().length > 0)
    if (sentences.length > 0) confidence += 0.2
    
    // Word diversity (vocabulary richness)
    const words = transcription.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const diversity = uniqueWords.size / Math.max(words.length, 1)
    confidence += diversity * 0.3
    
    // Caribbean language patterns detected
    if (analysis.accent.detected.length > 0) confidence += 0.15
    if (analysis.accent.primary !== 'general_caribbean') confidence += 0.05
    
    return Math.min(confidence, 1.0)
  }
  
  /**
   * 2. Semantic Confidence - Meaning extraction success
   */
  private static calculateSemanticConfidence(analysis: CaribbeanASRResult): number {
    let confidence = 0.2 // Base
    
    // Job type detection
    if (analysis.jobExtraction.jobType !== 'unclear') confidence += 0.25
    
    // Skills extraction
    confidence += Math.min(analysis.jobExtraction.skills.length * 0.1, 0.3)
    
    // Budget detection
    if (analysis.jobExtraction.budget.amount) confidence += 0.15
    
    // Location detection  
    if (analysis.jobExtraction.location) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
  
  /**
   * 3. Cultural Confidence - Caribbean context understanding
   */
  private static calculateCulturalConfidence(analysis: CaribbeanASRResult): number {
    let confidence = 0.1 // Base
    
    // Local terms detected
    confidence += Math.min(analysis.caribbeanContext.localTerms.length * 0.15, 0.4)
    
    // Cultural references
    confidence += Math.min(analysis.caribbeanContext.culturalReferences.length * 0.1, 0.3)
    
    // Island-specific content
    if (analysis.caribbeanContext.islandSpecific) confidence += 0.2
    
    return Math.min(confidence, 1.0)
  }
  
  /**
   * 4. Technical Confidence - Audio quality & transcription reliability
   */
  private static calculateTechnicalConfidence(
    transcription: string,
    audioMetadata?: {
      duration: number
      sampleRate: number
      bitrate: number
      signalToNoise?: number
    }
  ): number {
    let confidence = 0.3 // Base
    
    // Text length indicates successful transcription
    if (transcription.length > 20) confidence += 0.15
    if (transcription.length > 100) confidence += 0.15
    
    // Audio quality indicators
    if (audioMetadata) {
      // Good sample rate
      if (audioMetadata.sampleRate >= 16000) confidence += 0.1
      if (audioMetadata.sampleRate >= 44100) confidence += 0.1
      
      // Good duration (not too short)
      if (audioMetadata.duration >= 3) confidence += 0.1
      if (audioMetadata.duration >= 10) confidence += 0.05
      
      // Signal to noise ratio (if available)
      if (audioMetadata.signalToNoise && audioMetadata.signalToNoise > 10) {
        confidence += Math.min(audioMetadata.signalToNoise / 50, 0.15)
      }
    }
    
    // Absence of transcription artifacts
    const artifacts = ['[unclear]', '...', '???', '[inaudible]']
    const hasArtifacts = artifacts.some(artifact => 
      transcription.toLowerCase().includes(artifact.toLowerCase())
    )
    if (!hasArtifacts) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
  
  /**
   * 5. Contextual Confidence - Job market context understanding
   */
  private static calculateContextualConfidence(analysis: CaribbeanASRResult): number {
    let confidence = 0.2 // Base
    
    // Urgency detection
    if (analysis.jobExtraction.urgency !== 'medium') confidence += 0.15
    
    // Experience level detection
    if (analysis.jobExtraction.experience !== 'unclear') confidence += 0.15
    
    // Speech formality appropriate for context
    const appropriateFormality = (
      analysis.speechPatterns.formality === 'semi-formal' ||
      analysis.speechPatterns.formality === 'formal'
    )
    if (appropriateFormality) confidence += 0.2
    
    // Clear communication (good clarity)
    if (analysis.speechPatterns.clarity === 'excellent') confidence += 0.2
    if (analysis.speechPatterns.clarity === 'good') confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }
  
  /**
   * Get confidence level description
   */
  static getConfidenceDescription(confidence: number): {
    level: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High'
    description: string
    color: string
  } {
    if (confidence >= 0.85) {
      return {
        level: 'Very High',
        description: 'Excellent Caribbean speech recognition with high confidence',
        color: 'green'
      }
    } else if (confidence >= 0.7) {
      return {
        level: 'High', 
        description: 'Good Caribbean speech recognition with clear patterns',
        color: 'blue'
      }
    } else if (confidence >= 0.5) {
      return {
        level: 'Medium',
        description: 'Moderate recognition, some Caribbean patterns detected',
        color: 'yellow'
      }
    } else if (confidence >= 0.3) {
      return {
        level: 'Low',
        description: 'Basic recognition, limited Caribbean context understanding',
        color: 'orange'
      }
    } else {
      return {
        level: 'Very Low',
        description: 'Poor recognition, unclear content or technical issues',
        color: 'red'
      }
    }
  }
  
  /**
   * Calibration factors for different Caribbean accents
   */
  private static getAccentCalibration(accent: string): number {
    const calibrations = {
      jamaican: 1.0,     // Best trained
      trinidadian: 0.95, // Well trained
      barbadian: 0.90,   // Good training
      guyanese: 0.85,    // Moderate training
      general_caribbean: 0.80 // Fallback
    }
    
    return calibrations[accent] || 0.75
  }
}