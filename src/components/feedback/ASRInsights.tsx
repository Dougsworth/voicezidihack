// Component to display ASR insights on gig cards
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  Award, 
  Volume2, 
  Globe,
  Sparkles
} from 'lucide-react'
import type { VoiceGig } from '@/lib/supabase'

interface ASRInsightsProps {
  gig: VoiceGig
  compact?: boolean
}

const ACCENT_EMOJIS: Record<string, string> = {
  jamaican: '🇯🇲',
  trinidadian: '🇹🇹',
  barbadian: '🇧🇧',
  guyanese: '🇬🇾',
  general_caribbean: '🏝️'
}

const URGENCY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200'
}

const EXPERIENCE_COLORS = {
  expert: 'bg-purple-100 text-purple-700 border-purple-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  beginner: 'bg-gray-100 text-gray-700 border-gray-200',
  unclear: 'bg-gray-100 text-gray-500 border-gray-200'
}

const CLARITY_COLORS = {
  excellent: 'text-green-600',
  good: 'text-blue-600',
  fair: 'text-yellow-600',
  poor: 'text-red-600'
}

export default function ASRInsights({ gig, compact = false }: ASRInsightsProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {/* Accent Badge */}
        {gig.accent_primary && (
          <Badge variant="outline" className="text-xs">
            {ACCENT_EMOJIS[gig.accent_primary] || '🏝️'} {gig.accent_primary.replace('_', ' ')}
          </Badge>
        )}
        
        {/* Urgency Badge */}
        {gig.urgency && (
          <Badge className={`text-xs ${URGENCY_COLORS[gig.urgency]}`}>
            <Clock className="w-3 h-3 mr-1" />
            {gig.urgency}
          </Badge>
        )}
        
        {/* Skills */}
        {gig.skills && gig.skills.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {gig.skills.slice(0, 2).join(', ')}
            {gig.skills.length > 2 && ` +${gig.skills.length - 2}`}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Sparkles className="w-4 h-4 text-teal-600" />
        <span>ASR Insights</span>
        {gig.asr_confidence && (
          <span className="text-xs text-gray-500 ml-auto">
            {Math.round(gig.asr_confidence * 100)}% confidence
          </span>
        )}
      </div>

      {/* Skills */}
      {gig.skills && gig.skills.length > 0 && (
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1.5">Skills Detected</div>
          <div className="flex flex-wrap gap-1.5">
            {gig.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Accent */}
        {gig.accent_primary && (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {ACCENT_EMOJIS[gig.accent_primary] || '🏝️'} {gig.accent_primary.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {gig.accent_confidence && (
              <span className="text-xs text-gray-400 ml-auto">
                {Math.round(gig.accent_confidence * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {gig.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{gig.location}</span>
          </div>
        )}

        {/* Urgency */}
        {gig.urgency && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <Badge className={`text-xs ${URGENCY_COLORS[gig.urgency]}`}>
              {gig.urgency} urgency
            </Badge>
          </div>
        )}

        {/* Experience Level */}
        {gig.experience_level && gig.experience_level !== 'unclear' && (
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gray-400" />
            <Badge className={`text-xs ${EXPERIENCE_COLORS[gig.experience_level]}`}>
              {gig.experience_level}
            </Badge>
          </div>
        )}

        {/* Speech Clarity */}
        {gig.speech_clarity && (
          <div className="flex items-center gap-2">
            <Volume2 className={`w-4 h-4 ${CLARITY_COLORS[gig.speech_clarity]}`} />
            <span className={`text-xs ${CLARITY_COLORS[gig.speech_clarity]}`}>
              {gig.speech_clarity} clarity
            </span>
          </div>
        )}

        {/* Speech Pace */}
        {gig.speech_pace && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600">{gig.speech_pace} pace</span>
          </div>
        )}
      </div>

      {/* Caribbean Context */}
      {(gig.local_terms && gig.local_terms.length > 0) || 
       (gig.cultural_references && gig.cultural_references.length > 0) && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-600 mb-1.5">Caribbean Context</div>
          <div className="flex flex-wrap gap-1.5">
            {gig.local_terms?.slice(0, 3).map((term, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {term}
              </Badge>
            ))}
            {gig.cultural_references?.slice(0, 2).map((ref, idx) => (
              <Badge key={`ref-${idx}`} variant="outline" className="text-xs">
                {ref}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

