// GPT-Enhanced Caribbean Accent Detection Service
export interface AccentDetectionResult {
  accent: 'jamaican' | 'trinidadian' | 'barbadian' | 'guyanese' | 'general_caribbean' | 'standard_english'
  confidence: number
  indicators: string[]
  patoisLevel: 'none' | 'light' | 'moderate' | 'heavy'
  islandProbability: {
    jamaica: number
    trinidad: number
    barbados: number
    guyana: number
    other: number
  }
  // Enhanced GPT analysis
  linguisticFeatures: string[]
  culturalReferences: string[]
  dialectVariant?: string
  speechPatterns: string[]
  recommendation?: string
}

export class AccentDetectionService {
  // Jamaican Patois patterns
  private static readonly JAMAICAN_PATTERNS = [
    /\bmi\b/gi, // me/I
    /\bdem\b/gi, // them
    /\byuh\b/gi, // you
    /\bseh\b/gi, // say
    /\bweh\b/gi, // where
    /\bwaan\b/gi, // want
    /\bmek\b/gi, // make
    /\bfi\b/gi, // for/to
    /\bbadda\b/gi, // bother
    /\bpromo\b/gi, // someone
    /\byaadie\b/gi, // yard/here
    /\bbway\b/gi, // boy
    /\bgyal\b/gi, // girl
    /\bting\b/gi, // thing
    /\bnuh\b/gi, // no/not
  ]

  // Trinidadian patterns
  private static readonly TRINIDADIAN_PATTERNS = [
    /\bah\s+go\b/gi, // I will
    /\brel\b/gi, // really
    /\bgyul\b/gi, // girl
    /\bman\b(?=\s|$)/gi, // man (as emphasis)
    /\bboy\b(?=\s|$)/gi, // boy (as emphasis)
    /\btrini\b/gi, // Trinidadian
    /\bfete\b/gi, // party
    /\blime\b/gi, // hang out
    /\bmamaguy\b/gi, // fool around
  ]

  // Barbadian (Bajan) patterns
  private static readonly BARBADIAN_PATTERNS = [
    /\bwunna\b/gi, // you all
    /\bbajan\b/gi, // Barbadian
    /\bpun\b/gi, // on
    /\bwid\b/gi, // with
    /\buh\b/gi, // you
    /\bde\b/gi, // the
    /\bin\s+de\b/gi, // in the
    /\bgine\b/gi, // going to
  ]

  // Guyanese patterns
  private static readonly GUYANESE_PATTERNS = [
    /\bme\s+gun\b/gi, // I will
    /\bsmall\s+boy\b/gi, // young man
    /\bsmall\s+girl\b/gi, // young woman
    /\bbackra\b/gi, // white person
    /\bme\s+deh\b/gi, // I am
    /\bcoolie\b/gi, // person of Indian descent
  ]

  /**
   * Detect accent from transcribed text using GPT + fallback patterns
   */
  static async detectAccent(transcription: string): Promise<AccentDetectionResult> {
    try {
      // First try GPT-enhanced detection
      const gptResult = await this.detectAccentWithGPT(transcription)
      if (gptResult) {
        console.log('[ACCENT DETECTION] GPT analysis complete:', gptResult.accent, gptResult.confidence)
        return gptResult
      }
    } catch (error) {
      console.error('[ACCENT DETECTION] GPT failed, falling back to patterns:', error)
    }
    
    // Fallback to pattern-based detection
    return this.detectAccentWithPatterns(transcription)
  }

  /**
   * GPT-powered Caribbean dialect analysis
   */
  static async detectAccentWithGPT(transcription: string): Promise<AccentDetectionResult | null> {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!OPENAI_API_KEY) {
      console.warn('[ACCENT DETECTION] No OpenAI API key found')
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
            content: `Analyze this Caribbean voice transcription for dialect and accent markers: "${transcription}"

EXPERT CARIBBEAN LINGUISTIC ANALYSIS:
You are a Caribbean linguistics expert. Distinguish between ACCENT (pronunciation/intonation patterns) and PATOIS/CREOLE (actual vocabulary/grammar usage).

IMPORTANT: Someone can have a Caribbean ACCENT but speak Standard English with no Patois. Only mark patois as present if actual Caribbean vocabulary/grammar is used.

CARIBBEAN DIALECTS TO IDENTIFY:
- JAMAICAN PATOIS: "mi" (me/I), "dem" (them), "yuh" (you), "seh" (say), "weh" (where), "waan" (want), "mek" (make), "fi" (for/to), "inna" (in), "promo" (someone), "badda" (bother), "yaad" (yard/home)
- TRINIDADIAN: "ah go" (I will), "rel" (really), "gyul" (girl), "man/boy" (emphasis), "lime" (hang out), "fete" (party), "mamaguy" (fool around), "tabanca" (heartbreak)
- BARBADIAN (BAJAN): "wunna" (you all), "pun" (on), "wid" (with), "uh" (you), "de" (the), "gine" (going to), "bout here" (around here)
- GUYANESE: "me gun" (I will), "small boy/girl" (young person), "backra" (white person), "me deh" (I am), "pickney" (child)

ACCENT vs PATOIS:
- ACCENT: Pronunciation, rhythm, intonation (can be Caribbean without using Creole words)
- PATOIS: Actual Caribbean vocabulary and grammar structures

ANALYZE FOR:
1. Vocabulary markers (specific words/terms)
2. Grammar patterns (word order, verb forms)  
3. Phonetic spellings (how pronunciation is written)
4. Cultural references (places, customs, slang)
5. Speech rhythm indicators
6. Code-switching patterns (English + Creole mixing)

RETURN ONLY JSON:
{
  "accent": "jamaican" | "trinidadian" | "barbadian" | "guyanese" | "general_caribbean" | "standard_english",
  "confidence": 0.0-1.0,
  "patoisLevel": "none" | "light" | "moderate" | "heavy",
  "indicators": ["specific words/phrases found"],
  "linguisticFeatures": ["grammar patterns", "phonetic features"],
  "culturalReferences": ["cultural terms", "local expressions"],
  "dialectVariant": "more specific variant if detectable",
  "speechPatterns": ["rhythm", "intonation clues"],
  "islandProbability": {
    "jamaica": 0.0-1.0,
    "trinidad": 0.0-1.0, 
    "barbados": 0.0-1.0,
    "guyana": 0.0-1.0,
    "other": 0.0-1.0
  },
  "recommendation": "brief insight about the dialect usage"
}`
          }],
          temperature: 0.1,
          max_tokens: 500
        })
      })

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
      
      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) throw new Error('No response from GPT')
      
      const parsed = JSON.parse(content)
      
      return {
        accent: parsed.accent || 'standard_english',
        confidence: parsed.confidence || 0,
        indicators: parsed.indicators || [],
        patoisLevel: parsed.patoisLevel || 'none',
        islandProbability: parsed.islandProbability || {
          jamaica: 0.2, trinidad: 0.2, barbados: 0.2, guyana: 0.2, other: 0.2
        },
        linguisticFeatures: parsed.linguisticFeatures || [],
        culturalReferences: parsed.culturalReferences || [],
        dialectVariant: parsed.dialectVariant,
        speechPatterns: parsed.speechPatterns || [],
        recommendation: parsed.recommendation
      }
      
    } catch (error) {
      console.error('[ACCENT DETECTION] GPT analysis failed:', error)
      return null
    }
  }

  /**
   * Fallback pattern-based detection
   */
  static detectAccentWithPatterns(transcription: string): AccentDetectionResult {
    const text = transcription.toLowerCase()
    const indicators: string[] = []
    
    // Count pattern matches for each accent
    const jamaicanScore = this.countMatches(text, this.JAMAICAN_PATTERNS, 'Jamaican', indicators)
    const trinidadianScore = this.countMatches(text, this.TRINIDADIAN_PATTERNS, 'Trinidadian', indicators)
    const barbadianScore = this.countMatches(text, this.BARBADIAN_PATTERNS, 'Barbadian', indicators)
    const guyaneseScore = this.countMatches(text, this.GUYANESE_PATTERNS, 'Guyanese', indicators)

    // Calculate total Caribbean score
    const totalCaribbeanScore = jamaicanScore + trinidadianScore + barbadianScore + guyaneseScore
    
    // Determine primary accent
    const scores = {
      jamaican: jamaicanScore,
      trinidadian: trinidadianScore,
      barbadian: barbadianScore,
      guyanese: guyaneseScore
    }

    const maxScore = Math.max(...Object.values(scores))
    let accent: AccentDetectionResult['accent'] = 'standard_english'
    let confidence = 0

    if (maxScore > 0) {
      // Find the accent with the highest score
      const topAccent = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as keyof typeof scores
      if (topAccent) {
        accent = topAccent
        confidence = Math.min(maxScore / Math.max(text.split(' ').length * 0.1, 1), 1)
      }
      
      // If multiple patterns but no clear winner, classify as general Caribbean
      if (totalCaribbeanScore > 1 && confidence < 0.6) {
        accent = 'general_caribbean'
        confidence = Math.min(totalCaribbeanScore / Math.max(text.split(' ').length * 0.15, 1), 1)
      }
    }

    // Determine Patois level
    const patoisLevel = this.determinePatoisLevel(totalCaribbeanScore, text.split(' ').length)

    // Calculate island probabilities
    const total = jamaicanScore + trinidadianScore + barbadianScore + guyaneseScore + 1 // +1 to avoid division by zero
    const islandProbability = {
      jamaica: jamaicanScore / total,
      trinidad: trinidadianScore / total,
      barbados: barbadianScore / total,
      guyana: guyaneseScore / total,
      other: 1 / total
    }

    return {
      accent,
      confidence,
      indicators,
      patoisLevel,
      islandProbability,
      linguisticFeatures: indicators.length > 0 ? ['Pattern-based detection'] : [],
      culturalReferences: [],
      speechPatterns: [],
      recommendation: confidence > 0.6 ? 'Strong Caribbean dialect detected' : 'Minimal Caribbean features found'
    }
  }

  /**
   * Count pattern matches and add to indicators
   */
  private static countMatches(text: string, patterns: RegExp[], accentName: string, indicators: string[]): number {
    let score = 0
    const foundPatterns: string[] = []
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        score += matches.length
        foundPatterns.push(...matches.map(match => match.trim()))
      }
    })
    
    if (foundPatterns.length > 0) {
      indicators.push(`${accentName}: ${[...new Set(foundPatterns)].slice(0, 3).join(', ')}`)
    }
    
    return score
  }

  /**
   * Determine the level of Patois usage
   */
  private static determinePatoisLevel(caribbeanScore: number, wordCount: number): AccentDetectionResult['patoisLevel'] {
    const ratio = caribbeanScore / Math.max(wordCount, 1)
    
    if (ratio === 0) return 'none'
    if (ratio < 0.1) return 'light'
    if (ratio < 0.3) return 'moderate'
    return 'heavy'
  }

  /**
   * Get user-friendly accent description
   */
  static getAccentDescription(result: AccentDetectionResult): string {
    const { accent, confidence, patoisLevel } = result
    
    const confidenceText = confidence > 0.8 ? 'Strong' : confidence > 0.5 ? 'Moderate' : 'Weak'
    
    switch (accent) {
      case 'jamaican':
        return `${confidenceText} Jamaican accent detected (${(confidence * 100).toFixed(0)}%)`
      case 'trinidadian':
        return `${confidenceText} Trinidadian accent detected (${(confidence * 100).toFixed(0)}%)`
      case 'barbadian':
        return `${confidenceText} Barbadian (Bajan) accent detected (${(confidence * 100).toFixed(0)}%)`
      case 'guyanese':
        return `${confidenceText} Guyanese accent detected (${(confidence * 100).toFixed(0)}%)`
      case 'general_caribbean':
        return `Caribbean accent detected (${(confidence * 100).toFixed(0)}%)`
      default:
        return `Standard English accent (${(confidence * 100).toFixed(0)}%)`
    }
  }

  /**
   * Get Patois level description
   */
  static getPatoisDescription(patoisLevel: AccentDetectionResult['patoisLevel']): string {
    switch (patoisLevel) {
      case 'heavy':
        return 'Heavy Patois usage - Rich Caribbean dialect'
      case 'moderate':
        return 'Moderate Patois usage - Mixed Caribbean expressions'
      case 'light':
        return 'Light Caribbean influence detected'
      default:
        return 'Standard English with no discernible Caribbean dialect markers'
    }
  }
}