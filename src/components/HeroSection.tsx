import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceRecorder from "@/components/VoiceRecorder";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { transcribeAndAnalyzeCaribbean, moderateContent, checkRateLimit } from "@/lib/transcribe";
import type { CaribbeanASRResult } from "@/lib/caribbean-asr-analysis";

const HeroSection = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastAnalysis, setLastAnalysis] = useState<CaribbeanASRResult | null>(null)
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalWorkers: 0,
    activeGigs: 0
  })
  
  const whatsappNumber = "18765551465"; // Replace with your actual WhatsApp number
  const whatsappMessage = "Hi! I'd like to post a job or find work through voice note.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  const caribbeanFlags = ["🇯🇲", "🇹🇹", "🇧🇧", "🇬🇾", "🇧🇸", "🇧🇿", "🇦🇬", "🇱🇨", "🇬🇩", "🇻🇨", "🇩🇲", "🇰🇳"];

  // Fetch real stats from database
  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('voice_gigs')
          .select('gig_type, status')
        
        if (error) throw error

        const totalJobs = data.filter(g => g.gig_type === 'job_posting').length
        const totalWorkers = data.filter(g => g.gig_type === 'work_request').length
        const activeGigs = data.filter(g => g.status === 'active').length

        setStats({ totalJobs, totalWorkers, activeGigs })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep default stats if error
      }
    }
    
    fetchStats()
  }, [])

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    
    try {
      // Basic rate limiting using IP/user agent as identifier
      const userIdentifier = navigator.userAgent + window.location.hostname
      if (!checkRateLimit(userIdentifier, 5, 15)) {
        throw new Error('Too many requests. Please wait 15 minutes before posting again.')
      }

      // Advanced Caribbean ASR analysis
      const analysis = await transcribeAndAnalyzeCaribbean(audioBlob)
      
      // Content moderation
      const moderation = moderateContent(analysis.transcription)
      if (!moderation.safe) {
        throw new Error(`Content rejected: ${moderation.reason}`)
      }
      
      // Use Caribbean-aware extraction
      const gigType = analysis.jobExtraction.jobType !== 'unclear' 
        ? analysis.jobExtraction.jobType 
        : 'job_posting' // fallback
      const budget = {
        min: analysis.jobExtraction.budget.amount,
        max: analysis.jobExtraction.budget.amount,
        currency: analysis.jobExtraction.budget.currency
      }
      const title = analysis.jobExtraction.skills.length > 0
        ? `${analysis.jobExtraction.skills[0]} - ${analysis.accent.primary} speaker`
        : analysis.transcription.substring(0, 50) + '...'

      console.log('🎯 Caribbean ASR insights:', {
        accent: analysis.accent.primary,
        confidence: analysis.confidence,
        skills: analysis.jobExtraction.skills,
        urgency: analysis.jobExtraction.urgency,
        formality: analysis.speechPatterns.formality
      })

      // Store analysis for display
      setLastAnalysis(analysis)
      
      // Save to Supabase with Caribbean insights
      const { data, error } = await supabase
        .from('voice_gigs')
        .insert({
          transcription: analysis.transcription,
          gig_type: gigType,
          title,
          description: analysis.transcription,
          budget_min: budget.min,
          budget_max: budget.max,
          currency: budget.currency || analysis.jobExtraction.budget.currency,
          status: 'active',
          contact_method: 'whatsapp',
          processed_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log('Job posted successfully:', data)
      setShowSuccess(true)
      
      // Update stats to reflect new job
      setStats(prev => ({
        ...prev,
        totalJobs: prev.totalJobs + (gigType === 'job_posting' ? 1 : 0),
        totalWorkers: prev.totalWorkers + (gigType === 'work_request' ? 1 : 0),
        activeGigs: prev.activeGigs + 1
      }))
      
      // Reset after 5 seconds to allow users to see the analysis
      setTimeout(() => {
        setShowSuccess(false)
        setLastAnalysis(null)
      }, 5000)
      
    } catch (error) {
      console.error('Error processing voice note:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 bg-white overflow-hidden">

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Caribbean Flags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {caribbeanFlags.map((flag, index) => (
              <span 
                key={index} 
                className="text-2xl inline-block animate-bounce hover:scale-125 transition-transform cursor-default"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: '2s'
                }}
              >
                {flag}
              </span>
            ))}
          </div>

          {/* Simple, Direct Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Work. Get Jobs Done.
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Voice notes only. No typing.
          </p>
          <p className="text-lg text-teal-600 font-medium mb-8">
            For the Caribbean, by the Caribbean
          </p>

          {/* Voice Recorder */}
          <div className="mb-12">
            {showSuccess ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 max-w-2xl mx-auto">
                <div className="text-green-600 text-4xl mb-2 text-center">✅</div>
                <h3 className="text-lg font-bold text-green-800 mb-4 text-center">Job Posted Successfully!</h3>
                
                {lastAnalysis && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-semibold text-gray-800 mb-2">🎯 Caribbean ASR Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Accent Detected:</span>{" "}
                        <span className="capitalize">{lastAnalysis.accent.primary}</span>
                        <span className="text-gray-500 ml-1">({Math.round(lastAnalysis.confidence * 100)}% confident)</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-700">Speech Quality:</span>{" "}
                        <span className="capitalize">{lastAnalysis.speechPatterns.clarity}</span>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Skills Detected:</span>{" "}
                        <span>{lastAnalysis.jobExtraction.skills.slice(0,2).join(", ") || "General work"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-700">Urgency:</span>{" "}
                        <span className="capitalize">{lastAnalysis.jobExtraction.urgency}</span>
                      </div>
                      {lastAnalysis.jobExtraction.location && (
                        <div>
                          <span className="font-medium text-green-700">Location:</span>{" "}
                          <span>{lastAnalysis.jobExtraction.location}</span>
                        </div>
                      )}
                      {lastAnalysis.caribbeanContext.localTerms.length > 0 && (
                        <div>
                          <span className="font-medium text-teal-700">Local Terms:</span>{" "}
                          <span>{lastAnalysis.caribbeanContext.localTerms.slice(0,2).join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <p className="text-green-700 text-sm text-center">Your voice note is now live with Caribbean-powered insights!</p>
              </div>
            ) : (
              <>
                <VoiceRecorder 
                  onRecordingComplete={handleRecordingComplete}
                  isProcessing={isProcessing}
                />
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Record → Transcribe → Post automatically
                </p>
              </>
            )}
          </div>

          {/* Clear Options */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <Link to="/hire-workers" className="group">
              <div className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 p-6 rounded-lg transition-all">
                <div className="text-3xl mb-2">💼</div>
                <h3 className="font-bold text-lg mb-2 text-blue-900">Need Work Done?</h3>
                <p className="text-blue-700 text-sm mb-3">Find skilled Caribbean workers</p>
                <p className="text-xs text-blue-600 group-hover:underline">Browse available workers →</p>
              </div>
            </Link>
            <Link to="/find-work" className="group">
              <div className="bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 p-6 rounded-lg transition-all">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-bold text-lg mb-2 text-green-900">Looking for Work?</h3>
                <p className="text-green-700 text-sm mb-3">Find jobs that match your skills</p>
                <p className="text-xs text-green-600 group-hover:underline">Browse available jobs →</p>
              </div>
            </Link>
          </div>

          {/* Simple Stats & Browse Link */}
          <div className="text-center">
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-4 transition-colors"
            >
              Browse Active Jobs <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <span>{stats.totalWorkers} Active Workers</span>
              <span>•</span>
              <span>{stats.totalJobs} Jobs Posted</span>
              <span>•</span>
              <span>{stats.activeGigs} Active Gigs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
