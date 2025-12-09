// OpenAI Service - Enhanced job posting generation
export interface EnhancedJobPosting {
  title: string
  description: string
  requirements: string[]
  duration: string
  payment: string
  location: string
  category: string
  urgency: 'low' | 'medium' | 'high'
  jobType: 'job_posting' | 'work_request'
}

export class OpenAIService {
  private static readonly API_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''
  private static readonly API_BASE = 'https://api.openai.com/v1'

  static async enhanceJobPosting(
    transcription: string, 
    accent: string, 
    location: string,
    skills: string[]
  ): Promise<EnhancedJobPosting> {
    try {
      const prompt = this.buildPrompt(transcription, accent, location, skills)
      
      const response = await fetch(`${this.API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert job posting creator for the Caribbean market. You understand Caribbean English, patois, and local work culture. Create professional, clear job postings from casual voice recordings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      if (!content) {
        throw new Error('No content received from OpenAI')
      }

      return this.parseResponse(content, transcription)
    } catch (error) {
      console.error('Error enhancing job posting with OpenAI:', error)
      // Fallback to basic enhancement
      return this.createFallbackPosting(transcription, location, skills)
    }
  }

  private static buildPrompt(transcription: string, accent: string, location: string, skills: string[]): string {
    return `
Please transform this Caribbean voice recording into a professional job posting. 

Original voice recording: "${transcription}"
Detected accent: ${accent}
Location: ${location}
Extracted skills: ${skills.join(', ') || 'None detected'}

Create a structured job posting with these sections:
1. Professional title
2. Clear description 
3. Requirements list
4. Estimated duration
5. Payment range (in local currency if mentioned, otherwise "Negotiable")
6. Location
7. Category (e.g., "Construction", "Cleaning", "Repair", "Professional Services")
8. Urgency level (low/medium/high based on language used)
9. Job type (job_posting for someone needing work done, work_request for someone offering services)

Make it sound professional but maintain the Caribbean context. If payment isn't mentioned, use "Negotiable". If details are unclear, make reasonable assumptions based on context.

Return the response in this exact JSON format:
{
  "title": "Job Title Here",
  "description": "Detailed description here",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "duration": "Time estimate",
  "payment": "Payment amount or Negotiable",
  "location": "${location}",
  "category": "Category name",
  "urgency": "low|medium|high",
  "jobType": "job_posting|work_request"
}
    `.trim()
  }

  private static parseResponse(content: string, originalTranscription: string): EnhancedJobPosting {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          title: parsed.title || 'General Service Request',
          description: parsed.description || originalTranscription,
          requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
          duration: parsed.duration || 'To be discussed',
          payment: parsed.payment || 'Negotiable',
          location: parsed.location || 'Caribbean',
          category: parsed.category || 'General Services',
          urgency: ['low', 'medium', 'high'].includes(parsed.urgency) ? parsed.urgency : 'medium',
          jobType: ['job_posting', 'work_request'].includes(parsed.jobType) ? parsed.jobType : 'job_posting'
        }
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
    }

    // Fallback if parsing fails
    return this.createFallbackPosting(originalTranscription, 'Caribbean', [])
  }

  private static createFallbackPosting(transcription: string, location: string, skills: string[]): EnhancedJobPosting {
    // Determine job type based on keywords
    const lowerText = transcription.toLowerCase()
    const isWorkRequest = lowerText.includes('i can') || lowerText.includes('i do') || lowerText.includes('i offer') || lowerText.includes('i provide')
    
    // Determine urgency
    const isUrgent = lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('quick') || lowerText.includes('now')
    const urgency = isUrgent ? 'high' : 'medium'

    // Basic category detection
    let category = 'General Services'
    if (skills.length > 0) {
      const skill = skills[0].toLowerCase()
      if (skill.includes('clean')) category = 'Cleaning'
      else if (skill.includes('cook')) category = 'Food Services'
      else if (skill.includes('drive')) category = 'Transportation'
      else if (skill.includes('repair') || skill.includes('fix')) category = 'Repairs'
      else if (skill.includes('paint')) category = 'Painting'
      else if (skill.includes('garden')) category = 'Landscaping'
      else if (skill.includes('electric')) category = 'Electrical'
      else if (skill.includes('plumb')) category = 'Plumbing'
      else if (skill.includes('build') || skill.includes('construction')) category = 'Construction'
    }

    return {
      title: skills.length > 0 ? `${skills[0]} Service` : 'General Service Request',
      description: transcription,
      requirements: skills.length > 0 ? [`${skills[0]} experience`, 'Reliability'] : ['Professional service'],
      duration: 'To be discussed',
      payment: 'Negotiable',
      location: location,
      category,
      urgency,
      jobType: isWorkRequest ? 'work_request' : 'job_posting'
    }
  }
}