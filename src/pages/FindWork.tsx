import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { Clock, Briefcase, ArrowLeft, Shield, Phone, RefreshCw } from 'lucide-react'
import { Header } from '@/components'
import JobDetailModal from '@/components/JobDetailModal'

export default function FindWork() {
  const [jobs, setJobs] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<VoiceJob | null>(null)

  useEffect(() => {
    fetchJobs()
    processTranscriptions()
  }, [])

  const fetchJobs = async () => {
    try {
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
      if (result.processed > 0) {
        await fetchJobs()
      }
    } catch (error) {
      console.error('Error processing transcriptions:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const transcribeSingle = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation() // Prevent opening modal
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
    if (!dateString) return 'Unknown'
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
    if (phone === 'web_user') return 'Web User'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      const number = cleaned.substring(1)
      return `+1 (${number.substring(0,3)}) ${number.substring(3,6)}-${number.substring(6)}`
    }
    return phone
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
            <p className="text-sm text-gray-500 mt-2">Click any card for details</p>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-500">{formatTimeAgo(job.created_at)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    job.status === 'processing' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {job.status === 'completed' ? '✓' : '⏳'}
                  </span>
                </div>

                {/* Transcription */}
                {job.transcription ? (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                    "{job.transcription}"
                  </p>
                ) : (
                  <div className="mb-3">
                    <p className="text-gray-400 text-sm italic mb-1">Transcription pending...</p>
                    <button
                      onClick={(e) => job.id && transcribeSingle(e, job.id)}
                      disabled={transcribing}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${transcribing ? 'animate-spin' : ''}`} />
                      {transcribing ? 'Transcribing...' : 'Transcribe'}
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{formatPhoneNumber(job.caller_phone)}</span>
                  </div>
                  <span className="text-xs text-teal-600 font-medium">View details →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">No jobs yet</h3>
              <p className="text-gray-500 text-sm">Post a voice note to get started</p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl mx-auto">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <span className="font-medium">Safety:</span> Meet in public, get payment details upfront, trust your instincts.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
