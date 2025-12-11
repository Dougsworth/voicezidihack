import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { ArrowLeft, Shield, Wrench } from 'lucide-react'
import { Header } from '@/components'
import JobDetailModal from '@/components/JobDetailModal'
import { SimpleJobCard } from '@/components/cards/SimpleJobCard'

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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {workers.map((worker) => (
              <SimpleJobCard
                key={worker.id}
                job={worker}
                onClick={() => setSelectedJob(worker)}
                type="work_request"
              />
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
