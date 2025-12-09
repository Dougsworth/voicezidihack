import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type VoiceGig } from '@/lib/supabase'
import { MessageCircle, MapPin, DollarSign, Clock, Briefcase, Wrench, ArrowLeft } from 'lucide-react'

export default function Jobs() {
  const [jobs, setJobs] = useState<VoiceGig[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'job_posting' | 'work_request'>('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('voice_gigs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = filter === 'all' 
    ? jobs 
    : jobs.filter(job => job.gig_type === filter)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return 'Just now'
  }

  const formatBudget = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return 'Budget not specified'
    if (min === max) return `$${min?.toLocaleString()} ${currency}`
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
    if (min) return `From $${min.toLocaleString()} ${currency}`
    if (max) return `Up to $${max.toLocaleString()} ${currency}`
    return 'Budget not specified'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Jobs & Workers</h1>
          <p className="text-gray-600">All voice notes from across the Caribbean</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('job_posting')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'job_posting' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Jobs ({jobs.filter(j => j.gig_type === 'job_posting').length})
            </button>
            <button
              onClick={() => setFilter('work_request')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'work_request' 
                  ? 'bg-teal-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Workers ({jobs.filter(j => j.gig_type === 'work_request').length})
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
                  job.gig_type === 'job_posting' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {job.gig_type === 'job_posting' ? (
                    <Briefcase className="w-5 h-5" />
                  ) : (
                    <Wrench className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(job.created_at)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                {job.title}
              </h3>

              {/* Transcription */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                "{job.transcription}"
              </p>

              {/* Budget */}
              {(job.budget_min || job.budget_max) && (
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {formatBudget(job.budget_min, job.budget_max, job.currency)}
                  </span>
                </div>
              )}

              {/* Location */}
              {job.location && (
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>
              )}

              {/* Contact Button */}
              <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact via WhatsApp
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {filter === 'all' ? (
                <Briefcase className="w-16 h-16 mx-auto" />
              ) : filter === 'job_posting' ? (
                <Briefcase className="w-16 h-16 mx-auto" />
              ) : (
                <Wrench className="w-16 h-16 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {filter === 'all' ? 'jobs or workers' : filter === 'job_posting' ? 'jobs' : 'workers'} found
            </h3>
            <p className="text-gray-500">
              Be the first to post a voice note!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}