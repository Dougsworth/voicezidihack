// Real-time voice quality feedback and suggestions
import { AlertCircle, CheckCircle, Lightbulb, Volume2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Progress } from '../ui/progress'
import type { CaribbeanASRResult } from '@/lib/caribbean-asr-analysis'

interface VoiceQualityFeedbackProps {
  analysis: CaribbeanASRResult
  onImprove?: () => void
}

export default function VoiceQualityFeedback({ analysis, onImprove }: VoiceQualityFeedbackProps) {
  const qualityScore = calculateQualityScore(analysis)
  const suggestions = generateSuggestions(analysis)
  const missingInfo = detectMissingInfo(analysis)

  return (
    <div className="space-y-4">
      {/* Overall Quality Score */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-gray-900">Voice Quality Score</span>
          </div>
          <span className={`text-2xl font-bold ${
            qualityScore >= 80 ? 'text-green-600' :
            qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {qualityScore}%
          </span>
        </div>
        <Progress value={qualityScore} className="h-2" />
        <p className="text-sm text-gray-600 mt-2">
          {qualityScore >= 80 
            ? "Excellent! Your voice note is clear and complete."
            : qualityScore >= 60
            ? "Good, but could be improved for better matches."
            : "Consider re-recording with more details for best results."}
        </p>
      </div>

      {/* Missing Critical Information */}
      {missingInfo.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900">Missing Information</AlertTitle>
          <AlertDescription className="text-yellow-800">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {missingInfo.map((info, idx) => (
                <li key={idx}>{info}</li>
              ))}
            </ul>
            <button
              onClick={onImprove}
              className="mt-3 text-sm font-medium text-yellow-700 underline hover:text-yellow-900"
            >
              Re-record with these details →
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Smart Suggestions</AlertTitle>
          <AlertDescription className="text-blue-800">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* What We Understood */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-900">What We Understood</span>
        </div>
        <div className="space-y-2 text-sm">
          {analysis.jobExtraction.skills.length > 0 && (
            <div>
              <span className="font-medium text-green-800">Skills:</span>{' '}
              <span className="text-green-700">{analysis.jobExtraction.skills.join(', ')}</span>
            </div>
          )}
          {analysis.jobExtraction.location && (
            <div>
              <span className="font-medium text-green-800">Location:</span>{' '}
              <span className="text-green-700">{analysis.jobExtraction.location}</span>
            </div>
          )}
          {analysis.jobExtraction.budget.amount && (
            <div>
              <span className="font-medium text-green-800">Budget:</span>{' '}
              <span className="text-green-700">
                {analysis.jobExtraction.budget.amount.toLocaleString()} {analysis.jobExtraction.budget.currency}
                {analysis.jobExtraction.budget.type !== 'fixed' && ` (${analysis.jobExtraction.budget.type})`}
              </span>
            </div>
          )}
          {analysis.jobExtraction.urgency && (
            <div>
              <span className="font-medium text-green-800">Urgency:</span>{' '}
              <span className="text-green-700 capitalize">{analysis.jobExtraction.urgency}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function calculateQualityScore(analysis: CaribbeanASRResult): number {
  let score = 0

  // Clarity (30 points)
  const clarityScores = { excellent: 30, good: 25, fair: 15, poor: 5 }
  score += clarityScores[analysis.speechPatterns.clarity] || 0

  // Completeness (30 points)
  if (analysis.jobExtraction.skills.length > 0) score += 10
  if (analysis.jobExtraction.location) score += 10
  if (analysis.jobExtraction.budget.amount) score += 10

  // Job type clarity (20 points)
  if (analysis.jobExtraction.jobType !== 'unclear') score += 20

  // Length and detail (20 points)
  const wordCount = analysis.transcription.split(' ').length
  if (wordCount > 30) score += 10
  if (wordCount > 50) score += 10

  return Math.min(score, 100)
}

function generateSuggestions(analysis: CaribbeanASRResult): string[] {
  const suggestions: string[] = []

  // Missing budget
  if (!analysis.jobExtraction.budget.amount && analysis.jobExtraction.jobType === 'job_posting') {
    suggestions.push("Add your budget (e.g., '15,000 JMD') to attract more workers")
  }

  // Missing location
  if (!analysis.jobExtraction.location) {
    suggestions.push("Mention your location (e.g., 'Kingston' or 'Spanish Town') for better local matches")
  }

  // Too short
  if (analysis.transcription.split(' ').length < 15) {
    suggestions.push("Add more details about what you need or what you offer - longer descriptions get more responses")
  }

  // Low clarity
  if (analysis.speechPatterns.clarity === 'poor' || analysis.speechPatterns.clarity === 'fair') {
    suggestions.push("Speak more clearly and slowly - good audio quality helps workers understand your needs")
  }

  // Missing skills for work requests
  if (analysis.jobExtraction.jobType === 'work_request' && analysis.jobExtraction.skills.length === 0) {
    suggestions.push("Mention your specific skills (e.g., 'plumbing', 'cooking', 'driving') to match with the right jobs")
  }

  // Unclear job type
  if (analysis.jobExtraction.jobType === 'unclear') {
    suggestions.push("Be more specific - say 'I need someone to...' (for jobs) or 'I'm a...' (for services)")
  }

  return suggestions
}

function detectMissingInfo(analysis: CaribbeanASRResult): string[] {
  const missing: string[] = []

  if (analysis.jobExtraction.jobType === 'job_posting') {
    if (!analysis.jobExtraction.budget.amount) {
      missing.push("Budget amount")
    }
    if (!analysis.jobExtraction.location) {
      missing.push("Location")
    }
    if (analysis.jobExtraction.skills.length === 0) {
      missing.push("What type of work you need")
    }
  } else if (analysis.jobExtraction.jobType === 'work_request') {
    if (analysis.jobExtraction.skills.length === 0) {
      missing.push("Your skills or services")
    }
    if (!analysis.jobExtraction.location) {
      missing.push("Your location or service area")
    }
  }

  return missing
}

