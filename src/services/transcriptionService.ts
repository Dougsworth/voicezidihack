// Transcription Service - Handles HuggingFace API communication
import { CaribbeanASRService } from './caribbeanASRService'
import type { CaribbeanASRResult } from '../types'

export class TranscriptionService {
  private static readonly API_BASE = 'https://dougsworth-linkup-asr.hf.space'
  
  // Transcribe from a URL (for Twilio recordings)
  // Note: Twilio URLs require authentication, so this only works for public URLs
  static async transcribeFromUrl(audioUrl: string): Promise<string> {
    try {
      console.log('🎤 Transcribing from URL:', audioUrl)
      
      // Check if it's a Twilio URL (requires auth - can't access from frontend)
      if (audioUrl.includes('api.twilio.com')) {
        throw new Error('Twilio recordings require authentication. Transcription must be done by the Twilio webhook.')
      }
      
      // Fetch the audio file from the URL
      const response = await fetch(audioUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`)
      }
      
      const audioBlob = await response.blob()
      console.log('📥 Downloaded audio:', audioBlob.size, 'bytes')
      
      // Use the existing transcription method
      return await this.transcribeAudio(audioBlob)
      
    } catch (error) {
      console.error('❌ URL transcription failed:', error)
      throw error
    }
  }

  // Retry transcription using the Gradio event ID (for Twilio jobs)
  static async retryTranscriptionByEventId(eventId: string): Promise<string> {
    console.log('🔄 Retrying transcription for event:', eventId)
    
    const maxRetries = 15
    const delay = 1000
    
    for (let i = 0; i < maxRetries; i++) {
      console.log(`Polling attempt ${i + 1}/${maxRetries}`)
      
      try {
        const response = await fetch(
          `${this.API_BASE}/gradio_api/call/transcribe/${eventId}`
        )
        
        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`)
        }
        
        const text = await response.text()
        const lines = text.split('\n')
        const dataLine = lines.find(l => l.startsWith('data:'))
        
        if (dataLine) {
          const transcription = JSON.parse(dataLine.replace('data: ', ''))[0]
          console.log('✅ Transcription received:', transcription)
          return transcription
        }
        
        // Not ready yet - wait then retry
        await new Promise(resolve => setTimeout(resolve, delay))
        
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('Transcription not ready after maximum retries')
  }
  
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('🎤 Starting transcription with Caribbean ASR...')
      
      // Step 1: Upload file to HuggingFace Space
      const filePath = await this.uploadAudioFile(audioBlob)
      
      // Step 2: Start transcription job
      const eventId = await this.startTranscriptionJob(filePath)
      
      // Step 3: Get the transcription result
      const transcription = await this.getTranscriptionResult(eventId)
      
      console.log('✅ Caribbean ASR transcription successful:', transcription)
      return transcription
      
    } catch (error) {
      console.error('❌ Caribbean ASR transcription failed:', error)
      return this.getFallbackTranscription()
    }
  }

  static async transcribeAndAnalyzeCaribbean(audioBlob: Blob): Promise<CaribbeanASRResult> {
    try {
      console.log('🎤 Starting advanced Caribbean ASR analysis...')
      
      // Step 1: Get basic transcription
      const transcription = await this.transcribeAudio(audioBlob)
      
      // Step 2: Perform advanced Caribbean analysis
      console.log('🧠 Analyzing Caribbean speech patterns...')
      const analysis = await CaribbeanASRService.analyzeSpeech(transcription)
      
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
      const basicTranscription = await this.transcribeAudio(audioBlob)
      return await CaribbeanASRService.analyzeSpeech(basicTranscription)
    }
  }

  private static async uploadAudioFile(audioBlob: Blob): Promise<string> {
    console.log('📤 Uploading audio file...')
    
    const uploadFormData = new FormData()
    const fileName = this.getFileName(audioBlob.type)
    
    uploadFormData.append('files', audioBlob, fileName)
    console.log(`📁 Uploading as: ${fileName} (${audioBlob.type})`)
    
    const uploadResponse = await fetch(`${this.API_BASE}/gradio_api/upload`, {
      method: 'POST',
      body: uploadFormData,
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('✅ File uploaded:', uploadResult)
    
    const filePath = uploadResult[0]
    if (!filePath) {
      throw new Error('No file path returned from upload')
    }
    
    return filePath
  }

  private static async startTranscriptionJob(filePath: string): Promise<string> {
    console.log('🧠 Starting Caribbean ASR transcription...')
    
    const transcribeResponse = await fetch(`${this.API_BASE}/gradio_api/call/transcribe`, {
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
    
    return eventId
  }

  private static async getTranscriptionResult(eventId: string): Promise<string> {
    console.log('⏳ Waiting for transcription result...')
    
    const resultResponse = await fetch(`${this.API_BASE}/gradio_api/call/transcribe/${eventId}`)
    
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
        
        // Parse streaming response format: "event: complete\ndata: [\"transcription\"]"
        if (chunk.includes('event: complete')) {
          const lines = chunk.split('\n') // Use single \n not \\n
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.substring(6) // Remove "data: "
              try {
                const data = JSON.parse(dataStr)
                if (Array.isArray(data) && data[0]) {
                  result = data[0].trim()
                  console.log('✅ Successfully parsed transcription:', result)
                  return result
                }
              } catch (parseError) {
                console.log('Parse error for line:', line, parseError)
              }
            }
          }
        } else if (chunk.includes('event: error')) {
          console.error('🚨 HuggingFace API error detected in stream:', chunk)
          throw new Error('HuggingFace API returned an error')
        }
      }
    } finally {
      reader.releaseLock()
    }
    
    if (result) {
      return result
    }
    
    throw new Error('No transcription result received')
  }

  private static getFileName(mimeType: string): string {
    if (mimeType.includes('wav')) return 'audio.wav'
    if (mimeType.includes('mp3')) return 'audio.mp3'
    if (mimeType.includes('ogg')) return 'audio.ogg'
    if (mimeType.includes('opus')) return 'audio.opus'
    return 'audio.webm'
  }

  private static getFallbackTranscription(): string {
    const demoTranscriptions = [
      "I need someone to fix my roof in Kingston. It's leaking when it rains. Budget is around 15,000 JMD.",
      "Looking for a graphic designer to create a logo for my bakery. Can pay 8,000 JMD for good work.",
      "I'm a plumber available for emergency calls in Spanish Town area. Call me for any pipe issues.",
      "Need someone to help move furniture this weekend. Two bedroom apartment. Can pay 5,000 JMD.",
      "Experienced electrician offering services across Kingston. Licensed and insured. Fair prices."
    ]
    
    const randomDemo = demoTranscriptions[Math.floor(Math.random() * demoTranscriptions.length)]
    console.log('🎭 Using demo transcription due to API error')
    
    return randomDemo
  }
}