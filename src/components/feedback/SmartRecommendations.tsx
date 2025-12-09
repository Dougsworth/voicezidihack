// Smart recommendations component using ASR matching
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, type VoiceGig } from '@/lib/supabase'
import { matchWorkersToJobs, matchJobsToWorkers, findSimilarGigs } from '@/lib/matching'
import { Sparkles, TrendingUp, Users } from 'lucide-react'
import ASRInsights from './ASRInsights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'

interface SmartRecommendationsProps {
  currentGig?: VoiceGig
  type: 'for-workers' | 'for-posters' | 'similar'
}

export default function SmartRecommendations({ currentGig, type }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Array<{ gig: VoiceGig; score: number; reasons: string[] }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentGig) {
      setLoading(false)
      return
    }

    async function fetchRecommendations() {
      try {
        let query = supabase
          .from('voice_gigs')
          .select('*')
          .eq('status', 'active')
          .neq('id', currentGig.id)

        if (type === 'for-workers') {
          // For workers: find matching jobs
          query = query.eq('gig_type', 'job_posting')
        } else if (type === 'for-posters') {
          // For posters: find matching workers
          query = query.eq('gig_type', 'work_request')
        } else {
          // Similar gigs: same type
          query = query.eq('gig_type', currentGig.gig_type)
        }

        const { data, error } = await query.limit(20)

        if (error) throw error

        let matches: Array<{ gig: VoiceGig; score: number; reasons: string[] }> = []

        if (type === 'for-workers' && currentGig.gig_type === 'work_request') {
          // Worker looking for jobs
          matches = matchJobsToWorkers(data || [], currentGig)
        } else if (type === 'for-posters' && currentGig.gig_type === 'job_posting') {
          // Poster looking for workers
          matches = matchWorkersToJobs(data || [], currentGig)
        } else if (type === 'similar') {
          // Similar gigs
          matches = findSimilarGigs(currentGig, data || [], 5)
        }

        setRecommendations(matches.slice(0, 5))
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentGig, type])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          {type === 'for-workers' && 'Jobs Matching Your Skills'}
          {type === 'for-posters' && 'Workers Matching Your Job'}
          {type === 'similar' && 'Similar Opportunities'}
        </CardTitle>
        <CardDescription>
          Powered by Caribbean ASR analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Link
              key={rec.gig.id}
              to={rec.gig.gig_type === 'job_posting' ? '/find-work' : '/hire-workers'}
              className="block p-4 border rounded-lg hover:border-teal-300 hover:bg-teal-50/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{rec.gig.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    "{rec.gig.transcription}"
                  </p>
                </div>
                <Badge className="ml-2 bg-teal-100 text-teal-700 border-teal-200">
                  {Math.round(rec.score)}% match
                </Badge>
              </div>
              
              {/* Match Reasons */}
              {rec.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {rec.reasons.slice(0, 3).map((reason, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Compact ASR Insights */}
              <ASRInsights gig={rec.gig} compact={true} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

