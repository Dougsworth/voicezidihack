// Debug utility to test HuggingFace API connectivity

export async function testHuggingFaceAPI(): Promise<void> {
  const baseUrl = 'https://dougsworth-linkup-asr.hf.space'
  
  console.log('🔍 Testing HuggingFace Space connectivity...')
  
  // Test 1: Check if Space is running
  try {
    console.log('1. Checking if Space is accessible...')
    const response = await fetch(baseUrl)
    console.log(`✅ Space accessible: ${response.status} ${response.statusText}`)
    
    // Check for Gradio interface
    const text = await response.text()
    if (text.includes('gradio')) {
      console.log('✅ Gradio interface detected')
    }
    
  } catch (error) {
    console.error('❌ Space not accessible:', error)
  }
  
  // Test 2: Check API endpoints
  const endpoints = [
    '/api/predict',
    '/predict', 
    '/api/v1/predict',
    '/run/predict'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`2. Testing endpoint: ${baseUrl}${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      
      console.log(`   Status: ${response.status}`)
      const responseText = await response.text()
      console.log(`   Response: ${responseText.substring(0, 200)}...`)
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error}`)
    }
  }
  
  // Test 3: Create a test audio blob and try transcription
  try {
    console.log('3. Testing with sample audio...')
    const testAudio = await createTestAudioBlob()
    
    // Try the main transcription function
    const { transcribeAudio } = await import('./transcribe')
    const result = await transcribeAudio(testAudio)
    console.log('✅ Transcription result:', result)
    
  } catch (error) {
    console.error('❌ Transcription test failed:', error)
  }
}

// Create a simple test audio blob (1 second of silence)
async function createTestAudioBlob(): Promise<Blob> {
  const audioContext = new AudioContext()
  const sampleRate = audioContext.sampleRate
  const duration = 1 // 1 second
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
  
  // Fill with a simple tone for testing
  const channelData = buffer.getChannelData(0)
  for (let i = 0; i < channelData.length; i++) {
    channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1 // 440 Hz tone at low volume
  }
  
  // Convert to WAV blob (simplified)
  const arrayBuffer = new ArrayBuffer(44 + buffer.length * 2)
  const view = new DataView(arrayBuffer)
  
  // WAV header (simplified)
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + buffer.length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, buffer.length * 2, true)
  
  // Convert audio data
  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    const sample = channelData[i]
    view.setInt16(offset, sample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

// Call this function in your browser console to test
if (typeof window !== 'undefined') {
  (window as any).testHuggingFaceAPI = testHuggingFaceAPI
}