import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { MessageCircle, Clock, Briefcase, ArrowLeft, Shield, Phone, Play, Pause, RefreshCw } from 'lucide-react'
import { Header } from '@/components'

export default function FindWork() {
  const [jobs, setJobs] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchJobs()
    // Auto-transcribe pending jobs in background
    processTranscriptions()
  }, [])

  const fetchJobs = async () => {
    try {
      // Fetch job postings from voice_jobs table (people looking for workers)
      const data = await VoiceJobsService.getVoiceJobs({ gigType: 'job_posting' })
      console.log('📋 Fetched job postings:', data.length)
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTranscriptions = async () => {
    try {
      setTranscribing(true)
      const result = await VoiceJobsService.processPendingTranscriptions()
      console.log('🎤 Transcription results:', result)
      
      // Refresh the list if any were processed
      if (result.processed > 0) {
        await fetchJobs()
      }
    } catch (error) {
      console.error('Error processing transcriptions:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const transcribeSingle = async (jobId: string) => {
    try {
      setTranscribing(true)
      await VoiceJobsService.transcribeVoiceJob(jobId)
      await fetchJobs()
    } catch (error) {
      console.error('Error transcribing:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown time'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('1')) {
      const number = cleaned.substring(1)
      return `+1 (${number.substring(0,3)}) ${number.substring(3,6)}-${number.substring(6)}`
    }
    return phone
  }

  const playRecording = (job: VoiceJob) => {
    if (playingId === job.id) {
      // Stop playing
      audioRef?.pause()
      setPlayingId(null)
      setAudioRef(null)
    } else {
      // Stop any current audio
      audioRef?.pause()
      
      // Play new audio
      const audio = new Audio(job.recording_url)
      audio.play()
      audio.onended = () => {
        setPlayingId(null)
        setAudioRef(null)
      }
      setAudioRef(audio)
      setPlayingId(job.id || null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'error': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Find Work</h1>
            <p className="text-gray-600">Job postings from people who need work done</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">All posts verified via Twilio voice calls</span>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(job.created_at)}
                  </span>
                </div>

                {/* Caller Info */}
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatPhoneNumber(job.caller_phone)}
                  </span>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status === 'completed' ? '✓ Transcribed' : 
                     job.status === 'processing' ? '⏳ Processing' : '⚠ Error'}
                  </span>
                </div>

                {/* Transcription */}
                {job.transcription ? (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 italic">
                    "{job.transcription}"
                  </p>
                ) : (
                  <div className="mb-4">
                    <p className="text-gray-400 text-sm italic mb-2">
                      Transcription pending...
                    </p>
                    <button
                      onClick={() => job.id && transcribeSingle(job.id)}
                      disabled={transcribing}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${transcribing ? 'animate-spin' : ''}`} />
                      {transcribing ? 'Transcribing...' : 'Transcribe now'}
                    </button>
                  </div>
                )}

                {/* Play Recording Button */}
                <button 
                  onClick={() => playRecording(job)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  {playingId === job.id ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Play Recording
                    </>
                  )}
                </button>

                {/* Contact Button */}
                <a 
                  href={`https://wa.me/${job.caller_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact via WhatsApp
                </a>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No voice recordings yet
              </h3>
              <p className="text-gray-500 mb-4">
                Call the hotline to post a job via voice!
              </p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Safety First</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Always meet clients in public places</li>
                  <li>• Get payment details upfront</li>
                  <li>• Listen to full voice recordings before committing</li>
                  <li>• Trust your instincts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
