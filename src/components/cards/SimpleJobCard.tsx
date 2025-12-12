import { 
  Clock, 
  Briefcase,
  Wrench,
  ChevronRight,
  Volume2,
  VolumeX,
  User
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { VoiceJob } from '@/types'

interface SimpleJobCardProps {
  job: VoiceJob
  onClick?: () => void
  type: 'job_posting' | 'work_request'
}

export function SimpleJobCard({ job, onClick, type }: SimpleJobCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    // For very recent posts, show exact time
    if (seconds < 30) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    // For older posts, show the actual date/time
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
          <div className="flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 text-sm leading-relaxed">
              "{truncateText(job.transcription, 120)}"
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center gap-2">
          <VolumeX className="w-4 h-4 text-gray-300" />
          <span className="text-gray-400 text-sm italic">Processing transcription...</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">
            {formatPhoneNumber(job.caller_phone)}
          </span>
        </div>
        
        <span className="text-xs text-teal-600 font-medium group-hover:text-teal-700 transition-colors">
          View details
        </span>
      </div>
    </div>
  )
}