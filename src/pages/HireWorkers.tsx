import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { Clock, ArrowLeft, Shield, Wrench, Phone, RefreshCw } from 'lucide-react'
import { Header } from '@/components'
import JobDetailModal from '@/components/JobDetailModal'

export default function HireWorkers() {
  const [workers, setWorkers] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<VoiceJob | null>(null)

  useEffect(() => {
    fetchWorkers()
    processTranscriptions()
  }, [])

  const fetchWorkers = async () => {
    try {
      const data = await VoiceJobsService.getVoiceJobs({ gigType: 'work_request' })
      console.log('👷 Fetched work requests:', data.length)
      setWorkers(data)
    } catch (error) {
      console.error('Error fetching workers:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTranscriptions = async () => {
    try {
      setTranscribing(true)
      const result = await VoiceJobsService.processPendingTranscriptions()
      if (result.processed > 0) {
        // Also categorize any pending jobs
        await VoiceJobsService.categorizePendingJobs()
        await fetchWorkers()
      }
    } catch (error) {
      console.error('Error processing transcriptions:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const transcribeSingle = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation()
    try {
      setTranscribing(true)
      await VoiceJobsService.transcribeVoiceJob(jobId)
      // Categorize the job after transcription
      await VoiceJobsService.categorizeVoiceJob(jobId)
      await fetchWorkers()
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
        <div className="pt-24 flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
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
            <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👷 Hire Workers</h1>
            <p className="text-gray-600">Workers offering their skills and services</p>
            <p className="text-sm text-gray-500 mt-2">Click any card for details</p>
          </div>

          {/* Workers Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {workers.map((worker) => (
              <div 
                key={worker.id} 
                onClick={() => setSelectedJob(worker)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-500">{formatTimeAgo(worker.created_at)}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    worker.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {worker.status === 'completed' ? '✓' : '⏳'}
                  </span>
                </div>

                {/* Transcription */}
                {worker.transcription ? (
                  <p className="text-gray-700 text-sm mb-3 line-clamp-3">"{worker.transcription}"</p>
                ) : (
                  <div className="mb-3">
                    <p className="text-gray-400 text-sm italic mb-1">Transcription pending...</p>
                    <button
                      onClick={(e) => worker.id && transcribeSingle(e, worker.id)}
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
                    <span>{formatPhoneNumber(worker.caller_phone)}</span>
                  </div>
                  <span className="text-xs text-green-600 font-medium">View details →</span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {workers.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">No workers yet</h3>
              <p className="text-gray-500 text-sm">Workers will appear when they post voice notes</p>
            </div>
          )}

          {/* Tips */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4 max-w-xl mx-auto">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <span className="font-medium">Tips:</span> Verify experience, agree on rates upfront, check references.
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
