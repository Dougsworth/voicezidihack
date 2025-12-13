import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, Volume2, Mic, Clock, FileText } from 'lucide-react'
import { VoiceQualityService, type VoiceQualityResult } from '@/services/voiceQualityService'
import { AccentDetectionService, type AccentDetectionResult } from '@/services/accentDetectionService'
import { CARIBBEAN_COLORS } from '@/constants'

interface VoiceQualityIndicatorProps {
  audioBlob?: Blob
  transcription?: string
  duration?: number
  isRecording?: boolean
  showFeedback?: boolean
}

export default function VoiceQualityIndicator({ 
  audioBlob, 
  transcription, 
  duration = 0,
  isRecording = false,
  showFeedback = true
}: VoiceQualityIndicatorProps) {
  const [qualityResult, setQualityResult] = useState<VoiceQualityResult | null>(null)
  const [accentResult, setAccentResult] = useState<AccentDetectionResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (audioBlob && transcription && showFeedback) {
      analyzeQuality()
    }
  }, [audioBlob, transcription, showFeedback])

  const analyzeQuality = async () => {
    if (!transcription) return
    
    setIsAnalyzing(true)
    
    try {
      // Analyze voice quality (now async with GPT)
      let quality: VoiceQualityResult
      if (audioBlob) {
        quality = await VoiceQualityService.analyzeAudioQuality(audioBlob)
      } else {
        quality = await VoiceQualityService.analyzeTranscriptionQuality(transcription, duration)
      }
      
      // Analyze accent (now async with GPT)
      const accent = await AccentDetectionService.detectAccent(transcription)
      
      setQualityResult(quality)
      setAccentResult(accent)
      
      // Log for demo purposes
      console.log('[VOICE QUALITY] Score:', quality.overallScore)
      console.log('[ACCENT DETECTION]', AccentDetectionService.getAccentDescription(accent))
      
    } catch (error) {
      console.error('Quality analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return CARIBBEAN_COLORS.success[500]
    if (score >= 60) return CARIBBEAN_COLORS.warning[500]
    return CARIBBEAN_COLORS.error[500]
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle
    if (score >= 60) return AlertCircle
    return AlertCircle
  }

  const getAccentFlag = (accent: AccentDetectionResult['accent']) => {
    switch (accent) {
      case 'jamaican': return '🇯🇲'
      case 'trinidadian': return '🇹🇹'
      case 'barbadian': return '🇧🇧'
      case 'guyanese': return '🇬🇾'
      case 'general_caribbean': return '🌴'
      default: return '🌍'
    }
  }

  if (isRecording) {
    return (
      <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: CARIBBEAN_COLORS.primary[200] }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center animate-pulse" 
               style={{ backgroundColor: CARIBBEAN_COLORS.error[500] }}>
            <Mic className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: CARIBBEAN_COLORS.primary[800] }}>Recording...</h3>
            <p className="text-sm text-gray-600">Speak clearly for best quality</p>
          </div>
        </div>
        
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3" />
            <span>Maintain steady volume</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>Aim for 10-30 seconds</span>
          </div>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: CARIBBEAN_COLORS.primary[200] }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center animate-spin" 
               style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}>
            <Info className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: CARIBBEAN_COLORS.primary[800] }}>Analyzing Quality...</h3>
            <p className="text-sm text-gray-600">Checking accent and voice quality</p>
          </div>
        </div>
      </div>
    )
  }

  if (!qualityResult || !accentResult || !showFeedback) {
    return null
  }

  const ScoreIcon = getScoreIcon(qualityResult.overallScore)

  return (
    <div className="space-y-4">
      {/* Overall Quality Score */}
      <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: CARIBBEAN_COLORS.primary[200] }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" 
               style={{ backgroundColor: getScoreColor(qualityResult.overallScore) }}>
            <ScoreIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium" style={{ color: CARIBBEAN_COLORS.primary[800] }}>
              Voice Quality Score: {qualityResult.overallScore}/100
            </h3>
            <p className="text-sm text-gray-600">
              {qualityResult.overallScore >= 80 ? 'Excellent quality!' : 
               qualityResult.overallScore >= 60 ? 'Good quality' : 'Needs improvement'}
            </p>
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 rounded" style={{ backgroundColor: CARIBBEAN_COLORS.primary[50] }}>
            <div className="text-lg font-bold" style={{ color: getScoreColor(qualityResult.clarity) }}>
              {qualityResult.clarity}
            </div>
            <div className="text-xs text-gray-600">Clarity</div>
          </div>
          <div className="text-center p-2 rounded" style={{ backgroundColor: CARIBBEAN_COLORS.primary[50] }}>
            <div className="text-lg font-bold" style={{ color: getScoreColor(qualityResult.volume) }}>
              {qualityResult.volume}
            </div>
            <div className="text-xs text-gray-600">Volume</div>
          </div>
          <div className="text-center p-2 rounded" style={{ backgroundColor: CARIBBEAN_COLORS.primary[50] }}>
            <div className="text-lg font-bold" style={{ color: getScoreColor(qualityResult.pacing) }}>
              {qualityResult.pacing}
            </div>
            <div className="text-xs text-gray-600">Pacing</div>
          </div>
          <div className="text-center p-2 rounded" style={{ backgroundColor: CARIBBEAN_COLORS.primary[50] }}>
            <div className="text-lg font-bold" style={{ color: getScoreColor(qualityResult.completeness) }}>
              {qualityResult.completeness}
            </div>
            <div className="text-xs text-gray-600">Detail</div>
          </div>
        </div>

        {/* Strengths */}
        {qualityResult.strengths.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Strengths:</h4>
            <div className="flex flex-wrap gap-1">
              {qualityResult.strengths.map((strength, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: CARIBBEAN_COLORS.success[100], 
                    color: CARIBBEAN_COLORS.success[700] 
                  }}
                >
                  ✓ {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {qualityResult.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
            <div className="space-y-1">
              {qualityResult.recommendations.map((rec, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-yellow-500">💡</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Accent Detection */}
      <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: CARIBBEAN_COLORS.secondary[200] }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">{getAccentFlag(accentResult.accent)}</div>
          <div>
            <h3 className="font-medium" style={{ color: CARIBBEAN_COLORS.secondary[800] }}>
              Caribbean Dialect Analysis
            </h3>
            <p className="text-sm text-gray-600">
              {AccentDetectionService.getAccentDescription(accentResult)}
            </p>
          </div>
        </div>

        {/* Patois Level */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">Patois Level:</span>
            <span className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: accentResult.patoisLevel === 'heavy' ? CARIBBEAN_COLORS.primary[100] : 
                                   accentResult.patoisLevel === 'moderate' ? CARIBBEAN_COLORS.warning[100] :
                                   accentResult.patoisLevel === 'light' ? CARIBBEAN_COLORS.success[100] :
                                   CARIBBEAN_COLORS.neutral[100],
                    color: accentResult.patoisLevel === 'heavy' ? CARIBBEAN_COLORS.primary[700] : 
                           accentResult.patoisLevel === 'moderate' ? CARIBBEAN_COLORS.warning[700] :
                           accentResult.patoisLevel === 'light' ? CARIBBEAN_COLORS.success[700] :
                           CARIBBEAN_COLORS.neutral[700]
                  }}>
              {accentResult.patoisLevel.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-600">
            {AccentDetectionService.getPatoisDescription(accentResult.patoisLevel)}
          </p>
        </div>

        {/* Island Probability (if interesting) */}
        {accentResult.confidence > 0.3 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Regional Analysis:</h4>
            <div className="space-y-1">
              {Object.entries(accentResult.islandProbability)
                .filter(([_, prob]) => prob > 0.1)
                .sort(([_, a], [__, b]) => b - a)
                .slice(0, 3)
                .map(([island, probability]) => (
                <div key={island} className="flex justify-between items-center text-xs">
                  <span className="capitalize text-gray-600">{island.replace('_', ' ')}</span>
                  <span className="font-medium" style={{ color: CARIBBEAN_COLORS.secondary[600] }}>
                    {(probability * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Linguistic Analysis */}
        {accentResult.linguisticFeatures && accentResult.linguisticFeatures.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Linguistic Features:</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {accentResult.linguisticFeatures.map((feature, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{ 
                    backgroundColor: CARIBBEAN_COLORS.primary[100], 
                    color: CARIBBEAN_COLORS.primary[700] 
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cultural References */}
        {accentResult.culturalReferences && accentResult.culturalReferences.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Cultural Elements:</h4>
            <div className="text-xs text-gray-600">
              {accentResult.culturalReferences.join(' • ')}
            </div>
          </div>
        )}

        {/* Speech Patterns */}
        {accentResult.speechPatterns && accentResult.speechPatterns.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Speech Patterns:</h4>
            <div className="text-xs text-gray-600">
              {accentResult.speechPatterns.join(' • ')}
            </div>
          </div>
        )}

        {/* Dialect Variant */}
        {accentResult.dialectVariant && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Dialect Variant:</h4>
            <div className="text-xs font-medium" style={{ color: CARIBBEAN_COLORS.secondary[700] }}>
              {accentResult.dialectVariant}
            </div>
          </div>
        )}

        {/* Linguistic Insight */}
        {accentResult.recommendation && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Linguistic Insight:</h4>
            <div className="text-xs text-gray-600 italic">
              💡 {accentResult.recommendation}
            </div>
          </div>
        )}

        {/* Detected Terms (Fallback) */}
        {accentResult.indicators.length > 0 && !accentResult.recommendation && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Detected Terms:</h4>
            <div className="text-xs text-gray-600">
              {accentResult.indicators.join(' • ')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}