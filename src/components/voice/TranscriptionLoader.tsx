import { useState, useEffect } from 'react'
import { Loader2, Brain, Mic, CheckCircle2, AlertCircle } from 'lucide-react'

interface TranscriptionLoaderProps {
  isLoading: boolean
  stage?: 'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error'
  error?: string
}

export default function TranscriptionLoader({ 
  isLoading, 
  stage = 'uploading',
  error 
}: TranscriptionLoaderProps) {
  const [timer, setTimer] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setTimer(0)
      setProgress(0)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      setTimer(elapsed)
      
      // Simulate progress based on stage and time
      let targetProgress = 0
      switch (stage) {
        case 'uploading':
          targetProgress = Math.min(20, elapsed * 10)
          break
        case 'transcribing':
          targetProgress = 20 + Math.min(50, elapsed * 8)
          break
        case 'analyzing':
          targetProgress = 70 + Math.min(25, elapsed * 12)
          break
        case 'complete':
          targetProgress = 100
          break
      }
      
      setProgress(targetProgress)
    }, 100)

    return () => clearInterval(interval)
  }, [isLoading, stage])

  if (!isLoading && !error) return null

  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          icon: <Mic className="w-5 h-5" />,
          text: 'Uploading voice note...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
      case 'transcribing':
        return {
          icon: <Brain className="w-5 h-5" />,
          text: 'Caribbean ASR processing...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50'
        }
      case 'analyzing':
        return {
          icon: <Brain className="w-5 h-5 animate-pulse" />,
          text: 'AI analyzing and extracting details...',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'complete':
        return {
          icon: <CheckCircle2 className="w-5 h-5" />,
          text: 'Analysis complete!',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          text: error || 'Something went wrong',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        }
    }
  }

  const stageInfo = getStageInfo()

  return (
    <div className={`${stageInfo.bgColor} border-2 ${stageInfo.color.replace('text-', 'border-').replace('600', '200')} rounded-xl p-6 max-w-md mx-auto text-center`}>
      {/* Icon and Stage Text */}
      <div className={`${stageInfo.color} flex items-center justify-center gap-3 mb-4`}>
        {stageInfo.icon}
        <span className="font-medium">{stageInfo.text}</span>
      </div>

      {/* Progress Bar */}
      {stage !== 'error' && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className={`${stageInfo.color.replace('text-', 'bg-')} h-2.5 rounded-full transition-all duration-300`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{Math.round(progress)}%</span>
            <span>{timer.toFixed(1)}s</span>
          </div>
        </div>
      )}

      {/* Stage-specific details */}
      {stage === 'transcribing' && (
        <div className="text-sm text-gray-600 mb-2 space-y-1">
          <p>• Detecting Caribbean accent patterns</p>
          <p>• Processing speech quality</p>
        </div>
      )}

      {stage === 'analyzing' && (
        <div className="text-sm text-gray-600 mb-2 space-y-1">
          <p>• Extracting job information</p>
          <p>• Identifying skills and urgency</p>
        </div>
      )}

      {/* Tips while waiting */}
      {timer > 5 && stage !== 'error' && stage !== 'complete' && (
        <div className="text-xs text-gray-500 italic mt-2">
          {timer < 15 ? 
            "Caribbean ASR takes a moment for accurate analysis..." :
            "Processing complex speech patterns, almost done..."
          }
        </div>
      )}

      {/* Error retry hint */}
      {stage === 'error' && (
        <div className="text-sm text-gray-600 mt-2">
          <p>Using demo transcription instead.</p>
          <p className="text-xs">Try again or check your connection.</p>
        </div>
      )}
    </div>
  )
}