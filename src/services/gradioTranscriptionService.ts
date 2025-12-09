// Gradio Transcription Service - based on working curl commands
export class GradioTranscriptionService {
  private static readonly GRADIO_BASE_URL = 'https://dougsworth-linkup-asr.hf.space'
  
  /**
   * Upload file to Gradio and get the server path
   */
  static async uploadFile(audioFile: File): Promise<string> {
    const formData = new FormData()
    formData.append('files', audioFile)
    
    const response = await fetch(`${this.GRADIO_BASE_URL}/gradio_api/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    return result[0] // Returns array with file path
  }
  
  /**
   * Start transcription job and get event ID
   */
  static async startTranscription(serverFilePath: string): Promise<string> {
    const payload = {
      data: [
        {
          path: serverFilePath,
          meta: { "_type": "gradio.FileData" }
        }
      ]
    }
    
    const response = await fetch(`${this.GRADIO_BASE_URL}/gradio_api/call/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (!response.ok) {
      throw new Error(`Transcription start failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.event_id
  }
  
  /**
   * Get transcription result using event ID
   */
  static async getTranscriptionResult(eventId: string): Promise<string> {
    const response = await fetch(`${this.GRADIO_BASE_URL}/gradio_api/call/transcribe/${eventId}`)
    
    if (!response.ok) {
      throw new Error(`Get result failed: ${response.statusText}`)
    }
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (!reader) {
      throw new Error('No response body')
    }
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('event: complete')) {
          // Next line should have the data
          continue
        }
        if (line.startsWith('data: ')) {
          const dataStr = line.substring(6)
          try {
            const data = JSON.parse(dataStr)
            return data[0].trim() // Remove leading/trailing spaces
          } catch (e) {
            console.error('Error parsing result:', e)
            throw new Error('Failed to parse transcription result')
          }
        }
      }
    }
    
    throw new Error('No transcription result received')
  }
  
  /**
   * Complete transcription workflow: upload → transcribe → get result
   */
  static async transcribeFile(audioFile: File): Promise<string> {
    try {
      console.log('🎤 Starting transcription workflow...')
      
      // Step 1: Upload file
      console.log('📤 Uploading file...')
      const serverPath = await this.uploadFile(audioFile)
      console.log('✅ File uploaded to:', serverPath)
      
      // Step 2: Start transcription
      console.log('🔄 Starting transcription...')
      const eventId = await this.startTranscription(serverPath)
      console.log('✅ Transcription started, event ID:', eventId)
      
      // Step 3: Get result
      console.log('⏳ Waiting for result...')
      const transcription = await this.getTranscriptionResult(eventId)
      console.log('✅ Transcription complete:', transcription)
      
      return transcription
      
    } catch (error) {
      console.error('❌ Transcription failed:', error)
      throw error
    }
  }
  
  /**
   * Transcribe from URL (for Twilio recordings)
   */
  static async transcribeFromUrl(audioUrl: string): Promise<string> {
    try {
      console.log('🎤 Starting transcription from URL:', audioUrl)
      
      // Step 1: Start transcription with URL
      const payload = {
        data: [
          {
            path: audioUrl,
            meta: { "_type": "gradio.FileData" }
          }
        ]
      }
      
      console.log('🔄 Starting transcription...')
      const response = await fetch(`${this.GRADIO_BASE_URL}/gradio_api/call/transcribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        throw new Error(`Transcription start failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      const eventId = result.event_id
      console.log('✅ Transcription started, event ID:', eventId)
      
      // Step 2: Get result
      console.log('⏳ Waiting for result...')
      const transcription = await this.getTranscriptionResult(eventId)
      console.log('✅ Transcription complete:', transcription)
      
      return transcription
      
    } catch (error) {
      console.error('❌ Transcription from URL failed:', error)
      throw error
    }
  }
}