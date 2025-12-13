// Voice Quality Scoring Service - Helps users improve their recordings
export interface VoiceQualityResult {
  overallScore: number // 0-100
  clarity: number // 0-100
  volume: number // 0-100
  pacing: number // 0-100
  completeness: number // 0-100
  recommendations: string[]
  strengths: string[]
  issues: QualityIssue[]
}

export interface QualityIssue {
  type: 'volume' | 'clarity' | 'pacing' | 'length' | 'background_noise'
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion: string
}

export class VoiceQualityService {
  /**
   * Analyze voice recording quality from audio blob
   */
  static async analyzeAudioQuality(audioBlob: Blob): Promise<VoiceQualityResult> {
    try {
      // Convert blob to audio context for analysis
      const audioBuffer = await this.getAudioBuffer(audioBlob)
      const channelData = audioBuffer.getChannelData(0) // Get mono channel
      
      // Analyze various quality metrics
      const volumeScore = this.analyzeVolume(channelData)
      const clarityScore = this.analyzeClarity(channelData, audioBuffer.sampleRate)
      const pacingScore = this.analyzePacing(channelData, audioBuffer.duration)
      const completenessScore = this.analyzeCompleteness(audioBuffer.duration, channelData)
      
      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        volumeScore.score * 0.25 +
        clarityScore.score * 0.35 +
        pacingScore.score * 0.25 +
        completenessScore.score * 0.15
      )
      
      // Compile issues and recommendations
      const issues: QualityIssue[] = [
        ...volumeScore.issues,
        ...clarityScore.issues,
        ...pacingScore.issues,
        ...completenessScore.issues
      ]
      
      const recommendations = this.generateRecommendations(issues, overallScore)
      const strengths = this.generateStrengths(volumeScore, clarityScore, pacingScore, completenessScore)
      
      return {
        overallScore,
        clarity: Math.round(clarityScore.score),
        volume: Math.round(volumeScore.score),
        pacing: Math.round(pacingScore.score),
        completeness: Math.round(completenessScore.score),
        recommendations,
        strengths,
        issues
      }
    } catch (error) {
      console.error('Voice quality analysis failed:', error)
      return this.getDefaultQualityResult()
    }
  }

  /**
   * Analyze voice quality from transcription text using GPT + fallback
   */
  static async analyzeTranscriptionQuality(transcription: string, duration: number): Promise<VoiceQualityResult> {
    try {
      // Try GPT-enhanced analysis first
      const gptResult = await this.analyzeQualityWithGPT(transcription, duration)
      if (gptResult) {
        console.log('[VOICE QUALITY] GPT analysis complete:', gptResult.overallScore)
        return gptResult
      }
    } catch (error) {
      console.error('[VOICE QUALITY] GPT failed, falling back to basic analysis:', error)
    }
    
    // Fallback to basic analysis
    return this.analyzeQualityBasic(transcription, duration)
  }

  /**
   * GPT-powered voice quality analysis
   */
  static async analyzeQualityWithGPT(transcription: string, duration: number): Promise<VoiceQualityResult | null> {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!OPENAI_API_KEY) {
      console.warn('[VOICE QUALITY] No OpenAI API key found')
      return null
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{
            role: 'user',
            content: `Analyze this voice recording transcription for quality indicators:
            
TRANSCRIPTION: "${transcription}"
DURATION: ${duration} seconds

VOICE QUALITY ASSESSMENT:
You are an expert speech analyst. Evaluate the recording quality based on the transcription and timing.

ANALYZE FOR:
1. CLARITY (0-100): Word completeness, coherence, missing words, garbled text
2. PACING (0-100): Speaking speed (optimal: 2-3 words/second), pauses, flow
3. COMPLETENESS (0-100): Information richness, detail level, context provided
4. VOLUME (0-100): Estimate based on successful transcription (assume 75 if transcribed clearly)

CARIBBEAN CONTEXT AWARENESS:
- Patois/Creole usage is POSITIVE for authenticity, not negative for clarity
- Natural Caribbean speech patterns are expected and good
- Code-switching between English/Patois shows linguistic skill

PROVIDE:
- Specific strengths in the recording
- Actionable improvement recommendations  
- Insights about Caribbean dialect usage
- Assessment of job-relevance and professionalism

RETURN ONLY JSON:
{
  "overallScore": 0-100,
  "clarity": 0-100,
  "volume": 0-100,
  "pacing": 0-100,
  "completeness": 0-100,
  "strengths": ["specific positive aspects"],
  "recommendations": ["specific improvement suggestions"],
  "issues": [
    {
      "type": "clarity" | "volume" | "pacing" | "length" | "background_noise",
      "severity": "low" | "medium" | "high", 
      "description": "what the issue is",
      "suggestion": "how to fix it"
    }
  ]
}`
          }],
          temperature: 0.2,
          max_tokens: 400
        })
      })

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
      
      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) throw new Error('No response from GPT')
      
      const parsed = JSON.parse(content)
      
      return {
        overallScore: Math.round(parsed.overallScore || 75),
        clarity: Math.round(parsed.clarity || 75),
        volume: Math.round(parsed.volume || 75),
        pacing: Math.round(parsed.pacing || 75),
        completeness: Math.round(parsed.completeness || 75),
        strengths: parsed.strengths || ['Voice note recorded successfully'],
        recommendations: parsed.recommendations || ['Good recording quality'],
        issues: parsed.issues || []
      }
      
    } catch (error) {
      console.error('[VOICE QUALITY] GPT analysis failed:', error)
      return null
    }
  }

  /**
   * Basic fallback quality analysis
   */
  static analyzeQualityBasic(transcription: string, duration: number): VoiceQualityResult {
    const words = transcription.trim().split(/\s+/)
    const wordCount = words.length
    const wordsPerSecond = wordCount / Math.max(duration, 1)
    
    // Analyze based on transcription
    const clarityScore = this.estimateClarityFromText(transcription)
    const pacingScore = this.estimatePacingFromWPS(wordsPerSecond)
    const completenessScore = this.estimateCompletenessFromText(transcription, duration)
    const volumeScore = 75 // Default assumption for transcribed audio
    
    const overallScore = Math.round(
      volumeScore * 0.25 +
      clarityScore * 0.35 +
      pacingScore * 0.25 +
      completenessScore * 0.15
    )
    
    const issues: QualityIssue[] = []
    const recommendations: string[] = []
    const strengths: string[] = []
    
    // Generate feedback based on transcription
    if (clarityScore < 60) {
      issues.push({
        type: 'clarity',
        severity: 'medium',
        description: 'Some unclear words in transcription',
        suggestion: 'Speak more clearly and avoid mumbling'
      })
      recommendations.push('Speak more clearly and enunciate words')
    } else {
      strengths.push('Clear pronunciation')
    }
    
    if (pacingScore < 60) {
      if (wordsPerSecond < 1.5) {
        recommendations.push('Speak a bit faster - aim for 2-3 words per second')
      } else {
        recommendations.push('Slow down slightly - you\'re speaking very fast')
      }
    } else {
      strengths.push('Good speaking pace')
    }
    
    if (completenessScore < 60) {
      recommendations.push('Include more details about your job request')
    } else {
      strengths.push('Good level of detail')
    }
    
    return {
      overallScore,
      clarity: Math.round(clarityScore),
      volume: Math.round(volumeScore),
      pacing: Math.round(pacingScore),
      completeness: Math.round(completenessScore),
      recommendations,
      strengths,
      issues
    }
  }

  /**
   * Convert audio blob to AudioBuffer for analysis
   */
  private static async getAudioBuffer(audioBlob: Blob): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await audioBlob.arrayBuffer()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  /**
   * Analyze volume levels
   */
  private static analyzeVolume(channelData: Float32Array): { score: number; issues: QualityIssue[] } {
    const issues: QualityIssue[] = []
    
    // Calculate RMS (Root Mean Square) for volume
    let sum = 0
    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] * channelData[i]
    }
    const rms = Math.sqrt(sum / channelData.length)
    
    // Check for clipping (values at maximum)
    const clippedSamples = channelData.filter(sample => Math.abs(sample) > 0.95).length
    const clippingRatio = clippedSamples / channelData.length
    
    let score = 100
    
    if (rms < 0.01) {
      score = 20
      issues.push({
        type: 'volume',
        severity: 'high',
        description: 'Recording volume is too low',
        suggestion: 'Move closer to microphone or increase volume'
      })
    } else if (rms < 0.05) {
      score = 60
      issues.push({
        type: 'volume',
        severity: 'medium',
        description: 'Recording volume could be higher',
        suggestion: 'Speak louder or move closer to microphone'
      })
    } else if (clippingRatio > 0.01) {
      score = 40
      issues.push({
        type: 'volume',
        severity: 'high',
        description: 'Audio is clipping (too loud)',
        suggestion: 'Reduce volume or move away from microphone'
      })
    } else if (rms > 0.3) {
      score = 70
      issues.push({
        type: 'volume',
        severity: 'low',
        description: 'Volume is quite high',
        suggestion: 'Speak slightly softer for better quality'
      })
    }
    
    return { score, issues }
  }

  /**
   * Analyze clarity (frequency distribution)
   */
  private static analyzeClarity(channelData: Float32Array, sampleRate: number): { score: number; issues: QualityIssue[] } {
    const issues: QualityIssue[] = []
    
    // Simplified clarity analysis based on signal consistency
    const windowSize = Math.floor(sampleRate * 0.1) // 100ms windows
    let consistencyScore = 100
    
    // Check for sudden amplitude changes (indicating noise/interference)
    let abruptChanges = 0
    for (let i = windowSize; i < channelData.length - windowSize; i += windowSize) {
      const prevWindowAvg = this.getWindowAverage(channelData, i - windowSize, windowSize)
      const currentWindowAvg = this.getWindowAverage(channelData, i, windowSize)
      
      if (Math.abs(currentWindowAvg - prevWindowAvg) > 0.1) {
        abruptChanges++
      }
    }
    
    const windows = Math.floor(channelData.length / windowSize)
    const noiseRatio = abruptChanges / Math.max(windows, 1)
    
    if (noiseRatio > 0.3) {
      consistencyScore = 40
      issues.push({
        type: 'background_noise',
        severity: 'high',
        description: 'High background noise detected',
        suggestion: 'Record in a quieter environment'
      })
    } else if (noiseRatio > 0.15) {
      consistencyScore = 70
      issues.push({
        type: 'background_noise',
        severity: 'medium',
        description: 'Some background noise detected',
        suggestion: 'Try to minimize background noise'
      })
    }
    
    return { score: consistencyScore, issues }
  }

  /**
   * Analyze speaking pace
   */
  private static analyzePacing(channelData: Float32Array, duration: number): { score: number; issues: QualityIssue[] } {
    const issues: QualityIssue[] = []
    
    // Estimate words by detecting speech segments
    const speechSegments = this.detectSpeechSegments(channelData)
    const totalSpeechTime = speechSegments.reduce((sum, segment) => sum + segment.duration, 0)
    const silenceTime = Math.max(0, duration - totalSpeechTime)
    const silenceRatio = silenceTime / duration
    
    let score = 100
    
    if (silenceRatio > 0.5) {
      score = 40
      issues.push({
        type: 'pacing',
        severity: 'high',
        description: 'Too many long pauses',
        suggestion: 'Speak more continuously and confidently'
      })
    } else if (silenceRatio > 0.3) {
      score = 70
      issues.push({
        type: 'pacing',
        severity: 'medium',
        description: 'Some long pauses detected',
        suggestion: 'Try to reduce pauses between words'
      })
    } else if (silenceRatio < 0.05) {
      score = 60
      issues.push({
        type: 'pacing',
        severity: 'medium',
        description: 'Speaking very rapidly',
        suggestion: 'Slow down slightly for better clarity'
      })
    }
    
    return { score, issues }
  }

  /**
   * Analyze completeness (duration and content)
   */
  private static analyzeCompleteness(duration: number, channelData: Float32Array): { score: number; issues: QualityIssue[] } {
    const issues: QualityIssue[] = []
    let score = 100
    
    if (duration < 3) {
      score = 30
      issues.push({
        type: 'length',
        severity: 'high',
        description: 'Recording is too short',
        suggestion: 'Provide more details about your job request'
      })
    } else if (duration < 5) {
      score = 60
      issues.push({
        type: 'length',
        severity: 'medium',
        description: 'Recording could be more detailed',
        suggestion: 'Include location, timing, and budget information'
      })
    } else if (duration > 60) {
      score = 70
      issues.push({
        type: 'length',
        severity: 'low',
        description: 'Recording is quite long',
        suggestion: 'Try to be more concise while keeping key details'
      })
    }
    
    return { score, issues }
  }

  /**
   * Helper methods for audio analysis
   */
  private static getWindowAverage(channelData: Float32Array, start: number, length: number): number {
    let sum = 0
    for (let i = start; i < Math.min(start + length, channelData.length); i++) {
      sum += Math.abs(channelData[i])
    }
    return sum / length
  }

  private static detectSpeechSegments(channelData: Float32Array): { start: number; duration: number }[] {
    // Simplified speech detection - looks for sustained energy
    const threshold = 0.02
    const segments: { start: number; duration: number }[] = []
    let inSpeech = false
    let segmentStart = 0
    
    for (let i = 0; i < channelData.length; i++) {
      const isSpeech = Math.abs(channelData[i]) > threshold
      
      if (isSpeech && !inSpeech) {
        segmentStart = i
        inSpeech = true
      } else if (!isSpeech && inSpeech) {
        segments.push({
          start: segmentStart,
          duration: i - segmentStart
        })
        inSpeech = false
      }
    }
    
    return segments
  }

  /**
   * Text-based quality estimation methods
   */
  private static estimateClarityFromText(text: string): number {
    // Higher score for complete words and proper grammar
    const words = text.split(/\s+/)
    const unclearWords = words.filter(word => word.length < 2 || /[^a-zA-Z0-9\s]/.test(word)).length
    const clarityRatio = 1 - (unclearWords / Math.max(words.length, 1))
    return clarityRatio * 100
  }

  private static estimatePacingFromWPS(wordsPerSecond: number): number {
    // Optimal range is 2-3 words per second
    if (wordsPerSecond >= 2 && wordsPerSecond <= 3) return 100
    if (wordsPerSecond >= 1.5 && wordsPerSecond <= 4) return 80
    if (wordsPerSecond >= 1 && wordsPerSecond <= 5) return 60
    return 40
  }

  private static estimateCompletenessFromText(text: string, duration: number): number {
    const wordCount = text.split(/\s+/).length
    if (wordCount < 10) return 40
    if (wordCount < 20) return 70
    if (wordCount > 100) return 80 // Very detailed
    return 100
  }

  /**
   * Generate recommendations based on issues
   */
  private static generateRecommendations(issues: QualityIssue[], overallScore: number): string[] {
    const recommendations = issues.map(issue => issue.suggestion)
    
    if (overallScore < 60) {
      recommendations.push('Consider re-recording for better quality')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great recording quality! Your voice note is clear and easy to understand.')
    }
    
    return [...new Set(recommendations)] // Remove duplicates
  }

  /**
   * Generate strengths based on scores
   */
  private static generateStrengths(
    volume: { score: number },
    clarity: { score: number },
    pacing: { score: number },
    completeness: { score: number }
  ): string[] {
    const strengths: string[] = []
    
    if (volume.score >= 80) strengths.push('Good volume level')
    if (clarity.score >= 80) strengths.push('Clear audio quality')
    if (pacing.score >= 80) strengths.push('Natural speaking pace')
    if (completeness.score >= 80) strengths.push('Good amount of detail')
    
    return strengths
  }

  /**
   * Default quality result when analysis fails
   */
  private static getDefaultQualityResult(): VoiceQualityResult {
    return {
      overallScore: 75,
      clarity: 75,
      volume: 75,
      pacing: 75,
      completeness: 75,
      recommendations: ['Audio analysis unavailable - recording processed successfully'],
      strengths: ['Voice note recorded'],
      issues: []
    }
  }
}