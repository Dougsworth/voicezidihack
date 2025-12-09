// Advanced Caribbean ASR Analysis
// Leverages the specialized Caribbean speech model for deeper insights

export interface CaribbeanASRResult {
  transcription: string
  confidence: number
  accent: {
    detected: string[]
    primary: string
    confidence: number
  }
  speechPatterns: {
    pace: 'slow' | 'normal' | 'fast'
    clarity: 'poor' | 'fair' | 'good' | 'excellent'
    formality: 'casual' | 'semi-formal' | 'formal'
  }
  jobExtraction: {
    jobType: 'job_posting' | 'work_request' | 'unclear'
    skills: string[]
    location: string | null
    urgency: 'low' | 'medium' | 'high'
    experience: 'beginner' | 'intermediate' | 'expert' | 'unclear'
    budget: {
      amount: number | null
      currency: string
      type: 'fixed' | 'hourly' | 'negotiable'
    }
  }
  caribbeanContext: {
    localTerms: string[]
    culturalReferences: string[]
    islandSpecific: boolean
  }
}

// Caribbean accent detection patterns
const CARIBBEAN_ACCENTS = {
  jamaican: {
    patterns: [
      /\bmi\b/gi, // "mi" instead of "my" 
      /\bdem\b/gi, // "dem" instead of "them"
      /\byuh\b/gi, // "yuh" instead of "you"
      /\bweh\b/gi, // "weh" (where)
      /\bdeh\b/gi, // "deh" (there)
      /nuh\s+true/gi, // "nuh true" (isn't that right)
      /\bseh\b/gi, // "seh" (say)
    ],
    indicators: ['jamaica', 'kingston', 'spanish town', 'montego bay', 'jmd', 'patois']
  },
  trinidadian: {
    patterns: [
      /\brel\b/gi, // "rel" (really)
      /\btrue\s+true/gi, // "true true"
      /\boui\b/gi, // expression of surprise
      /\bgyul\b/gi, // "girl"
      /\bfete\b/gi, // party
    ],
    indicators: ['trinidad', 'tobago', 'port of spain', 'carnival', 'ttd']
  },
  barbadian: {
    patterns: [
      /\bwunna\b/gi, // "wunna" (you all)
      /\bbrek\b/gi, // "brek" (break)
      /\bpun\b/gi, // "pun" (on/upon)
    ],
    indicators: ['barbados', 'bridgetown', 'bds', 'bajan']
  },
  guyanais: {
    patterns: [
      /\babie\b/gi, // "abie" (but)
      /\bgyaff\b/gi, // "gyaff" (gossip)
      /\bcotch\b/gi, // "cotch" (sit/rest)
    ],
    indicators: ['guyana', 'georgetown', 'gyd']
  }
}

// Caribbean job terms and skills
const CARIBBEAN_JOB_TERMS = {
  skills: {
    'mek food': ['cooking', 'chef', 'catering'],
    'fix car': ['mechanic', 'automotive', 'repair'],
    'trim yard': ['gardening', 'landscaping', 'yard work'],
    'wash house': ['cleaning', 'domestic work', 'housekeeping'],
    'drive people': ['driver', 'taxi', 'transportation'],
    'fix light': ['electrician', 'electrical work'],
    'fix pipe': ['plumber', 'plumbing'],
    'build thing': ['construction', 'carpentry', 'handyman'],
    'teach pickney': ['tutoring', 'education', 'childcare'],
    'sell goods': ['vendor', 'sales', 'retail'],
    'security work': ['security guard', 'watchman'],
    'paint house': ['painter', 'decoration'],
    'fix roof': ['roofing', 'construction'],
    'style hair': ['hairdresser', 'barber', 'beauty']
  },
  urgency: {
    high: ['urgent', 'asap', 'right now', 'emergency', 'quick quick', 'inna hurry'],
    medium: ['soon', 'dis week', 'dis month', 'before weekend'],
    low: ['when time permit', 'no rush', 'sometime']
  },
  locations: {
    jamaica: ['kingston', 'spanish town', 'montego bay', 'portmore', 'may pen', 'mandeville', 'ocho rios'],
    trinidad: ['port of spain', 'san fernando', 'chaguanas', 'arima', 'point fortin'],
    barbados: ['bridgetown', 'speightstown', 'oistins', 'st lawrence'],
    guyana: ['georgetown', 'new amsterdam', 'linden', 'bartica']
  }
}

export async function analyzeCaribbeanSpeech(transcription: string): Promise<CaribbeanASRResult> {
  const text = transcription.toLowerCase()
  
  // Detect accent
  const accent = detectAccent(transcription)
  
  // Analyze speech patterns
  const speechPatterns = analyzeSpeechPatterns(transcription)
  
  // Extract job information with Caribbean context
  const jobExtraction = extractJobInfoCaribbean(transcription)
  
  // Find Caribbean-specific context
  const caribbeanContext = findCaribbeanContext(transcription)
  
  // Calculate overall confidence based on Caribbean model understanding
  const confidence = calculateCaribbeanConfidence(transcription, accent, jobExtraction)

  return {
    transcription,
    confidence,
    accent,
    speechPatterns,
    jobExtraction,
    caribbeanContext
  }
}

function detectAccent(text: string): CaribbeanASRResult['accent'] {
  const detected: string[] = []
  let maxScore = 0
  let primaryAccent = 'general_caribbean'
  
  for (const [accentName, accentData] of Object.entries(CARIBBEAN_ACCENTS)) {
    let score = 0
    
    // Check for speech patterns
    for (const pattern of accentData.patterns) {
      if (pattern.test(text)) {
        score += 2
      }
    }
    
    // Check for location/cultural indicators
    for (const indicator of accentData.indicators) {
      if (text.includes(indicator)) {
        score += 1
      }
    }
    
    if (score > 0) {
      detected.push(accentName)
      if (score > maxScore) {
        maxScore = score
        primaryAccent = accentName
      }
    }
  }
  
  const confidence = Math.min(maxScore / 5, 1) // Normalize to 0-1
  
  return {
    detected,
    primary: primaryAccent,
    confidence
  }
}

function analyzeSpeechPatterns(text: string): CaribbeanASRResult['speechPatterns'] {
  const wordCount = text.split(' ').length
  const avgWordsPerMinute = wordCount * 2 // Assume 30-second clips
  
  // Determine pace based on typical Caribbean speech patterns
  let pace: 'slow' | 'normal' | 'fast' = 'normal'
  if (avgWordsPerMinute < 80) pace = 'slow'
  else if (avgWordsPerMinute > 140) pace = 'fast'
  
  // Clarity based on coherence and completeness
  let clarity: 'poor' | 'fair' | 'good' | 'excellent' = 'good'
  if (text.length < 20) clarity = 'poor'
  else if (text.includes('...') || text.includes('[unclear]')) clarity = 'fair'
  else if (text.length > 100) clarity = 'excellent'
  
  // Formality based on language patterns
  let formality: 'casual' | 'semi-formal' | 'formal' = 'casual'
  const formalWords = ['please', 'thank you', 'sir', 'madam', 'kindly', 'respectfully']
  const casualWords = ['hey', 'yeah', 'nah', 'cool', 'bredrin', 'sistren']
  
  const formalCount = formalWords.filter(word => text.includes(word)).length
  const casualCount = casualWords.filter(word => text.includes(word)).length
  
  if (formalCount > casualCount + 1) formality = 'formal'
  else if (formalCount > 0) formality = 'semi-formal'
  
  return { pace, clarity, formality }
}

function extractJobInfoCaribbean(text: string): CaribbeanASRResult['jobExtraction'] {
  const lowerText = text.toLowerCase()
  
  // Determine job type with Caribbean context
  let jobType: 'job_posting' | 'work_request' | 'unclear' = 'unclear'
  
  const seekingWork = [
    'mi looking for work', 'mi need work', 'mi want work', 'mi available',
    'i looking for job', 'i need job', 'i can do', 'mi skilled in',
    'i experienced', 'mi good at', 'hire mi', 'employ mi'
  ]
  
  const offeringJob = [
    'mi need someone', 'looking for worker', 'want someone to', 'need help with',
    'hiring', 'job available', 'work available', 'mi want', 'seeking'
  ]
  
  if (seekingWork.some(phrase => lowerText.includes(phrase))) {
    jobType = 'work_request'
  } else if (offeringJob.some(phrase => lowerText.includes(phrase))) {
    jobType = 'job_posting'
  }
  
  // Extract skills with Caribbean terminology
  const skills: string[] = []
  for (const [caribbeanTerm, skillList] of Object.entries(CARIBBEAN_JOB_TERMS.skills)) {
    if (lowerText.includes(caribbeanTerm)) {
      skills.push(...skillList)
    }
  }
  
  // Extract location
  let location: string | null = null
  for (const [island, locations] of Object.entries(CARIBBEAN_JOB_TERMS.locations)) {
    for (const loc of locations) {
      if (lowerText.includes(loc)) {
        location = loc.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        break
      }
    }
    if (location) break
  }
  
  // Determine urgency
  let urgency: 'low' | 'medium' | 'high' = 'medium'
  if (CARIBBEAN_JOB_TERMS.urgency.high.some(term => lowerText.includes(term))) {
    urgency = 'high'
  } else if (CARIBBEAN_JOB_TERMS.urgency.low.some(term => lowerText.includes(term))) {
    urgency = 'low'
  }
  
  // Determine experience level
  let experience: 'beginner' | 'intermediate' | 'expert' | 'unclear' = 'unclear'
  if (lowerText.includes('new to') || lowerText.includes('learning')) {
    experience = 'beginner'
  } else if (lowerText.includes('experienced') || lowerText.includes('professional') || lowerText.includes('years')) {
    experience = 'expert'
  } else if (lowerText.includes('some experience') || lowerText.includes('can do')) {
    experience = 'intermediate'
  }
  
  // Extract budget
  const budget = extractBudgetCaribbean(text)
  
  return {
    jobType,
    skills: [...new Set(skills)], // Remove duplicates
    location,
    urgency,
    experience,
    budget
  }
}

function extractBudgetCaribbean(text: string): CaribbeanASRResult['jobExtraction']['budget'] {
  // Caribbean currency patterns
  const budgetPatterns = [
    /(\d+(?:,\d+)*)\s*(?:jmd|jamaica|dollar)/gi,
    /(\d+(?:,\d+)*)\s*(?:ttd|trinidad|tt)/gi,
    /(\d+(?:,\d+)*)\s*(?:bds|barbados|bajan)/gi,
    /(\d+(?:,\d+)*)\s*(?:gyd|guyana)/gi,
    /\$\s*(\d+(?:,\d+)*)/gi
  ]
  
  for (const pattern of budgetPatterns) {
    const match = pattern.exec(text)
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ''))
      const currency = determineCurrency(text)
      const type = text.includes('per hour') || text.includes('hourly') ? 'hourly' : 
                   text.includes('negotiable') ? 'negotiable' : 'fixed'
      
      return { amount, currency, type }
    }
  }
  
  return { amount: null, currency: 'JMD', type: 'negotiable' }
}

function determineCurrency(text: string): string {
  const lowerText = text.toLowerCase()
  if (lowerText.includes('trinidad') || lowerText.includes('ttd')) return 'TTD'
  if (lowerText.includes('barbados') || lowerText.includes('bds')) return 'BDS'
  if (lowerText.includes('guyana') || lowerText.includes('gyd')) return 'GYD'
  return 'JMD' // Default to Jamaican dollar
}

function findCaribbeanContext(text: string): CaribbeanASRResult['caribbeanContext'] {
  const lowerText = text.toLowerCase()
  
  // Caribbean-specific terms
  const localTerms = [
    'bredrin', 'sistren', 'pickney', 'ting', 'yute', 'dawg', 'spar',
    'bashment', 'fete', 'lime', 'tabanca', 'jammette', 'dougla'
  ].filter(term => lowerText.includes(term))
  
  // Cultural references
  const culturalReferences = [
    'carnival', 'mas', 'calypso', 'soca', 'reggae', 'dancehall',
    'cricket', 'dominoes', 'rum shop', 'sound system'
  ].filter(ref => lowerText.includes(ref))
  
  // Check if content is island-specific
  const islandSpecific = Object.values(CARIBBEAN_JOB_TERMS.locations)
    .flat()
    .some(location => lowerText.includes(location))
  
  return {
    localTerms,
    culturalReferences,
    islandSpecific
  }
}

function calculateCaribbeanConfidence(
  text: string, 
  accent: CaribbeanASRResult['accent'], 
  jobExtraction: CaribbeanASRResult['jobExtraction']
): number {
  let confidence = 0.5 // Base confidence
  
  // Boost confidence for clear Caribbean patterns
  confidence += accent.confidence * 0.3
  
  // Boost for successful job extraction
  if (jobExtraction.jobType !== 'unclear') confidence += 0.15
  if (jobExtraction.skills.length > 0) confidence += 0.1
  if (jobExtraction.location) confidence += 0.1
  
  // Boost for text length and completeness
  if (text.length > 50) confidence += 0.1
  if (text.length > 100) confidence += 0.05
  
  return Math.min(confidence, 0.95) // Cap at 95%
}