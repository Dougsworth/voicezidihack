import { analyzeCaribbeanSpeech, type CaribbeanASRResult } from './caribbean-asr-analysis';

// Enhanced HuggingFace API integration with Caribbean ASR analysis
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    console.log('🎤 Starting transcription with Caribbean ASR...')
    
    // Step 1: Upload file to HuggingFace Space (use original format)
    console.log('📤 Uploading audio file...')
    const uploadFormData = new FormData()
    
    // Determine file extension based on MIME type
    let fileName = 'audio.webm'
    if (audioBlob.type.includes('wav')) fileName = 'audio.wav'
    else if (audioBlob.type.includes('mp3')) fileName = 'audio.mp3'
    else if (audioBlob.type.includes('ogg')) fileName = 'audio.ogg'
    else if (audioBlob.type.includes('opus')) fileName = 'audio.opus'
    
    uploadFormData.append('files', audioBlob, fileName)
    console.log(`📁 Uploading as: ${fileName} (${audioBlob.type})`)
    
    const uploadResponse = await fetch('https://dougsworth-linkup-asr.hf.space/gradio_api/upload', {
      method: 'POST',
      body: uploadFormData,
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('✅ File uploaded:', uploadResult)
    
    const filePath = uploadResult[0] // Should be something like "/tmp/gradio/.../audio.wav"
    
    if (!filePath) {
      throw new Error('No file path returned from upload')
    }
    
    // Step 2: Start transcription job
    console.log('🧠 Starting Caribbean ASR transcription...')
    const transcribeResponse = await fetch('https://dougsworth-linkup-asr.hf.space/gradio_api/call/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [{
          path: filePath,
          meta: { _type: "gradio.FileData" }
        }]
      })
    })
    
    if (!transcribeResponse.ok) {
      throw new Error(`Transcribe call failed: ${transcribeResponse.status}`)
    }
    
    const transcribeResult = await transcribeResponse.json()
    console.log('🎯 Transcription job started:', transcribeResult)
    
    const eventId = transcribeResult.event_id
    
    if (!eventId) {
      throw new Error('No event_id returned from transcribe call')
    }
    
    // Step 3: Get the transcription result
    console.log('⏳ Waiting for transcription result...')
    const resultResponse = await fetch(`https://dougsworth-linkup-asr.hf.space/gradio_api/call/transcribe/${eventId}`)
    
    if (!resultResponse.ok) {
      throw new Error(`Result fetch failed: ${resultResponse.status}`)
    }
    
    // Parse the streaming response
    const reader = resultResponse.body?.getReader()
    if (!reader) {
      throw new Error('No response body reader')
    }
    
    const decoder = new TextDecoder()
    let result = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        console.log('📡 Received chunk:', chunk)
        
        // Parse streaming response format: "event: complete\ndata: ["transcription"]"
        if (chunk.includes('event: complete')) {
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6) // Remove "data: "
              try {
                const data = JSON.parse(dataStr)
                if (Array.isArray(data) && data[0]) {
                  result = data[0].trim()
                  console.log('✅ Caribbean ASR transcription successful:', result)
                  return result
                }
              } catch (parseError) {
                console.log('Parse error for line:', line)
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
    
    if (result) {
      return result
    }
    
    throw new Error('No transcription result received')
    
  } catch (error) {
    console.error('❌ Caribbean ASR transcription failed:', error)
    
    // Fallback to demo data for pitch purposes
    const demoTranscriptions = [
      "I need someone to fix my roof in Kingston. It's leaking when it rains. Budget is around 15,000 JMD.",
      "Looking for a graphic designer to create a logo for my bakery. Can pay 8,000 JMD for good work.",
      "I'm a plumber available for emergency calls in Spanish Town area. Call me for any pipe issues.",
      "Need someone to help move furniture this weekend. Two bedroom apartment. Can pay 5,000 JMD.",
      "Experienced electrician offering services across Kingston. Licensed and insured. Fair prices."
    ]
    
    const randomDemo = demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)]
    
    console.log('🎭 Using demo transcription due to API error:', error.message)
    await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate processing time
    
    return `[DEMO - API Error: ${error.message}] ${randomDemo}`
  }
}

// Try Gradio file upload format for /transcribe endpoint
async function tryGradioFileUpload(audioBlob: Blob): Promise<string> {
  try {
    console.log('Trying correct Gradio /transcribe file upload...')
    
    // Method 1: Try with proper file upload to /run/transcribe
    const formData = new FormData()
    formData.append('data', audioBlob, 'audio.wav')
    
    const response = await fetch('https://dougsworth-linkup-asr.hf.space/run/transcribe', {
      method: 'POST',
      body: formData,
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ File upload success:', result)
      
      const transcription = result.data?.[0] || result
      if (typeof transcription === 'string' && transcription.length > 0) {
        return transcription
      }
    }
    
    // Method 2: Try with base64 data URL (like the Python client)
    console.log('Trying base64 data URL method...')
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const dataUrl = `data:audio/wav;base64,${base64}`
    
    const jsonResponse = await fetch('https://dougsworth-linkup-asr.hf.space/run/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [dataUrl]
      })
    })
    
    if (jsonResponse.ok) {
      const result = await jsonResponse.json()
      console.log('✅ Base64 method success:', result)
      const transcription = result.data?.[0] || result
      if (typeof transcription === 'string' && transcription.length > 0) {
        return transcription
      }
    }
    
    throw new Error('Gradio /transcribe API methods failed')
    
  } catch (error) {
    console.error('All Gradio API attempts failed:', error)
    
    // Return a demo transcription with error notice
    const demoTranscriptions = [
      "I need someone to fix my roof in Kingston. It's leaking when it rains. Budget is around 15,000 JMD.",
      "Looking for a graphic designer to create a logo for my bakery. Can pay 8,000 JMD for good work.",
      "I'm a plumber available for emergency calls in Spanish Town area. Call me for any pipe issues.",
      "Need someone to help move furniture this weekend. Two bedroom apartment. Can pay 5,000 JMD.",
      "Experienced electrician offering services across Kingston. Licensed and insured. Fair prices."
    ]
    
    const randomDemo = demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)]
    
    // Add a delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Using demo transcription due to API issues')
    return `[DEMO] ${randomDemo}`
  }
}

// Convert WebM/other formats to WAV for better compatibility
async function convertToWav(blob: Blob): Promise<Blob> {
  try {
    // If it's already a WAV, return as is
    if (blob.type === 'audio/wav') {
      return blob
    }
    
    const audioContext = new AudioContext()
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Convert to WAV format
    const numberOfChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const format = 16 // 16-bit samples
    const bitDepth = format
    
    const result = new ArrayBuffer(44 + audioBuffer.length * numberOfChannels * 2)
    const view = new DataView(result)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true)
    
    // Convert float32 to int16
    let offset = 44
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    return new Blob([result], { type: 'audio/wav' })
    
  } catch (error) {
    console.error('WAV conversion failed, using original blob:', error)
    return blob
  }
}

// Helper function to detect if transcription is a job posting or work request
export function parseGigType(transcription: string): 'job_posting' | 'work_request' {
  const lowerText = transcription.toLowerCase()
  
  const jobKeywords = ['need', 'looking for', 'want', 'require', 'hiring', 'help with']
  const workKeywords = ['i am', 'i\'m', 'available', 'i do', 'i offer', 'experienced', 'skilled']
  
  const hasJobKeywords = jobKeywords.some(keyword => lowerText.includes(keyword))
  const hasWorkKeywords = workKeywords.some(keyword => lowerText.includes(keyword))
  
  // If both or neither, default to job posting
  if (hasWorkKeywords && !hasJobKeywords) {
    return 'work_request'
  }
  
  return 'job_posting'
}

// Helper function to extract budget from transcription
export function extractBudget(transcription: string): { min: number | null, max: number | null } {
  const budgetRegex = /(\d+(?:,\d+)*)\s*(?:to|\-|and)\s*(\d+(?:,\d+)*)|(\d+(?:,\d+)*)\s*(?:jmd|dollars?|bucks?)/gi
  
  const matches = Array.from(transcription.matchAll(budgetRegex))
  
  if (matches.length > 0) {
    const match = matches[0]
    
    if (match[1] && match[2]) {
      // Range: "5000 to 10000"
      return {
        min: parseInt(match[1].replace(/,/g, '')),
        max: parseInt(match[2].replace(/,/g, ''))
      }
    } else if (match[3]) {
      // Single amount: "15000 JMD"
      const amount = parseInt(match[3].replace(/,/g, ''))
      return { min: amount, max: amount }
    }
  }
  
  return { min: null, max: null }
}

// Helper function to generate title from transcription
export function generateTitle(transcription: string): string {
  const words = transcription.split(' ')
  if (words.length <= 8) {
    return transcription
  }
  
  return words.slice(0, 8).join(' ') + '...'
}

// Content moderation - check for inappropriate content
export function moderateContent(transcription: string): { safe: boolean, reason?: string } {
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
    /work.*from.*home.*\$\d+/i,
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
  if (transcription.trim().length < 10) {
    return { safe: false, reason: 'Content too short to be meaningful' }
  }
  
  // Check for repeated characters (spam detection)
  if (/(.)\1{10,}/.test(transcription)) {
    return { safe: false, reason: 'Contains repetitive spam content' }
  }
  
  return { safe: true }
}

// Rate limiting - simple in-memory store (would use Redis in production)
const rateLimiter = new Map<string, { count: number, resetTime: number }>()

export function checkRateLimit(identifier: string, maxRequests = 5, windowMinutes = 15): boolean {
  const now = Date.now()
  const windowMs = windowMinutes * 60 * 1000
  
  const record = rateLimiter.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false // Rate limit exceeded
  }
  
  record.count++
  return true
}

// Enhanced function that returns full Caribbean ASR analysis
export async function transcribeAndAnalyzeCaribbean(audioBlob: Blob): Promise<CaribbeanASRResult> {
  try {
    console.log('🎤 Starting advanced Caribbean ASR analysis...')
    
    // Step 1: Get basic transcription
    const transcription = await transcribeAudio(audioBlob)
    
    // Step 2: Perform advanced Caribbean analysis
    console.log('🧠 Analyzing Caribbean speech patterns...')
    const analysis = await analyzeCaribbeanSpeech(transcription)
    
    console.log('✅ Caribbean ASR analysis complete:', {
      confidence: analysis.confidence,
      accent: analysis.accent.primary,
      jobType: analysis.jobExtraction.jobType,
      skills: analysis.jobExtraction.skills
    })
    
    return analysis
    
  } catch (error) {
    console.error('❌ Caribbean ASR analysis failed:', error)
    
    // Fallback to basic transcription with minimal analysis
    const basicTranscription = await transcribeAudio(audioBlob)
    return await analyzeCaribbeanSpeech(basicTranscription)
  }
}