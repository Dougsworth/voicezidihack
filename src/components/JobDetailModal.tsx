import { X, MessageCircle, Clock, Briefcase, Wrench, User } from 'lucide-react'
import type { VoiceJob } from '@/types'

interface JobDetailModalProps {
  job: VoiceJob | null
  onClose: () => void
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  if (!job) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone === 'web_user') return 'Posted via Web'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      const number = cleaned.substring(1)
      return `+1 (${number.substring(0,3)}) ${number.substring(3,6)}-${number.substring(6)}`
    }
    return phone
  }

  const isWorker = job.gig_type === 'work_request'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 ${isWorker ? 'bg-green-50' : 'bg-blue-50'} rounded-t-2xl`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl ${isWorker ? 'bg-green-100' : 'bg-blue-100'}`}>
              {isWorker ? (
                <Wrench className={`w-6 h-6 ${isWorker ? 'text-green-600' : 'text-blue-600'}`} />
              ) : (
                <Briefcase className={`w-6 h-6 ${isWorker ? 'text-green-600' : 'text-blue-600'}`} />
              )}
            </div>
            <div>
              <span className={`text-sm font-medium ${isWorker ? 'text-green-700' : 'text-blue-700'}`}>
                {isWorker ? '👷 Worker Available' : '🔍 Job Posting'}
              </span>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Clock className="w-4 h-4" />
                {formatDate(job.created_at)}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {job.status === 'completed' ? '✓ Transcribed' : '⏳ Processing'}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Transcription */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Voice Note</h3>
            {job.transcription ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">"{job.transcription}"</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Transcription pending...</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{formatPhoneNumber(job.caller_phone)}</span>
            </div>
          </div>

          {/* Recording Info */}
          {job.recording_sid && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Recording ID</h3>
              <p className="text-gray-500 text-sm font-mono bg-gray-50 p-3 rounded-xl truncate">
                {job.recording_sid}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {job.caller_phone !== 'web_user' && (
              <a 
                href={`https://wa.me/${job.caller_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Contact via WhatsApp
              </a>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Tip:</strong> {isWorker 
                ? 'Discuss rates and availability before hiring.' 
                : 'Meet in public places and agree on payment upfront.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

