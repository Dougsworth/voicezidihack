import { ArrowRight, Phone } from "lucide-react";
import VoiceRecorder from "@/components/voice/VoiceRecorder";
import TranscriptionLoader from "@/components/voice/TranscriptionLoader";
import { 
  AnimatedMicrophone,
  AnimatedPhone, 
  AnimatedWork,
  AnimatedGlobal
} from "@/components/animations/ProfessionalIcons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TranscriptionService } from "@/services/transcriptionService";
import { VoiceJobsService } from "@/services/voiceJobsService";
import { GeolocationService, type CaribbeanLocation } from "@/services/geolocationService";
import type { AppStats } from "@/types";
import { CARIBBEAN_FLAGS, CARIBBEAN_COLORS } from "@/constants";

const HeroSection = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error'>('uploading')
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<{
    skillProfile?: any;
    matches?: any[];
    extractedDetails?: any;
  } | null>(null)
  const [userLocation, setUserLocation] = useState<CaribbeanLocation | null>(null)
  const [userPhone, setUserPhone] = useState<string | null>(null)
  const [userPhoneDisplay, setUserPhoneDisplay] = useState<string | null>(null)
  const [stats, setStats] = useState<AppStats>({
    totalJobs: 0,
    totalWorkers: 0,
    activeGigs: 0
  })

  // Fetch stats and auto-get location on mount
  useEffect(() => {
    async function fetchStats() {
      try {
        const statsData = await VoiceJobsService.getStats()
        setStats({
          totalJobs: statsData.total,
          totalWorkers: statsData.completed,
          activeGigs: statsData.processing
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    
    // Auto-get location once (silently)
    async function autoGetLocation() {
      const cachedLocation = localStorage.getItem('userLocation')
      if (cachedLocation) {
        try {
          setUserLocation(JSON.parse(cachedLocation))
          return
        } catch (e) {
          localStorage.removeItem('userLocation')
        }
      }
      
      try {
        const location = await GeolocationService.getCaribbeanLocation()
        setUserLocation(location)
        localStorage.setItem('userLocation', JSON.stringify(location))
        console.log('📍 Auto-detected location:', location.detectedIsland || location.nearestTown)
      } catch (error) {
        console.log('📍 Location not available')
      }
    }
    
    // Check for saved phone number
    const savedPhone = localStorage.getItem('userPhone')
    const savedPhoneDisplay = localStorage.getItem('userPhoneDisplay')
    if (savedPhone) {
      setUserPhone(savedPhone)
      setUserPhoneDisplay(savedPhoneDisplay)
      console.log('📱 Using saved phone:', savedPhone)
    }
    
    fetchStats()
    autoGetLocation()
  }, [])

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setProcessingStage('uploading')
    setProcessingError(null)
    setAiResults(null) // Clear previous AI results
    
    try {
      setProcessingStage('transcribing')
      
      // Transcribe using HuggingFace ASR
      const text = await TranscriptionService.transcribeAudio(audioBlob)
      console.log('✅ Transcription:', text)
      
      // Check if transcription is too short or unclear
      if (text.trim().length < 3) {
        throw new Error('Recording too short or unclear. Please try again with a longer message.')
      }
      
      setTranscription(text)
      setProcessingStage('analyzing')
      
      // Enhanced Caribbean-aware job categorization (matching Twilio logic)
      const lower = text.toLowerCase();
      let seekingScore = 0;
      let hiringScore = 0;
      const indicators: string[] = [];

      // WORK SEEKING patterns (work_request)
      if (/\b(i|me|mi)\s+(am\s+)?(need|want|looking\s+for)\s+(work|job|employment)/i.test(lower)) {
        seekingScore += 3;
        indicators.push('Seeking work directly');
      }
      
      if (/\b(i|me|mi)\s+(am\s+)?(a|an)\s+\w+/i.test(lower)) {
        seekingScore += 2;
        indicators.push('Job role declaration');
      }
      
      if (/\bavailable\s+(for\s+)?(work|job)/i.test(lower)) {
        seekingScore += 3;
        indicators.push('Availability for work');
      }
      
      if (/\b(i|me|mi)\s+(can|do|know\s+how\s+to)\s+\w+/i.test(lower)) {
        seekingScore += 2;
        indicators.push('Skill offering');
      }

      // HIRING patterns (job_posting) - Caribbean aware
      if (/\b(i|me|mi)\s+(need|want)\s+(a|an|some)?\s*(promo|someone|somebody)\s+(to|for|who\s+can)/i.test(lower)) {
        hiringScore += 4;
        indicators.push('Need someone for task (promo=someone)');
      }
      
      if (/\bneed\s+(a|an|some|someone|somebody|promo)\s+(to|for|who\s+can)/i.test(lower)) {
        hiringScore += 3;
        indicators.push('Hiring need expressed');
      }
      
      if (/\blooking\s+for\s+(a|an|some|someone|somebody|promo)\s+(to|for|who\s+can)/i.test(lower)) {
        hiringScore += 3;
        indicators.push('Looking to hire');
      }

      // Possessive patterns indicate hiring
      if (/\b(fix|paint|clean|repair|wash|cut|trim)\s+(my|mi|our)\s+\w+/i.test(lower)) {
        hiringScore += 3;
        indicators.push('Personal task needing worker');
      }

      // Rate/pricing patterns indicate work seeking
      if (/\b(my|mi)\s+(rate|charge|price|fee)/i.test(lower)) {
        seekingScore += 2;
        indicators.push('Worker pricing mention');
      }

      const gigType = seekingScore > hiringScore ? 'work_request' : 'job_posting'
      console.log(`🎯 Enhanced Categorization: seeking=${seekingScore}, hiring=${hiringScore} → ${gigType}`)
      console.log(`   Indicators: ${indicators.join(', ')}`)
      
      // Extract job details with GPT
      console.log('🤖 Extracting job details with GPT...')
      const extractedDetails = await VoiceJobsService.extractJobDetailsWithGPT(text)
      console.log('✅ Extracted details:', extractedDetails)
      
      // Save to voice_jobs table with FULL AI enhancement
      const result = await VoiceJobsService.createFromFrontendWithFullAI(text, gigType, userPhone || undefined, true)
      console.log('✅ Created AI-enhanced voice job:', {
        success: !!result.voiceJob,
        skillsFound: result.skillProfile?.primarySkills?.length || 0,
        matchesFound: result.matches?.length || 0
      })
      
      // Store AI results for UI display
      setAiResults({
        skillProfile: result.skillProfile,
        matches: result.matches,
        extractedDetails: result.extractedDetails
      })
      
      // Log skill insights for user feedback
      if (result.skillProfile?.primarySkills && result.skillProfile.primarySkills.length > 0) {
        console.log('🔧 Skills detected:', result.skillProfile.primarySkills.map(s => s.name).join(', '))
        if (result.skillProfile.marketValue === 'high' || result.skillProfile.marketValue === 'premium') {
          console.log('💰 High-value skill combination detected!')
        }
      }
      
      // Log potential matches
      if (result.matches && result.matches.length > 0) {
        console.log(`🎯 ${result.matches.length} potential matches found with scores:`, 
          result.matches.slice(0, 3).map(m => `${(m.matchScore * 100).toFixed(0)}%`).join(', ')
        )
      }
      
      setProcessingStage('complete')
      setShowSuccess(true)

      // setTimeout(() => {
      //   setShowSuccess(true)
      // }, 500)
      
      // // Reset after showing success
      // setTimeout(() => {
      //   setShowSuccess(false)
      //   setTranscription(null)
      // }, UI_CONFIG.successMessageDuration)
      
    } catch (error) {
      console.error('Error processing voice note:', error)
      setProcessingStage('error')
      setProcessingError(error instanceof Error ? error.message : 'Something went wrong')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingError(null)
      }, 3000)
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 bg-white overflow-hidden">
      {/* Professional animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top left - global/location */}
        <div className="absolute top-24 left-16 hidden md:block">
          <AnimatedGlobal size={45} opacity={0.2} />
        </div>
        
        {/* Top right - microphone */}
        <div className="absolute top-24 right-16 hidden md:block">
          <AnimatedMicrophone size={45} opacity={0.22} />
        </div>
        
        {/* Bottom left - work/briefcase */}
        <div className="absolute bottom-36 left-16 hidden md:block">
          <AnimatedWork size={45} opacity={0.2} />
        </div>
        
        {/* Bottom right - phone */}
        <div className="absolute bottom-36 right-16 hidden md:block">
          <AnimatedPhone size={45} opacity={0.22} />
        </div>
      </div>
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Caribbean Flags */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fadeIn">
            {CARIBBEAN_FLAGS.map((flag, index) => (
              <span 
                key={index} 
                className="text-2xl inline-block hover:scale-125 transition-transform cursor-default"
                style={{
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0
                }}
              >
                {flag}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Work. Get Jobs Done.
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Voice notes only. No typing.
          </p>
          <p className="text-lg font-medium mb-8" style={{ color: CARIBBEAN_COLORS.secondary[600] }}>
            For the Caribbean, by the Caribbean
          </p>

          {/* Voice Recorder */}
          <div className="mb-12 relative">
            
            {isProcessing ? (
              <TranscriptionLoader 
                isLoading={true}
                stage={processingStage}
                error={processingError || undefined}
              />
            ) : showSuccess ? (
              <div className="border-2 rounded-xl p-6 max-w-2xl mx-auto" style={{ backgroundColor: CARIBBEAN_COLORS.success[50], borderColor: CARIBBEAN_COLORS.success[200] }}>
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.success[500] }}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-4 text-center" style={{ color: CARIBBEAN_COLORS.success[800] }}>
                  Posted Successfully!
                </h3>
                
                {transcription && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-left">
                    <p className="text-sm font-medium text-gray-500 mb-1">Your transcription:</p>
                    <p className="text-gray-700 italic">"{transcription}"</p>
                  </div>
                )}

                {/* AI Skills Detection Display */}
                {aiResults?.skillProfile?.primarySkills && aiResults.skillProfile.primarySkills.length > 0 && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-left border-2" style={{ borderColor: CARIBBEAN_COLORS.primary[200], backgroundColor: CARIBBEAN_COLORS.primary[25] }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold" style={{ color: CARIBBEAN_COLORS.primary[800] }}>
                        🔧 AI Detected Skills
                      </h4>
                      {aiResults.skillProfile.marketValue === 'premium' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: CARIBBEAN_COLORS.warning[100], 
                          color: CARIBBEAN_COLORS.warning[800] 
                        }}>
                          💰 Premium Value
                        </span>
                      )}
                      {aiResults.skillProfile.marketValue === 'high' && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: CARIBBEAN_COLORS.success[100], 
                          color: CARIBBEAN_COLORS.success[800] 
                        }}>
                          📈 High Demand
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {aiResults.skillProfile.primarySkills.map((skill: any, index: number) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{ 
                            backgroundColor: CARIBBEAN_COLORS.primary[100], 
                            color: CARIBBEAN_COLORS.primary[700] 
                          }}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                    
                    {aiResults.skillProfile.implicitSkills && aiResults.skillProfile.implicitSkills.length > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        <span className="font-medium">Related skills:</span> {aiResults.skillProfile.implicitSkills.map((s: any) => s.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Match Results Display */}
                {aiResults?.matches && aiResults.matches.length > 0 && (
                  <div className="bg-white rounded-lg p-4 mb-4 text-left border-2" style={{ borderColor: CARIBBEAN_COLORS.secondary[200], backgroundColor: CARIBBEAN_COLORS.secondary[25] }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[500] }}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-sm font-semibold" style={{ color: CARIBBEAN_COLORS.secondary[800] }}>
                        🎯 Smart Matches Found ({aiResults.matches.length})
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      {aiResults.matches.slice(0, 3).map((match: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[50] }}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ 
                                  backgroundColor: match.matchScore >= 0.8 ? CARIBBEAN_COLORS.success[500] : 
                                                 match.matchScore >= 0.6 ? CARIBBEAN_COLORS.warning[500] : 
                                                 CARIBBEAN_COLORS.neutral[400] 
                                }}
                              />
                              <span className="text-sm font-medium" style={{ color: CARIBBEAN_COLORS.secondary[700] }}>
                                {match.confidenceLevel === 'excellent' ? '🌟 Excellent Match' :
                                 match.confidenceLevel === 'high' ? '✨ High Match' :
                                 match.confidenceLevel === 'medium' ? '💫 Good Match' : 
                                 '⭐ Potential Match'}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-1">
                              {match.matchReasons.slice(0, 2).join(' • ')}
                            </p>
                            
                            <div className="flex gap-3 text-xs text-gray-500">
                              <span>Skills: {(match.skillAlignment * 100).toFixed(0)}%</span>
                              <span>Location: {(match.locationProximity * 100).toFixed(0)}%</span>
                              <span>Success: {match.estimatedSuccess}%</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: CARIBBEAN_COLORS.secondary[600] }}>
                              {(match.matchScore * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">match</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {aiResults.matches.length > 3 && (
                      <div className="text-center mt-3 text-sm" style={{ color: CARIBBEAN_COLORS.secondary[600] }}>
                        +{aiResults.matches.length - 3} more potential matches
                      </div>
                    )}
                  </div>
                )}
                
                {/* Contact Info */}
                {userPhoneDisplay && (
                  <div className="bg-white rounded-lg p-3 text-left mb-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: CARIBBEAN_COLORS.secondary[500] }} />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium" style={{ color: CARIBBEAN_COLORS.secondary[700] }}>Contact:</span>{" "}
                        {userPhoneDisplay}
                      </p>
                    </div>
                  </div>
                )}
                
                {userLocation && (
                  <div className="bg-white rounded-lg p-3 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}>
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium" style={{ color: CARIBBEAN_COLORS.primary[700] }}>Posted from:</span>{" "}
                        {GeolocationService.formatLocation(userLocation)}
                      </p>
                    </div>
                  </div>
                )}
                
                {!userPhone && (
                  <Link 
                    to="/signup" 
                    className="block mt-3 text-sm text-center py-2 px-4 rounded-lg"
                    style={{ backgroundColor: CARIBBEAN_COLORS.warning[50], color: CARIBBEAN_COLORS.warning[700] }}
                  >
                    Add your phone number so people can contact you →
                  </Link>
                )}
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

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <Link to="/hire-workers" className="group block">
              <div className="bg-white p-8 rounded-lg transition-all shadow-sm hover:shadow-md border h-full min-h-[180px] flex flex-col" style={{ 
                borderColor: CARIBBEAN_COLORS.primary[200]
              }} onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = CARIBBEAN_COLORS.primary[50]
                e.currentTarget.style.borderColor = CARIBBEAN_COLORS.primary[400]
              }} onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = CARIBBEAN_COLORS.primary[200]
              }}>
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: CARIBBEAN_COLORS.primary[500] }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: CARIBBEAN_COLORS.primary[800] }}>Need Work Done?</h3>
                </div>
                <p className="text-sm mb-4 flex-grow" style={{ color: CARIBBEAN_COLORS.primary[600] }}>Connect with skilled Caribbean professionals</p>
                <p className="text-sm font-medium" style={{ color: CARIBBEAN_COLORS.primary[500] }}>Browse workers →</p>
              </div>
            </Link>
            <Link to="/find-work" className="group block">
              <div className="bg-white p-8 rounded-lg transition-all shadow-sm hover:shadow-md border h-full min-h-[180px] flex flex-col" style={{ 
                borderColor: CARIBBEAN_COLORS.secondary[200]
              }} onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = CARIBBEAN_COLORS.secondary[50]
                e.currentTarget.style.borderColor = CARIBBEAN_COLORS.secondary[400]
              }} onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.borderColor = CARIBBEAN_COLORS.secondary[200]
              }}>
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[500] }}>
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: CARIBBEAN_COLORS.secondary[800] }}>Looking for Work?</h3>
                </div>
                <p className="text-sm mb-4 flex-grow" style={{ color: CARIBBEAN_COLORS.secondary[600] }}>Find opportunities that match your skills</p>
                <p className="text-sm font-medium" style={{ color: CARIBBEAN_COLORS.secondary[500] }}>Browse jobs →</p>
              </div>
            </Link>
          </div>

          {/* Stats */}
          <div className="text-center">
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 font-medium mb-4 transition-colors"
              style={{ color: CARIBBEAN_COLORS.secondary[600] }}
              onMouseEnter={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.secondary[700]}
              onMouseLeave={(e) => e.currentTarget.style.color = CARIBBEAN_COLORS.secondary[600]}
            >
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex justify-center gap-8 text-sm" style={{ color: CARIBBEAN_COLORS.neutral[500] }}>
              <span>{stats.totalJobs} Total Posts</span>
              <span>•</span>
              <span>{stats.totalWorkers} Completed</span>
              <span>•</span>
              <span>{stats.activeGigs} Processing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
