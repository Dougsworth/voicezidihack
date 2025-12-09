import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type VoiceGig } from '@/lib/supabase'
import { MessageCircle, MapPin, DollarSign, Clock, Briefcase, ArrowLeft, Shield } from 'lucide-react'
import Header from '@/components/Header'

export default function FindWork() {
  const [jobs, setJobs] = useState<VoiceGig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      // Only show job postings (people looking for workers)
      const { data, error } = await supabase
        .from('voice_gigs')
        .select('*')
        .eq('status', 'active')
        .eq('gig_type', 'job_posting')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

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
    if (!min && !max) return 'Budget negotiable'
    if (min === max) return `$${min?.toLocaleString()} ${currency}`
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} ${currency}`
    if (min) return `From $${min.toLocaleString()} ${currency}`
    if (max) return `Up to $${max.toLocaleString()} ${currency}`
    return 'Budget negotiable'
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
            <p className="text-gray-600">Available jobs from people who need work done</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">All posts are moderated</span>
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

                {/* Apply Button */}
                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contact Client
                </button>
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
                No jobs available right now
              </h3>
              <p className="text-gray-500 mb-4">
                Check back soon for new opportunities!
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                Post your skills to get hired
              </Link>
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
                  <li>• Report suspicious activity</li>
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