// Intelligent Job Details Extraction using GPT
export interface ExtractedJobDetails {
  location: string | null
  budget: string | null
  skill: string | null
  timing: string | null
  description: string | null
}

export class IntelligentExtractionService {
  /**
   * Extract job details from transcription using GPT
   */
  static async extractJobDetails(transcription: string): Promise<ExtractedJobDetails> {
    try {
      return await this.extractWithGPT(transcription)
    } catch (error) {
      console.error('GPT extraction failed, falling back to local:', error)
      return this.smartLocalExtraction(transcription)
    }
  }

  /**
   * Smart local extraction as fallback/placeholder for GPT
   */
  private static smartLocalExtraction(transcription: string): ExtractedJobDetails {
    const text = transcription.toLowerCase()
    
    // Extract location - Jamaican places
    let location = null
    const locationPatterns = [
      /(?:in|at|to|from|near)\s+(kingston|montego bay|spanish town|portmore|may pen|mandeville|ocho rios|negril|half way tree|new kingston|downtown|uptown|papine|liguanea|constant spring|cross roads|hope pastures|barbican|manor park|meadowbrook|red hills|stony hill|mona)/i,
      /(?:in|at|to|from|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:\s+(?:road|street|avenue|drive|close|gardens|heights|park|hill)))/i
    ]
    
    for (const pattern of locationPatterns) {
      const match = transcription.match(pattern)
      if (match) {
        location = match[1].trim()
        break
      }
    }
    
    // Extract budget - only clear monetary mentions
    let budget = null
    const budgetPatterns = [
      /(?:pay|cost|charge|rate|price|for)\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|jmd|jamaican)?/i,
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
      /(\d+)\s*(?:jamaican\s*)?dollars?/i
    ]
    
    for (const pattern of budgetPatterns) {
      const match = transcription.match(pattern)
      if (match) {
        budget = `$${match[1]}`
        break
      }
    }
    
    // Extract skill/service - common Caribbean services
    let skill = null
    const skillPatterns = [
      /(?:need|want|looking for|seeking)\s+(?:a|an|some)?\s*(handyman|plumber|electrician|carpenter|cleaner|gardener|painter|mechanic|driver|security|cook|maid|helper|technician|mason|welder|barber|hairdresser|seamstress|tailor)/i,
      /(?:i am|i do|i work as)\s+(?:a|an)?\s*(handyman|plumber|electrician|carpenter|cleaner|gardener|painter|mechanic|driver|security|cook|maid|helper|technician|mason|welder|barber|hairdresser|seamstress|tailor)/i,
      /(cleaning|painting|cooking|driving|security|gardening|construction|repair)/i
    ]
    
    for (const pattern of skillPatterns) {
      const match = transcription.match(pattern)
      if (match) {
        skill = match[1].trim()
        break
      }
    }
    
    // Extract timing - when work should be done
    let timing = null
    const timingPatterns = [
      /(?:on|at|by)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /(?:at|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))/i,
      /\b(today|tomorrow|this week|next week|asap|immediately|urgent)/i,
      /(?:on|at)\s+(\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december))/i
    ]
    
    for (const pattern of timingPatterns) {
      const match = transcription.match(pattern)
      if (match) {
        timing = match[1] || match[0]
        break
      }
    }
    
    return {
      location,
      budget,
      skill,
      timing,
      description: transcription
    }
  }

  /**
   * Extract details using GPT API
   */
  static async extractWithGPT(transcription: string): Promise<ExtractedJobDetails> {
    // Direct OpenAI call from frontend
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
    
    if (!OPENAI_API_KEY) {
      console.warn('No OpenAI API key found, falling back to local extraction')
      return this.smartLocalExtraction(transcription)
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Extract job details from this Jamaican voice transcription: "${transcription}"

Return ONLY a JSON object with these exact fields:
{
  "location": "specific place in Jamaica mentioned (or null)",
  "budget": "money amount with currency (or null)", 
  "skill": "type of work/service (or null)",
  "timing": "when work should be done (or null)",
  "description": "clean summary of the request"
}

Be conservative - only extract if clearly stated. Use null for unclear items.`
          }],
          temperature: 0.1,
          max_tokens: 200
        })
      })

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`)
      
      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      if (!content) throw new Error('No response from GPT')
      
      const parsed = JSON.parse(content)
      return {
        location: parsed.location,
        budget: parsed.budget,
        skill: parsed.skill,
        timing: parsed.timing,
        description: parsed.description || transcription
      }
    } catch (error) {
      console.error('GPT extraction failed:', error)
      throw error
    }
  }
  
  // Removed server-side OpenAI code - frontend only now!
}