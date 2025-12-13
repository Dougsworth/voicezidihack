import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { ArrowLeft, Briefcase, Shield, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react'
import { Header } from '@/components'
import JobDetailModal from '@/components/JobDetailModal'
import { SimpleJobCard } from '@/components/cards/SimpleJobCard'
import { processIncompleteJobs } from '@/utils/processIncompleteJobs'

const ITEMS_PER_PAGE = 9

export default function FindWork() {
  const [jobs, setJobs] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<VoiceJob | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingCount, setPendingCount] = useState(0)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchJobs()
    processTranscriptions()
  }, [])

  const handleProcessIncomplete = async () => {
    try {
      setProcessing(true)
      console.log('[PROCESSING] Starting incomplete job processing...')
      const result = await processIncompleteJobs()
      
      if (result.processed > 0) {
        console.log(`[PROCESSING] Successfully processed ${result.processed} incomplete jobs`)
        await fetchJobs() // Refresh the job list
      } else {
        console.log('[PROCESSING] No incomplete jobs found to process')
      }
    } catch (error) {
      console.error('[PROCESSING] Error processing incomplete jobs:', error)
    } finally {
      setProcessing(false)
    }
  }

  const fetchJobs = async () => {
    try {
      const data = await VoiceJobsService.getVoiceJobs({ gigType: 'job_posting' })
      console.log('Fetched job postings:', data.length)
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
      // Get pending count
      const pendingJobs = await VoiceJobsService.getVoiceJobsByStatus('processing')
      setPendingCount(pendingJobs.length)
      
      const result = await VoiceJobsService.processPendingTranscriptions()
      if (result.processed > 0) {
        // Also categorize any pending jobs
        await VoiceJobsService.categorizePendingJobs()
        await fetchJobs()
      }
    } catch (error) {
      console.error('Error processing transcriptions:', error)
    } finally {
      setTranscribing(false)
      setPendingCount(0)
    }
  }

  const transcribeSingle = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation() // Prevent opening modal
    try {
      setTranscribing(true)
      await VoiceJobsService.transcribeVoiceJob(jobId)
      // Categorize the job after transcription
      await VoiceJobsService.categorizeVoiceJob(jobId)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              <Search className="w-8 h-8 text-teal-600" />
              Find Work
            </h1>
            <p className="text-gray-600">Job postings from people who need work done</p>
            <p className="text-sm text-gray-500 mt-2">Click any card for details</p>
            
            {/* HuggingFace Processing Status */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full ${transcribing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-600">
                  AI Processing: {transcribing ? 'Active' : 'Ready'} 
                  <span className="text-gray-400 ml-1">(Powered by HuggingFace Caribbean ASR)</span>
                </span>
              </div>
              
              {/* Processing Queue */}
              {transcribing && pendingCount > 0 && (
                <div className="text-xs text-center text-amber-600">
                  Processing {pendingCount} voice recording{pendingCount > 1 ? 's' : ''}...
                </div>
              )}
              
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
            {jobs
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map((job) => (
              <SimpleJobCard
                key={job.id}
                job={job}
                onClick={() => setSelectedJob(job)}
                type="job_posting"
              />
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

          {/* Pagination */}
          {jobs.length > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(jobs.length / ITEMS_PER_PAGE)}
              </span>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === Math.ceil(jobs.length / ITEMS_PER_PAGE)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* HuggingFace Model Section */}
          <div className="mt-8 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🤗</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Powered by HuggingFace</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Advanced Caribbean ASR technology ensuring accurate transcription of regional dialects and accents.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white rounded-lg p-3">
                  <div className="font-medium text-gray-700">Model</div>
                  <div className="text-gray-500">MMS-1B-ALL</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-medium text-gray-700">Languages</div>
                  <div className="text-gray-500">1000+ Supported</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="font-medium text-gray-700">Specialization</div>
                  <div className="text-gray-500">Caribbean Dialects</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Safety Notice */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl mx-auto">
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
