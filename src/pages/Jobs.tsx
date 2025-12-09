import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { Clock, ArrowLeft, Briefcase, Wrench, Phone, RefreshCw } from 'lucide-react'
import { Header } from '@/components'
import JobDetailModal from '@/components/JobDetailModal'

export default function Jobs() {
  const [jobs, setJobs] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [transcribing, setTranscribing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<VoiceJob | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'job_posting' | 'work_request'>('all')

  useEffect(() => {
    fetchJobs()
    processTranscriptions()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await VoiceJobsService.getVoiceJobs()
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
      if (result.processed > 0) await fetchJobs()
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
      await fetchJobs()
    } catch (error) {
      console.error('Error transcribing:', error)
    } finally {
      setTranscribing(false)
    }
  }

  const filteredJobs = useMemo(() => {
    let result = jobs
    if (statusFilter !== 'all') result = result.filter(job => job.status === statusFilter)
    if (typeFilter !== 'all') result = result.filter(job => job.gig_type === typeFilter)
    return result
  }, [jobs, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: jobs.length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    jobPostings: jobs.filter(j => j.gig_type === 'job_posting').length,
    workRequests: jobs.filter(j => j.gig_type === 'work_request').length
  }), [jobs])

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d`
    if (hours > 0) return `${hours}h`
    return 'Now'
  }

  const formatPhone = (phone: string) => {
    if (phone === 'web_user') return 'Web'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length >= 10) return `...${cleaned.slice(-4)}`
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
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-3 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">All Voice Notes</h1>
            <p className="text-gray-600 text-sm">{stats.total} total • {stats.completed} transcribed</p>
            <p className="text-xs text-gray-500 mt-1">Click any card for details</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border">
              {(['all', 'job_posting', 'work_request'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    typeFilter === type ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'job_posting' ? '🔍 Jobs' : '👷 Workers'}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm border">
              {(['all', 'completed', 'processing'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === status ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? 'All' : status === 'completed' ? '✓ Done' : '⏳ Pending'}
                </button>
              ))}
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className={`bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-all cursor-pointer ${
                  job.gig_type === 'work_request' ? 'hover:border-green-300' : 'hover:border-blue-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {job.gig_type === 'work_request' ? (
                      <Wrench className="w-4 h-4 text-green-600" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs text-gray-500">{formatTimeAgo(job.created_at)}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {job.status === 'completed' ? '✓' : '⏳'}
                  </span>
                </div>

                {/* Content */}
                {job.transcription ? (
                  <p className="text-gray-700 text-sm mb-2 line-clamp-2">"{job.transcription}"</p>
                ) : (
                  <div className="mb-2">
                    <p className="text-gray-400 text-xs italic mb-1">Pending...</p>
                    <button
                      onClick={(e) => job.id && transcribeSingle(e, job.id)}
                      disabled={transcribing}
                      className="text-xs text-teal-600 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${transcribing ? 'animate-spin' : ''}`} />
                      Transcribe
                    </button>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {formatPhone(job.caller_phone)}
                  </span>
                  <span className={`text-xs font-medium ${
                    job.gig_type === 'work_request' ? 'text-green-600' : 'text-blue-600'
                  }`}>Details →</span>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No matching recordings</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
