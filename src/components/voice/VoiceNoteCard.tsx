// Enhanced gig card with voice playback and transcription
import { useState } from 'react'
import { Play, Pause, MessageCircle, MapPin, DollarSign, Clock, Volume2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import type { VoiceGig } from '@/lib/supabase'
import MatchExplanation from '../feedback/MatchExplanation'
import type { MatchScore } from '@/lib/matching'

interface VoiceNoteCardProps {
  gig: VoiceGig
  matchScore?: MatchScore
  currentGig?: VoiceGig
  onContact?: () => void
}

export default function VoiceNoteCard({ gig, matchScore, currentGig, onContact }: VoiceNoteCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTranscription, setShowTranscription] = useState(false)

  const handlePlay = () => {
    if (gig.voice_url) {
      const audio = new Audio(gig.voice_url)
      audio.play()
      setIsPlaying(true)
      audio.onended = () => setIsPlaying(false)
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all">
      {/* Header with Voice Playback */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {gig.voice_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              className="rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
          )}
          <div>
            <h3 className="font-bold text-lg text-gray-900">{gig.title}</h3>
            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(gig.created_at)}
            </span>
          </div>
        </div>
        {matchScore && (
          <Badge className="bg-teal-100 text-teal-700 border-teal-200">
            {Math.round(matchScore.score)}% match
          </Badge>
        )}
      </div>

      {/* Transcription Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowTranscription(!showTranscription)}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
        >
          <Volume2 className="w-4 h-4" />
          {showTranscription ? 'Hide' : 'Show'} transcription
        </button>
        {showTranscription && (
          <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-700 italic">"{gig.transcription}"</p>
          </div>
        )}
      </div>

      {/* Key Info */}
      <div className="space-y-2 mb-4">
        {gig.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{gig.location}</span>
          </div>
        )}
        {(gig.budget_min || gig.budget_max) && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">
              {gig.budget_min === gig.budget_max
                ? `${gig.budget_min?.toLocaleString()} ${gig.currency}`
                : `${gig.budget_min?.toLocaleString()} - ${gig.budget_max?.toLocaleString()} ${gig.currency}`}
            </span>
          </div>
        )}
        {gig.urgency && (
          <Badge className={`text-xs ${
            gig.urgency === 'high' ? 'bg-red-100 text-red-700' :
            gig.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {gig.urgency} urgency
          </Badge>
        )}
      </div>

      {/* Skills */}
      {gig.skills && gig.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gig.skills.slice(0, 4).map((skill, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {gig.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{gig.skills.length - 4} more
            </Badge>
          )}
        </div>
      )}

      {/* Match Explanation */}
      {matchScore && currentGig && (
        <MatchExplanation match={matchScore} currentGig={currentGig} />
      )}

      {/* Contact Button */}
      <Button
        onClick={onContact}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-4"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact via WhatsApp
      </Button>
    </div>
  )
}

