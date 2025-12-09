import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Header, VoiceRecorder } from '@/components'
import { supabase } from '@/lib/supabase'
import { transcribeAudio, parseGigType, extractBudget, generateTitle } from '@/lib/transcribe'
import { CheckCircle, ExternalLink } from 'lucide-react'

export default function VoiceDemo() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobPosted, setJobPosted] = useState(false)
  const [jobId, setJobId] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      // Step 1: Transcribe the audio
      console.log('Transcribing audio...')
      const transcription = await transcribeAudio(audioBlob)
      
      // Step 2: Parse the transcription
      console.log('Parsing transcription:', transcription)
      const gigType = parseGigType(transcription)
      const budget = extractBudget(transcription)
      const title = generateTitle(transcription)
      
      // Step 3: Save to Supabase
      console.log('Saving to database...')
      const { data, error } = await supabase
        .from('voice_gigs')
        .insert({
          transcription,
          gig_type: gigType,
          title,
          description: transcription,
          budget_min: budget.min,
          budget_max: budget.max,
          currency: 'JMD',
          status: 'active',
          contact_method: 'whatsapp',
          processed_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log('Job posted successfully:', data)
      setJobId(data.id)
      setJobPosted(true)
      
    } catch (error) {
      console.error('Error processing voice note:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const caribbeanFlags = ["🇯🇲", "🇹🇹", "🇧🇧", "🇬🇾", "🇧🇸", "🇧🇿", "🇦🇬", "🇱🇨", "🇬🇩", "🇻🇨", "🇩🇲", "🇰🇳"]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            {/* Caribbean Flags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {caribbeanFlags.map((flag, index) => (
                <span 
                  key={index} 
                  className="text-2xl inline-block animate-bounce hover:scale-125 transition-transform cursor-default"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationDuration: '2s'
                  }}
                >
                  {flag}
                </span>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              LinkUpWork Caribbean
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Post jobs or find work with just your voice
            </p>
            <p className="text-teal-600 font-medium">
              Record → Transcribe → Connect
            </p>
          </div>

          {!jobPosted ? (
            <div className="max-w-2xl mx-auto">
              {/* Voice Recorder */}
              <VoiceRecorder 
                onRecordingComplete={handleRecordingComplete}
                isProcessing={isProcessing}
              />
              
              {/* How It Works */}
              <div className="mt-12 grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="font-bold text-lg mb-2 text-blue-600">🎯 Need Work Done?</h3>
                  <p className="text-gray-600 text-sm">
                    "I need my roof fixed in Kingston. Budget is 15,000 JMD."
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg border">
                  <h3 className="font-bold text-lg mb-2 text-green-600">⚒️ Offering Services?</h3>
                  <p className="text-gray-600 text-sm">
                    "I'm a plumber available for emergency calls in Spanish Town."
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Success State
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white p-8 rounded-xl border-2 border-green-200">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Voice Note Posted!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your job/service is now live and people can contact you.
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View All Jobs
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/"
                      className="text-center bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Go Home
                    </Link>
                    <button
                      onClick={() => {
                        setJobPosted(false)
                        setJobId(null)
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      Post Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}