import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { VoiceJobsService } from '@/services'
import type { VoiceJob } from '@/types'
import { MessageCircle, Clock, ArrowLeft, Briefcase, Wrench, Phone, Play, Pause, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { Header } from '@/components'

export default function Jobs() {
  const [jobs, setJobs] = useState<VoiceJob[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'completed' | 'error'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'job_posting' | 'work_request'>('all')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await VoiceJobsService.getVoiceJobs()
      console.log('📋 Fetched all voice jobs:', data.length)
      setJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter jobs based on status and type
  const filteredJobs = useMemo(() => {
    let result = jobs
    if (statusFilter !== 'all') {
      result = result.filter(job => job.status === statusFilter)
    }
    if (typeFilter !== 'all') {
      result = result.filter(job => job.gig_type === typeFilter)
    }
    return result
  }, [jobs, statusFilter, typeFilter])

  // Stats
  const stats = useMemo(() => ({
    total: jobs.length,
    processing: jobs.filter(j => j.status === 'processing').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    error: jobs.filter(j => j.status === 'error').length,
    jobPostings: jobs.filter(j => j.gig_type === 'job_posting').length,
    workRequests: jobs.filter(j => j.gig_type === 'work_request').length
  }), [jobs])

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
      audioRef?.pause()
      setPlayingId(null)
      setAudioRef(null)
    } else {
      audioRef?.pause()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Loader className="w-4 h-4 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return null
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Voice Recordings</h1>
            <p className="text-gray-600">Voice notes from Twilio phone calls</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.processing}</div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  typeFilter === 'all' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Types ({stats.total})
              </button>
              <button
                onClick={() => setTypeFilter('job_posting')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  typeFilter === 'job_posting' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔍 Jobs ({stats.jobPostings})
              </button>
              <button
                onClick={() => setTypeFilter('work_request')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  typeFilter === 'work_request' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👷 Workers ({stats.workRequests})
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('processing')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'processing' ? 'bg-yellow-500 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Processing ({stats.processing})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'completed' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Completed ({stats.completed})
              </button>
              <button
                onClick={() => setStatusFilter('error')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === 'error' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Errors ({stats.error})
              </button>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    job.gig_type === 'work_request' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {job.gig_type === 'work_request' ? (
                      <Wrench className="w-5 h-5" />
                    ) : (
                      <Briefcase className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTimeAgo(job.created_at)}
                  </span>
                </div>

                {/* Gig Type Badge */}
                {job.gig_type && (
                  <div className="mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      job.gig_type === 'work_request' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {job.gig_type === 'work_request' ? '👷 Worker' : '🔍 Job'}
                    </span>
                  </div>
                )}

                {/* Caller Info */}
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {formatPhoneNumber(job.caller_phone)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>

                {/* Transcription */}
                {job.transcription ? (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 italic">
                    "{job.transcription}"
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm mb-4 italic">
                    {job.status === 'processing' ? 'Transcription in progress...' : 'No transcription available'}
                  </p>
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
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact via WhatsApp
                </a>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No recordings found
              </h3>
              <p className="text-gray-500">
                {typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try changing your filters' 
                  : 'Call the hotline to post a voice note!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
