// Moderation Service - Content filtering and rate limiting
import type { ModerationResult } from '../types'
import { RATE_LIMIT_CONFIG } from '../constants'

export class ModerationService {
  // Rate limiting - simple in-memory store (would use Redis in production)
  private static rateLimiter = new Map<string, { count: number, resetTime: number }>()

  static moderateContent(transcription: string): ModerationResult {
    const lowerText = transcription.toLowerCase()
    
    // Basic inappropriate content detection
    const inappropriateWords = [
      'scam', 'fraud', 'steal', 'illegal', 'drugs', 'weapon', 'violence',
      'adult', 'sex', 'gambling', 'casino', 'bet', 'loan shark'
    ]
    
    const suspiciousPatterns = [
      /send.*money.*first/i,
      /advance.*payment/i,
      /wire.*transfer/i,
      /western.*union/i,
      /guaranteed.*income/i,
      /work.*from.*home.*\\$\\d+/i,
      /click.*here.*now/i,
      /urgent.*respond/i
    ]
    
    // Check for inappropriate words
    for (const word of inappropriateWords) {
      if (lowerText.includes(word)) {
        return { safe: false, reason: `Contains inappropriate content: ${word}` }
      }
    }
    
    // Check for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(transcription)) {
        return { safe: false, reason: 'Contains suspicious pattern that may indicate a scam' }
      }
    }
    
    // Check for very short or nonsensical content
    if (transcription.trim().length < 3) {
      return { safe: false, reason: 'Content too short to be meaningful' }
    }
    
    // Check for repeated characters (spam detection)
    if (/(.)\\1{10,}/.test(transcription)) {
      return { safe: false, reason: 'Contains repetitive spam content' }
    }
    
    return { safe: true }
  }

  static checkRateLimit(
    identifier: string, 
    maxRequests = RATE_LIMIT_CONFIG.maxRequests, 
    windowMinutes = RATE_LIMIT_CONFIG.windowMinutes
  ): boolean {
    const now = Date.now()
    const windowMs = windowMinutes * 60 * 1000
    
    const record = this.rateLimiter.get(identifier)
    
    if (!record || now > record.resetTime) {
      this.rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false // Rate limit exceeded
    }
    
    record.count++
    return true
  }

  static getRateLimitInfo(identifier: string): { remaining: number, resetTime: number } {
    const record = this.rateLimiter.get(identifier)
    
    if (!record || Date.now() > record.resetTime) {
      return { remaining: RATE_LIMIT_CONFIG.maxRequests, resetTime: 0 }
    }
    
    return {
      remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - record.count),
      resetTime: record.resetTime
    }
  }
}