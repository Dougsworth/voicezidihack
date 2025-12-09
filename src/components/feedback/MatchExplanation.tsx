// Explain WHY gigs match based on ASR insights
import { CheckCircle, TrendingUp, MapPin, Award, DollarSign } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { VoiceGig } from '@/lib/supabase'
import type { MatchScore } from '@/lib/matching'

interface MatchExplanationProps {
  match: MatchScore
  currentGig: VoiceGig
}

export default function MatchExplanation({ match, currentGig }: MatchExplanationProps) {
  const reasons = categorizeReasons(match.reasons, match.gig, currentGig)

  if (reasons.length === 0) return null

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-teal-600" />
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(match.score)}% Match - Why This Works
        </span>
      </div>
      
      <div className="space-y-2">
        {reasons.map((reason, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{reason}</span>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-teal-200">
        {match.gig.location && currentGig.location && match.gig.location === currentGig.location && (
          <div className="text-center">
            <MapPin className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Same Location</div>
          </div>
        )}
        {match.gig.skills && currentGig.skills && 
         match.gig.skills.some(s => currentGig.skills?.includes(s)) && (
          <div className="text-center">
            <Award className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Skills Match</div>
          </div>
        )}
        {match.gig.budget_min && currentGig.budget_min && (
          <div className="text-center">
            <DollarSign className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs text-gray-600">Budget Fit</div>
          </div>
        )}
      </div>
    </div>
  )
}

function categorizeReasons(reasons: string[], matchedGig: VoiceGig, currentGig: VoiceGig): string[] {
  const categorized: string[] = []

  // Skill matches
  const skillReasons = reasons.filter(r => r.includes('skill'))
  if (skillReasons.length > 0) {
    const matchingSkills = matchedGig.skills?.filter(skill =>
      currentGig.skills?.some(cs => 
        cs.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(cs.toLowerCase())
      )
    ) || []
    if (matchingSkills.length > 0) {
      categorized.push(`Both mention: ${matchingSkills.slice(0, 2).join(', ')}`)
    }
  }

  // Location matches
  if (reasons.some(r => r.includes('location') || r.includes('Same location'))) {
    categorized.push(`Both in ${matchedGig.location} - easy to meet in person`)
  }

  // Experience matches
  const expReason = reasons.find(r => r.includes('experience'))
  if (expReason) {
    categorized.push(expReason)
  }

  // Budget compatibility
  if (reasons.some(r => r.includes('Budget'))) {
    categorized.push('Budget expectations align')
  }

  // Accent matches
  if (reasons.some(r => r.includes('accent'))) {
    categorized.push('Same Caribbean accent - easier communication')
  }

  // Urgency
  if (matchedGig.urgency === 'high' && reasons.some(r => r.includes('urgent'))) {
    categorized.push('Both need quick action')
  }

  return categorized
}

