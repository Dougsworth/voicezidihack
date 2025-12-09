import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type VoiceGig } from '@/lib/supabase'
import { MessageCircle, MapPin, Clock, Wrench, ArrowLeft, Shield, Star } from 'lucide-react'
import Header from '@/components/Header'

export default function HireWorkers() {
  const [workers, setWorkers] = useState<VoiceGig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    try {
      // Only show work requests (people offering services)
      const { data, error } = await supabase
        .from('voice_gigs')
        .select('*')
        .eq('status', 'active')
        .eq('gig_type', 'work_request')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWorkers(data || [])
    } catch (error) {
      console.error('Error fetching workers:', error)
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

  const getWorkerCategory = (transcription: string) => {
    const text = transcription.toLowerCase()
    if (text.includes('plumb')) return { category: 'Plumbing', icon: '🔧' }
    if (text.includes('electric')) return { category: 'Electrical', icon: '⚡' }
    if (text.includes('clean')) return { category: 'Cleaning', icon: '🧹' }
    if (text.includes('garden')) return { category: 'Gardening', icon: '🌱' }
    if (text.includes('cook')) return { category: 'Cooking', icon: '👨‍🍳' }
    if (text.includes('drive')) return { category: 'Driving', icon: '🚗' }
    if (text.includes('repair')) return { category: 'Repairs', icon: '🔨' }
    if (text.includes('paint')) return { category: 'Painting', icon: '🎨' }
    if (text.includes('teach')) return { category: 'Teaching', icon: '📚' }
    if (text.includes('design')) return { category: 'Design', icon: '✨' }
    return { category: 'General Services', icon: '⚒️' }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">💼 Hire Workers</h1>
            <p className="text-gray-600">Skilled Caribbean professionals available for hire</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">All profiles are verified</span>
            </div>
          </div>

          {/* Workers Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {workers.map((worker) => {
              const { category, icon } = getWorkerCategory(worker.transcription)
              
              return (
                <div key={worker.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg">{icon}</span>
                        <p className="text-sm font-medium text-gray-700">{category}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(worker.created_at)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {worker.title}
                  </h3>

                  {/* Transcription */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    "{worker.transcription}"
                  </p>

                  {/* Rating placeholder */}
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">New worker</span>
                  </div>

                  {/* Location */}
                  {worker.location && (
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{worker.location}</span>
                    </div>
                  )}

                  {/* Contact Button */}
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Hire Worker
                  </button>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {workers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Wrench className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No workers available right now
              </h3>
              <p className="text-gray-500 mb-4">
                Check back soon for skilled professionals!
              </p>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                Post a job to attract workers
              </Link>
            </div>
          )}

          {/* Safety Notice */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Hiring Safely</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check worker profiles and reviews</li>
                  <li>• Agree on price before starting work</li>
                  <li>• Meet in person for local jobs</li>
                  <li>• Report any issues to support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}