import { useState, useRef } from 'react'
import { Mic, Square, Play, Pause, Upload } from 'lucide-react'
import { Button } from './ui/button'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  isProcessing?: boolean
}

export default function VoiceRecorder({ onRecordingComplete, isProcessing = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })
        setAudioBlob(blob)
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playAudio = () => {
    if (audioBlob) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      
      const audioUrl = URL.createObjectURL(audioBlob)
      audioRef.current = new Audio(audioUrl)
      
      audioRef.current.onended = () => setIsPlaying(false)
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const submitRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob)
      setAudioBlob(null)
      setRecordingTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white border-2 border-teal-200 rounded-xl p-6 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
        Record Your Voice Note
      </h3>
      
      {/* Recording Button */}
      <div className="text-center mb-4">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full w-20 h-20"
            disabled={isProcessing}
          >
            <Mic className="w-8 h-8" />
          </Button>
        )}
        
        {isRecording && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-20 h-20"
            >
              <Square className="w-8 h-8" />
            </Button>
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls */}
      {audioBlob && !isRecording && (
        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              onClick={isPlaying ? pauseAudio : playAudio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button
              onClick={() => { setAudioBlob(null); setRecordingTime(0) }}
              variant="outline"
              size="sm"
            >
              Record Again
            </Button>
          </div>
          
          <Button
            onClick={submitRecording}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Post This Job
              </div>
            )}
          </Button>
        </div>
      )}
      
      <p className="text-sm text-gray-600 mt-4 text-center">
        {!audioBlob ? 
          "Describe the job you need done or the work you're offering" :
          "Listen to your recording, then submit to post your gig"
        }
      </p>
    </div>
  )
}