// Patois Cleaning Service - Improves Patois transcription accuracy
// Handles:
// 1. ASR mishearing corrections (what ASR hears -> actual Patois)
// 2. Patois to English translation (for display and job matching)
// 3. Job-specific term extraction

export interface PatoisCleaningResult {
  original: string
  cleaned: string           // Fixed Patois (ASR corrections applied)
  english: string           // English translation
  confidence: number        // How confident we are in the cleaning
  isPatois: boolean         // Whether Patois was detected
  detectedTerms: string[]   // Patois words/phrases found
  extractedSkills: string[] // Job skills extracted
}

export class PatoisCleaningService {
  
  // ============================================================
  // ASR MISHEARING CORRECTIONS
  // Maps what generic ASR typically outputs to proper Patois
  // ============================================================
  private static readonly ASR_CORRECTIONS: Array<{pattern: RegExp, replacement: string}> = [
    // Pronoun corrections - ASR hears English approximations
    { pattern: /\bme\s+want\b/gi, replacement: 'mi want' },
    { pattern: /\bme\s+need\b/gi, replacement: 'mi need' },
    { pattern: /\bme\s+have\b/gi, replacement: 'mi have' },
    { pattern: /\bme\s+can\b/gi, replacement: 'mi can' },
    { pattern: /\bme\s+no\b/gi, replacement: 'mi nuh' },
    { pattern: /\bme\s+a\b/gi, replacement: 'mi a' },
    { pattern: /\bme\s+go\b/gi, replacement: 'mi ago' },
    { pattern: /\bme\s+deh\b/gi, replacement: 'mi deh' },
    { pattern: /\bme\s+nuh\b/gi, replacement: 'mi nuh' },
    { pattern: /\bme\s+fi\b/gi, replacement: 'mi fi' },
    
    // "wa gwan" / "wah gwaan" variations ASR might produce
    { pattern: /\bwhat\s*(?:is\s*)?goin(?:g)?\s*on\b/gi, replacement: 'wah gwaan' },
    { pattern: /\bwhat\s+(?:a\s+)?gwan\b/gi, replacement: 'wah gwaan' },
    { pattern: /\bwa\s+gwan\b/gi, replacement: 'wah gwaan' },
    { pattern: /\bwagwan\b/gi, replacement: 'wah gwaan' },
    { pattern: /\bwagon\b/gi, replacement: 'wah gwaan' },
    
    // "nuh" corrections (don't/not)
    { pattern: /\bno\s+have\b/gi, replacement: 'nuh have' },
    { pattern: /\bno\s+know\b/gi, replacement: 'nuh know' },
    { pattern: /\bno\s+want\b/gi, replacement: 'nuh want' },
    { pattern: /\bdon'?t\s+have\b/gi, replacement: 'nuh have' },
    
    // "fi" (to/for) corrections
    { pattern: /\bfor\s+to\b/gi, replacement: 'fi' },
    { pattern: /\bwant\s+to\b/gi, replacement: 'waan fi' },
    { pattern: /\bneed\s+to\b/gi, replacement: 'need fi' },
    { pattern: /\bhave\s+to\b/gi, replacement: 'haffi' },
    { pattern: /\bgoing\s+to\b/gi, replacement: 'ago' },
    { pattern: /\bgonna\b/gi, replacement: 'ago' },
    
    // "inna" (in/into) corrections
    { pattern: /\bin\s+the\b/gi, replacement: 'inna di' },
    { pattern: /\bin\s+a\b/gi, replacement: 'inna' },
    { pattern: /\binto\s+the\b/gi, replacement: 'inna di' },
    
    // "pon" (on/upon) corrections
    { pattern: /\bon\s+the\b/gi, replacement: 'pon di' },
    { pattern: /\bon\s+a\b/gi, replacement: 'pon' },
    { pattern: /\bupon\b/gi, replacement: 'pon' },
    
    // Common word mishearings
    { pattern: /\bthem\b/gi, replacement: 'dem' },
    { pattern: /\bthe\b/gi, replacement: 'di' },
    { pattern: /\byou\b/gi, replacement: 'yuh' },
    { pattern: /\bsay\b/gi, replacement: 'seh' },
    { pattern: /\bsaid\b/gi, replacement: 'seh' },
    { pattern: /\bthing\b/gi, replacement: 'ting' },
    { pattern: /\bthings\b/gi, replacement: 'tings' },
    { pattern: /\bboy\b/gi, replacement: 'bwoy' },
    { pattern: /\bgirl\b/gi, replacement: 'gyal' },
    { pattern: /\blittle\b/gi, replacement: 'likkle' },
    { pattern: /\bwork\b/gi, replacement: 'wuk' },
    { pattern: /\bchild(?:ren)?\b/gi, replacement: 'pickney' },
    { pattern: /\bkids?\b/gi, replacement: 'pickney' },
    { pattern: /\bbrother\b/gi, replacement: 'bredrin' },
    { pattern: /\bsister\b/gi, replacement: 'sistren' },
    { pattern: /\byesterday\b/gi, replacement: 'yesday' },
    { pattern: /\btomorrow\b/gi, replacement: 'tumaro' },
    { pattern: /\bsomething\b/gi, replacement: 'supm' },
    { pattern: /\bnothing\b/gi, replacement: 'nuttn' },
    { pattern: /\beverything\b/gi, replacement: 'everyting' },
    { pattern: /\banything\b/gi, replacement: 'anyting' },
    { pattern: /\bcan'?t\b/gi, replacement: 'cyaan' },
    { pattern: /\bdon'?t\b/gi, replacement: 'doan' },
    { pattern: /\bplenty\b/gi, replacement: 'nuff' },
    { pattern: /\benough\b/gi, replacement: 'nuff' },
    { pattern: /\ba\s+lot\b/gi, replacement: 'nuff' },
    
    // ASR commonly mishears these Patois sounds
    { pattern: /\bpicnic\b/gi, replacement: 'pickney' },
    { pattern: /\bpick\s+me\b/gi, replacement: 'pickney' },
    { pattern: /\bpick\s+knee\b/gi, replacement: 'pickney' },
    { pattern: /\bwagon\b/gi, replacement: 'wah gwaan' },
    { pattern: /\bswan\b/gi, replacement: 'gwaan' },
    { pattern: /\bgull\b/gi, replacement: 'gyal' },
    { pattern: /\bcyan\b/gi, replacement: 'cyaan' },
    { pattern: /\binner\b/gi, replacement: 'inna' },
    { pattern: /\bpan\b/gi, replacement: 'pon' },
    { pattern: /\bteen\b/gi, replacement: 'ting' },
  ]

  // ============================================================
  // PATOIS TO ENGLISH TRANSLATIONS
  // For display and job matching
  // ============================================================
  private static readonly PATOIS_TRANSLATIONS: Record<string, string> = {
    // Pronouns
    'mi': 'I',
    'yuh': 'you',
    'dem': 'them/they',
    'im': 'him',
    'har': 'her',
    'wi': 'we',
    'unnu': 'you all',
    'fi mi': 'my/mine',
    'fi yuh': 'your/yours',
    
    // Verbs & verb markers
    'deh': 'is/are (being)',
    'a': 'is (doing)',
    'ago': 'going to/will',
    'did': 'was/did',
    'neva': 'never/didn\'t',
    'gwaan': 'going on',
    'seh': 'say/said',
    'waan': 'want',
    'ave': 'have',
    'fi': 'to/for',
    'haffi': 'have to/must',
    'mek': 'make/let',
    'luk': 'look',
    'nyam': 'eat',
    'kotch': 'rest/chill',
    'bun': 'burn',
    'buss': 'burst/hit',
    'dun': 'done/already',
    'galang': 'go along/behave',
    
    // Negatives
    'nuh': 'don\'t/not',
    'doan': 'don\'t',
    'cyaan': 'can\'t',
    'nuttn': 'nothing',
    
    // Question words
    'weh': 'what/where',
    'wah': 'what',
    'wen': 'when',
    'ow': 'how',
    'how much': 'how much',
    
    // Articles & prepositions
    'di': 'the',
    'inna': 'in/into',
    'pon': 'on',
    'fram': 'from',
    'wid': 'with',
    'outta': 'out of',
    'ova': 'over',
    
    // Nouns
    'ting': 'thing',
    'supm': 'something',
    'pickney': 'child/children',
    'bwoy': 'boy',
    'gyal': 'girl',
    'bredrin': 'brother/friend',
    'sistren': 'sister/friend',
    'yute': 'youth/young person',
    'dawg': 'friend/guy',
    'spar': 'friend',
    'empress': 'respected woman',
    'faada': 'father',
    'madda': 'mother',
    'granny': 'grandmother',
    'yaad': 'home/yard',
    'wuk': 'work',
    'moni': 'money',
    'food': 'food',
    'likeness': 'photo',
    
    // Adjectives & adverbs
    'likkle': 'little/small',
    'nuff': 'plenty/much/many',
    'gud': 'good',
    'bad': 'great/cool (positive)',
    'irie': 'good/great/peaceful',
    'criss': 'nice/cool/crisp',
    'wicked': 'awesome (positive)',
    'mad': 'crazy/amazing',
    'propa': 'proper/real',
    'tallawah': 'strong/resilient',
    'facety': 'cheeky/rude',
    
    // Time
    'tumaro': 'tomorrow',
    'yesday': 'yesterday',
    'now': 'now',
    'jus now': 'soon/in a bit',
    'lata': 'later',
    
    // Expressions
    'wah gwaan': 'what\'s up/what\'s happening',
    'everyting': 'everything',
    'anyting': 'anything',
    'big up': 'respect/shout out',
    'bless up': 'blessings/take care',
    'nuh true': 'isn\'t it/right?',
    'seen': 'understood/I see',
    'zeen': 'understood/I see',
    'one love': 'goodbye/peace',
    'walk good': 'take care/safe travels',
    'soon come': 'be right back',
    'likkle more': 'see you later',
    'yuh zimi': 'you understand me',
  }

  // ============================================================
  // JOB-SPECIFIC TERM MAPPINGS
  // Maps Patois job descriptions to English skills
  // ============================================================
  private static readonly JOB_MAPPINGS: Record<string, string[]> = {
    // Cooking/Food
    'mek food': ['cooking', 'chef', 'catering'],
    'cook food': ['cooking', 'chef', 'catering'],
    'nyam': ['food service', 'cooking'],
    'cook': ['cooking', 'chef'],
    
    // Automotive
    'fix car': ['mechanic', 'auto repair'],
    'fix cyar': ['mechanic', 'auto repair'],
    'wuk pon car': ['mechanic', 'automotive'],
    'mechanic': ['mechanic', 'auto repair'],
    
    // Gardening/Landscaping
    'trim yard': ['gardening', 'landscaping'],
    'trim yaad': ['gardening', 'landscaping'],
    'bush di yaad': ['landscaping', 'yard work'],
    'cut grass': ['lawn care', 'gardening'],
    'garden': ['gardening', 'landscaping'],
    
    // Cleaning/Domestic
    'clean house': ['cleaning', 'housekeeping'],
    'wash house': ['cleaning', 'domestic work'],
    'helper': ['domestic helper', 'housekeeping'],
    'cleaning': ['cleaning', 'housekeeping'],
    
    // Driving/Transport
    'drive': ['driver', 'transportation'],
    'taxi': ['taxi driver', 'transportation'],
    'run taxi': ['taxi driver'],
    'driver': ['driver', 'transportation'],
    
    // Construction/Trades
    'fix light': ['electrician', 'electrical'],
    'wire house': ['electrician'],
    'electrician': ['electrician', 'electrical'],
    'fix pipe': ['plumber', 'plumbing'],
    'plumber': ['plumber', 'plumbing'],
    'build': ['construction', 'carpentry'],
    'mason': ['masonry', 'construction'],
    'carpenter': ['carpentry', 'woodwork'],
    'paint house': ['painter', 'painting'],
    'painter': ['painter', 'painting'],
    'fix roof': ['roofing', 'construction'],
    'zinc': ['roofing'],
    'tile': ['tiler', 'flooring'],
    'weld': ['welding', 'metalwork'],
    
    // Childcare/Education
    'mind pickney': ['childcare', 'babysitting'],
    'look afta pickney': ['childcare', 'nanny'],
    'babysit': ['babysitting', 'childcare'],
    'teach': ['tutoring', 'teaching'],
    'extra lesson': ['tutoring'],
    'tutor': ['tutoring', 'education'],
    
    // Security
    'watchman': ['security guard'],
    'guard': ['security'],
    'security': ['security guard'],
    
    // Beauty/Personal care
    'barber': ['barber', 'grooming'],
    'hair': ['hairdresser', 'stylist'],
    'stylist': ['hairdresser', 'stylist'],
    'nail': ['nail technician', 'manicure'],
    'makeup': ['makeup artist', 'beauty'],
    
    // Tech
    'computer': ['IT support', 'tech'],
    'phone': ['phone repair', 'tech'],
    'website': ['web developer', 'IT'],
  }

  // Patois indicators for detection
  private static readonly PATOIS_MARKERS = [
    'mi', 'yuh', 'dem', 'weh', 'deh', 'nuh', 'seh', 'fi', 'inna', 'pon',
    'gwaan', 'wah', 'cyaan', 'doan', 'pickney', 'bredrin', 'sistren',
    'ting', 'bwoy', 'gyal', 'likkle', 'nuff', 'supm', 'nuttn', 'yaad',
    'wuk', 'ago', 'haffi', 'waan', 'mek', 'nyam', 'irie', 'zeen', 'seen'
  ]

  // ============================================================
  // MAIN CLEANING FUNCTION
  // ============================================================
  static cleanWithConfidence(text: string): PatoisCleaningResult {
    if (!text || text.trim().length === 0) {
      return {
        original: text,
        cleaned: text,
        english: text,
        confidence: 0,
        isPatois: false,
        detectedTerms: [],
        extractedSkills: []
      }
    }

    const original = text
    
    // Step 1: Check if Patois was detected FIRST (before applying any corrections)
    const initialDetectedTerms = this.detectPatoisTerms(original)
    const hasStrongIndicators = this.hasStrongPatoisIndicators(original)
    const isPatois = initialDetectedTerms.length >= 2 || hasStrongIndicators
    
    let cleaned = text
    
    // Step 2: ONLY apply ASR corrections if Patois is detected
    // This prevents converting regular English to patois
    if (isPatois) {
      console.log('🇯🇲 Patois detected - applying ASR corrections')
      for (const { pattern, replacement } of this.ASR_CORRECTIONS) {
        cleaned = cleaned.replace(pattern, replacement)
      }
    } else {
      console.log('🔤 Regular English detected - skipping patois corrections')
      cleaned = original // Keep original text unchanged
    }

    // Step 3: Re-check detection after cleaning (for final result)
    const detectedTerms = isPatois ? this.detectPatoisTerms(cleaned) : []

    // Step 4: Generate English translation (only if patois was detected)
    const english = isPatois ? this.translateToEnglish(cleaned) : cleaned

    // Step 5: Extract job skills
    const extractedSkills = this.extractJobSkills(cleaned)

    // Step 6: Calculate confidence
    const confidence = this.calculateConfidence(
      original, 
      cleaned, 
      detectedTerms.length, 
      isPatois
    )

    return {
      original,
      cleaned,
      english,
      confidence,
      isPatois,
      detectedTerms,
      extractedSkills
    }
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  
  private static detectPatoisTerms(text: string): string[] {
    const lowerText = text.toLowerCase()
    return this.PATOIS_MARKERS.filter(term => 
      new RegExp(`\\b${term}\\b`, 'i').test(lowerText)
    )
  }

  private static hasStrongPatoisIndicators(text: string): boolean {
    const lowerText = text.toLowerCase()
    
    // Strong indicators that this is definitely Patois
    const strongIndicators = [
      /\bwah gwaan\b/i,
      /\bmi\s+(want|need|have|can|deh|a)\b/i,
      /\bfi\s+(di|mi|yuh|dem)\b/i,
      /\binna\s+di\b/i,
      /\bpon\s+di\b/i,
      /\bnuh\s+(true|have|know|want)\b/i,
      /\b(pickney|bredrin|sistren)\b/i,
      /\b(cyaan|doan|haffi)\b/i,
    ]
    
    return strongIndicators.some(pattern => pattern.test(lowerText))
  }

  private static translateToEnglish(patoisText: string): string {
    let english = patoisText
    
    // Sort by length (longest first) to avoid partial replacements
    const sortedTranslations = Object.entries(this.PATOIS_TRANSLATIONS)
      .sort((a, b) => b[0].length - a[0].length)
    
    for (const [patois, translation] of sortedTranslations) {
      // Use word boundaries and case-insensitive matching
      const regex = new RegExp(`\\b${patois}\\b`, 'gi')
      english = english.replace(regex, translation.split('/')[0]) // Use first translation
    }
    
    // Clean up spacing and capitalization
    english = english.replace(/\s+/g, ' ').trim()
    english = english.charAt(0).toUpperCase() + english.slice(1)
    
    return english
  }

  private static extractJobSkills(text: string): string[] {
    const lowerText = text.toLowerCase()
    const skills: Set<string> = new Set()
    
    for (const [term, mappedSkills] of Object.entries(this.JOB_MAPPINGS)) {
      if (lowerText.includes(term)) {
        mappedSkills.forEach(skill => skills.add(skill))
      }
    }
    
    return Array.from(skills)
  }

  private static calculateConfidence(
    original: string, 
    cleaned: string, 
    patoisTermCount: number,
    isPatois: boolean
  ): number {
    if (!isPatois) return 1.0 // High confidence for non-Patois text
    
    let confidence = 0.5 // Base confidence for Patois
    
    // Boost for more Patois terms detected
    confidence += Math.min(patoisTermCount * 0.05, 0.25)
    
    // Boost if we made meaningful corrections
    const changesMade = original !== cleaned
    if (changesMade) confidence += 0.1
    
    // Boost for longer text (more context)
    const wordCount = original.split(/\s+/).length
    if (wordCount > 10) confidence += 0.1
    if (wordCount > 20) confidence += 0.05
    
    return Math.min(confidence, 0.95)
  }

  // ============================================================
  // STATIC HELPERS (for backward compatibility)
  // ============================================================
  
  static isLikelyPatois(text: string): boolean {
    const result = this.cleanWithConfidence(text)
    return result.isPatois
  }

  static cleanPatoisTranscription(text: string): string {
    const result = this.cleanWithConfidence(text)
    return result.cleaned
  }

  static translatePatoisToEnglish(text: string): string {
    const result = this.cleanWithConfidence(text)
    return result.english
  }
}



