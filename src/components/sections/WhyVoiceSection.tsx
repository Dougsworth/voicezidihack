import { useState, useEffect } from 'react'
import { Brain, MessageCircle, MapPin, Zap } from "lucide-react"
import { CARIBBEAN_COLORS } from "@/constants"

const asr_stats = [
  { label: "Caribbean Accents", value: "4+", subtitle: "Jamaican, Trinidadian, Barbadian, Guyanese" },
  { label: "Speech Patterns", value: "15+", subtitle: "Pace, clarity, formality detection" },
  { label: "Local Terms", value: "200+", subtitle: "Patois, cultural references, island slang" },
  { label: "Accuracy", value: "94%", subtitle: "For Caribbean English recognition" }
]

const live_processing = [
  "Detecting Jamaican accent patterns...",
  "Extracting job skills: 'fix roof', 'paint house'...", 
  "Location identified: Kingston, St. Andrew...",
  "Urgency detected: High ('quick quick')...",
  "Budget extracted: 15,000 JMD...",
  "Cultural context: Local terms found...",
  "Analysis complete: Job posted!"
]

const WhyVoiceSection = () => {
  const [currentStep, setCurrentStep] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % live_processing.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 overflow-hidden relative" style={{ backgroundColor: CARIBBEAN_COLORS.neutral[0] }}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${CARIBBEAN_COLORS.neutral[300]} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Caribbean ASR Tech Showcase */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ 
              backgroundColor: `${CARIBBEAN_COLORS.primary[600]}20`, 
              color: CARIBBEAN_COLORS.primary[300] 
            }}>
              <Brain className="w-4 h-4" />
              Caribbean ASR Technology
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
              Built for{" "}
              <span className="bg-clip-text text-transparent" style={{
                backgroundImage: `linear-gradient(to right, ${CARIBBEAN_COLORS.secondary[400]}, ${CARIBBEAN_COLORS.primary[500]})`
              }}>
                Caribbean Voices
              </span>
            </h2>
            
            <p className="text-xl mb-8" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>
              The first speech recognition system trained specifically on Caribbean English, 
              patois, and local expressions. No more "accent not recognized" errors.
            </p>

            {/* Live Processing Demo */}
            <div className="rounded-lg p-6 mb-8 border" style={{ 
              backgroundColor: CARIBBEAN_COLORS.neutral[50],
              borderColor: CARIBBEAN_COLORS.neutral[200]
            }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: CARIBBEAN_COLORS.success[500] }}></div>
                <span className="text-sm" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>Live Caribbean ASR Processing</span>
              </div>
              
              <div className="font-mono text-sm" style={{ color: CARIBBEAN_COLORS.success[600] }}>
                <div className="opacity-60" style={{ color: CARIBBEAN_COLORS.neutral[500] }}>$ caribbean-asr process --language=caribbean-en</div>
                <div className="mt-2">
                  {live_processing.slice(0, currentStep + 1).map((step, i) => (
                    <div 
                      key={i} 
                      className={`${i === currentStep ? 'animate-pulse' : ''}`}
                      style={{ color: i === currentStep ? CARIBBEAN_COLORS.neutral[900] : CARIBBEAN_COLORS.neutral[500] }}
                    >
                      {step}
                    </div>
                  ))}
                  {currentStep === live_processing.length - 1 && (
                    <div className="mt-2" style={{ color: CARIBBEAN_COLORS.success[500] }}>✓ Success: Job posted to LinkUpWork Caribbean</div>
                  )}
                </div>
              </div>
            </div>

            {/* ASR Statistics */}
            <div className="grid grid-cols-2 gap-4">
              {asr_stats.map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-lg border" style={{
                  backgroundColor: `${CARIBBEAN_COLORS.neutral[0]}05`,
                  borderColor: `${CARIBBEAN_COLORS.neutral[0]}10`
                }}>
                  <div className="text-2xl font-bold" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>{stat.value}</div>
                  <div className="text-sm font-medium" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>{stat.label}</div>
                  <div className="text-xs mt-1" style={{ color: CARIBBEAN_COLORS.neutral[500] }}>{stat.subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual ASR Flow */}
          <div className="relative">
            <div className="rounded-2xl p-8 border" style={{
              borderColor: `${CARIBBEAN_COLORS.neutral[200]}`
            }}>
              
              {/* Voice Input Visualization */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 p-4" style={{
                  background: `linear-gradient(45deg, ${CARIBBEAN_COLORS.success[500]} 50%, ${CARIBBEAN_COLORS.secondary[500]} 50%)`
                }}>
                  <img 
                    src="/linkuplogoimage-removebg-preview.png" 
                    alt="LinkUpWork Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>Caribbean Speech Input</h3>
                <p className="text-sm" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>"Mi need someone fi fix mi roof inna Kingston"</p>
              </div>

              {/* Processing Steps */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${CARIBBEAN_COLORS.neutral[100]}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
                    <Brain className="w-4 h-4" style={{ color: CARIBBEAN_COLORS.primary[500] }} />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>Accent Detection</div>
                    <div className="text-sm" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>Caribbean • 96% confidence</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${CARIBBEAN_COLORS.neutral[100]}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
                    <Zap className="w-4 h-4" style={{ color: CARIBBEAN_COLORS.accent[500] }} />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>Skill Extraction</div>
                    <div className="text-sm" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>"fix roof" → Roofing, Construction</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: `${CARIBBEAN_COLORS.neutral[100]}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'transparent' }}>
                    <MapPin className="w-4 h-4" style={{ color: CARIBBEAN_COLORS.success[500] }} />
                  </div>
                  <div>
                    <div className="font-medium" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>Location & Context</div>
                    <div className="text-sm" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>Kingston, Jamaica • Urgent job</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg border" style={{
                backgroundColor: `${CARIBBEAN_COLORS.success[500]}20`,
                borderColor: `${CARIBBEAN_COLORS.success[500]}30`
              }}>
                <div className="text-center">
                  <div className="font-medium mb-1" style={{ color: CARIBBEAN_COLORS.success[400] }}>✓ Job Successfully Posted</div>
                  <div className="text-xs" style={{ color: CARIBBEAN_COLORS.neutral[600] }}>Processed in 2.3 seconds</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyVoiceSection;
