import { useState, useEffect } from 'react'
import { X, MessageCircle, Clock, MapPin, DollarSign, Phone, Calendar, User } from 'lucide-react'
import type { VoiceJob } from '@/types'
import { IntelligentExtractionService, type ExtractedJobDetails } from '@/services/intelligentExtractionService'

interface JobDetailModalProps {
  job: VoiceJob | null
  onClose: () => void
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  const [extractedDetails, setExtractedDetails] = useState<ExtractedJobDetails | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  
  // Use pre-extracted details from database or extract on demand if missing
  useEffect(() => {
    if (!job) return
    
    // Check if we have pre-extracted details in the database
    if (job.extraction_completed && (job.extracted_location || job.extracted_budget || job.extracted_skill || job.extracted_timing)) {
      setExtractedDetails({
        location: job.extracted_location || null,
        budget: job.extracted_budget || null,
        skill: job.extracted_skill || null,
        timing: job.extracted_timing || null,
        description: job.extracted_description || job.transcription || null
      })
      setIsExtracting(false)
      console.log('✅ Using pre-extracted details from database')
    } else if (job.transcription) {
      // Fallback: extract on demand
      setIsExtracting(true)
      IntelligentExtractionService.extractJobDetails(job.transcription)
        .then(details => {
          setExtractedDetails(details)
          setIsExtracting(false)
          console.log('✅ Extracted details on demand')
        })
        .catch(error => {
          console.error('Failed to extract details:', error)
          setIsExtracting(false)
        })
    }
  }, [job])
  
  if (!job) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
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
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {isWorker ? 'Worker Available' : 'Job Posting'}
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(job.created_at)}</span>
          </div>
          
          {job.status === 'completed' && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
              Transcribed
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <div className="p-6">
            {/* Voice Note Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Voice Note</h3>
              {job.transcription ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-gray-900 leading-relaxed">{job.transcription}</p>
                </div>
              ) : (
                <p className="text-gray-400 italic">Transcription pending...</p>
              )}
            </div>

            {/* Details Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Details</h3>
              
              <div className="space-y-2">
                {/* Contact Method */}
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Posted via</p>
                    <p className="text-sm font-medium text-gray-900">{job.caller_phone === 'web_user' ? 'Web' : 'Phone'}</p>
                  </div>
                </div>
                
                {/* Location */}
                {extractedDetails?.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="text-sm font-medium text-gray-900">{extractedDetails.location}</p>
                    </div>
                  </div>
                )}
                
                {/* Budget */}
                {extractedDetails?.budget && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="text-sm font-medium text-gray-900">{extractedDetails.budget}</p>
                    </div>
                  </div>
                )}
                
                {/* Service Type */}
                {extractedDetails?.skill && (
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 text-gray-400 mt-0.5 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="text-sm font-medium text-gray-900">{extractedDetails.skill}</p>
                    </div>
                  </div>
                )}
                
                {/* Timing */}
                {extractedDetails?.timing && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">When</p>
                      <p className="text-sm font-medium text-gray-900">{extractedDetails.timing}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recording ID */}
            {job.recording_sid && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Recording ID</h3>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {job.recording_sid}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {job.caller_phone !== 'web_user' ? (
            <div className="space-y-3">
              <a 
                href={`https://wa.me/${job.caller_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 px-4 rounded-md font-medium transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Contact via WhatsApp
              </a>
              
              <a 
                href={`tel:${job.caller_phone}`}
                className="flex items-center justify-center gap-2 w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2.5 px-4 rounded-md font-medium transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                Call {formatPhoneNumber(job.caller_phone)}
              </a>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Posted via web - no contact info available
            </p>
          )}
          
          <p className="mt-4 text-xs text-gray-500 text-center">
            Tip: Meet in public places and agree on payment upfront.
          </p>
        </div>
      </div>
    </div>
  )
}

