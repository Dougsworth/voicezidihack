import { useState } from 'react'
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  DollarSign,
  User,
  Briefcase,
  Wrench,
  Badge as BadgeIcon,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { VoiceJob } from '@/types'

interface JobCardProps {
  job: VoiceJob
  onClick?: () => void
  type: 'job_posting' | 'work_request'
}

export function JobCard({ job, onClick, type }: JobCardProps) {
  const [showFullText, setShowFullText] = useState(false)
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const formatPhoneNumber = (phone: string | null) => {
    if (!phone || phone === 'web_user') return 'Web User'
    if (phone.length === 11 && phone.startsWith('1')) {
      const number = phone.substring(1)
      return `+1 (${number.substring(0,3)}) ${number.substring(3,6)}-${number.substring(6)}`
    }
    return phone
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const extractJobDetails = (transcription: string) => {
    const text = transcription.toLowerCase()
    
    // Extract location
    const locationMatch = transcription.match(/(?:in|at|near|from)\s+([A-Z][a-zA-Z\s,]+?)(?:\.|,|\s+(?:on|at|\d))/i)
    const location = locationMatch ? locationMatch[1].trim() : null
    
    // Extract time/schedule
    const timeMatch = transcription.match(/(?:at|on|by)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.))/i) ||
                     transcription.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i) ||
                     transcription.match(/(today|tomorrow|this week|next week)/i)
    const timing = timeMatch ? timeMatch[1] || timeMatch[0] : null
    
    // Extract budget
    const budgetMatch = transcription.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|jmd|usd)?/i)
    const budget = budgetMatch ? `$${budgetMatch[1]}` : null
    
    // Extract job type/skill
    const skillMatch = transcription.match(/(?:need|want|looking for|seeking)\s+(?:a|an|some)?\s*([a-zA-Z\s]+?)(?:\s+(?:to|for|in|at))/i) ||
                      transcription.match(/(?:i (?:am|do)|my skill is|experienced in)\s+([a-zA-Z\s]+)/i)
    const skill = skillMatch ? skillMatch[1].trim().split(/\s+/).slice(0, 2).join(' ') : null
    
    return { location, timing, budget, skill }
  }

  const details = extractJobDetails(job.transcription || '')
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            type === 'job_posting' 
              ? 'bg-blue-50 text-blue-600' 
              : 'bg-emerald-50 text-emerald-600'
          }`}>
            {type === 'job_posting' ? (
              <Briefcase className="w-4 h-4" />
            ) : (
              <Wrench className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">
              {type === 'job_posting' ? '🔍 Job Posting' : '👷 Worker Available'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">{formatTimeAgo(job.created_at)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {job.status === 'completed' && (
            <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5">
              ✓ Transcribed
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Transcription */}
      {job.transcription ? (
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 text-sm leading-relaxed">
              "{showFullText ? job.transcription : truncateText(job.transcription, 100)}"
              {job.transcription.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowFullText(!showFullText)
                  }}
                  className="ml-2 text-teal-600 hover:text-teal-700 text-xs font-medium"
                >
                  {showFullText ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2">
          <VolumeX className="w-4 h-4 text-gray-300" />
          <span className="text-gray-400 text-sm italic">Processing transcription...</span>
        </div>
      )}

      {/* Key Details */}
      <div className="space-y-2 mb-4">
        {details.skill && (
          <div className="flex items-center gap-2">
            <BadgeIcon className="w-3 h-3 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {details.skill}
            </span>
          </div>
        )}
        
        {details.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-red-500" />
            <span className="text-sm text-gray-600">{details.location}</span>
          </div>
        )}
        
        {details.timing && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-sm text-gray-600">{details.timing}</span>
          </div>
        )}
        
        {details.budget && (
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-green-500" />
            <span className="text-sm font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
              {details.budget}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {formatPhoneNumber(job.caller_phone)}
          </span>
        </div>
        
        <Button 
          size="sm" 
          variant="ghost"
          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 h-7"
          onClick={(e) => {
            e.stopPropagation()
            // Handle contact action
          }}
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  )
}