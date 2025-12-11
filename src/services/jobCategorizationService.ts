// Job Categorization Service - Intelligently categorizes voice notes as job postings or work requests
export type JobCategory = 'find_work' | 'hire_workers';

interface CategorizationResult {
  category: JobCategory;
  confidence: number;
  indicators: string[];
  jobType: 'seeking' | 'offering';
}

export class JobCategorizationService {
  // Patterns that indicate someone is LOOKING for work (Find Work)
  private static readonly SEEKING_WORK_PATTERNS = [
    // Direct statements
    /\b(i|me|mi)\s+(looking|need|want|searching)\s+(for\s+)?(work|job|gig)/i,
    /\b(i|me|mi)\s+(am|is)\s+a\s+\w+\s+(looking|available)/i,
    /\blooking\s+for\s+(any\s+)?(work|job|gig)/i,
    /\bavailable\s+(for|to)\s+(work|jobs?)/i,
    /\bseeking\s+(work|employment|job|gig)/i,
    /\bneed\s+(a\s+)?(job|work|gig)/i,
    
    // Skills offering
    /\b(i|me|mi)\s+(can|know\s+how\s+to|able\s+to)\s+\w+/i,
    /\b(i|me|mi)\s+(do|does|offer)\s+\w+\s+(work|service)/i,
    /\bmy\s+skills?\s+(include|are)/i,
    /\b(experienced|skilled)\s+(in|at|with)/i,
    
    // Caribbean variations
    /\bmi\s+(deh\s+)?look\s+fi\s+work/i,
    /\bmi\s+wan\s+work/i,
    /\bmi\s+need\s+fi\s+work/i,
    /\bmi\s+available/i,
    /\bmi\s+ready\s+fi/i
  ];
  
  // Patterns that indicate someone NEEDS to hire (Hire Workers)
  private static readonly HIRING_PATTERNS = [
    // Direct hiring statements
    /\bneed\s+(a|an)\s+\w+\s+(to|for)/i,
    /\blooking\s+for\s+(a|an)\s+\w+\s+(to|who\s+can)/i,
    /\bhiring\s+(a|an)?\s*\w+/i,
    /\bwant\s+(someone|somebody|anyone)\s+(to|who\s+can)/i,
    /\brequire\s+(a|an)?\s*\w+/i,
    /\bseeking\s+(a|an)\s+\w+\s+(for|to)/i,
    
    // Task-based patterns
    /\b(someone|somebody|anyone)\s+(to|must|should)\s+\w+/i,
    /\bneed\s+\w+\s+(done|fixed|repaired|cleaned)/i,
    /\b(fix|repair|clean|paint|build|install)\s+my\s+\w+/i,
    /\bfor\s+my\s+(house|home|office|yard|car)/i,
    
    // Caribbean variations
    /\bmi\s+need\s+(somebody|someone)\s+fi/i,
    /\bwho\s+can\s+\w+\s+fi\s+mi/i,
    /\blooking\s+fi\s+(somebody|someone)/i,
    /\bneed\s+fi\s+get\s+\w+\s+done/i
  ];
  
  // Context words that help determine category
  private static readonly WORKER_CONTEXT = [
    'available', 'experienced', 'certified', 'qualified', 'skilled',
    'years experience', 'portfolio', 'references', 'hourly rate'
  ];
  
  private static readonly EMPLOYER_CONTEXT = [
    'urgent', 'asap', 'immediately', 'tomorrow', 'this week',
    'pay', 'budget', 'per hour', 'fixed price', 'for my', 'at my'
  ];
  
  /**
   * Categorize a transcription into find_work or hire_workers
   */
  static categorize(transcription: string): CategorizationResult {
    const lowerText = transcription.toLowerCase();
    const indicators: string[] = [];
    
    // Count pattern matches
    let seekingScore = 0;
    let hiringScore = 0;
    
    // Check seeking work patterns
    for (const pattern of this.SEEKING_WORK_PATTERNS) {
      const match = lowerText.match(pattern);
      if (match) {
        seekingScore += 2;
        indicators.push(`Seeking pattern: "${match[0]}"`);
      }
    }
    
    // Check hiring patterns
    for (const pattern of this.HIRING_PATTERNS) {
      const match = lowerText.match(pattern);
      if (match) {
        hiringScore += 2;
        indicators.push(`Hiring pattern: "${match[0]}"`);
      }
    }
    
    // Check context words
    for (const word of this.WORKER_CONTEXT) {
      if (lowerText.includes(word)) {
        seekingScore += 0.5;
        indicators.push(`Worker context: "${word}"`);
      }
    }
    
    for (const word of this.EMPLOYER_CONTEXT) {
      if (lowerText.includes(word)) {
        hiringScore += 0.5;
        indicators.push(`Employer context: "${word}"`);
      }
    }
    
    // Analyze sentence structure
    const sentenceIndicators = this.analyzeSentenceStructure(transcription);
    seekingScore += sentenceIndicators.seekingScore;
    hiringScore += sentenceIndicators.hiringScore;
    indicators.push(...sentenceIndicators.indicators);
    
    // Determine category based on scores
    const totalScore = seekingScore + hiringScore;
    const confidence = totalScore > 0 
      ? Math.abs(seekingScore - hiringScore) / totalScore 
      : 0.5;
    
    const category: JobCategory = seekingScore > hiringScore ? 'find_work' : 'hire_workers';
    const jobType = category === 'find_work' ? 'seeking' : 'offering';
    
    console.log(`📊 Categorization scores - Seeking: ${seekingScore}, Hiring: ${hiringScore}`);
    
    return {
      category,
      confidence: Math.min(confidence + 0.3, 1), // Boost confidence slightly
      indicators,
      jobType
    };
  }
  
  /**
   * Analyze sentence structure for additional clues
   */
  private static analyzeSentenceStructure(text: string): {
    seekingScore: number;
    hiringScore: number;
    indicators: string[];
  } {
    let seekingScore = 0;
    let hiringScore = 0;
    const indicators: string[] = [];
    
    // First person pronouns at start suggest job seeking
    if (/^(i|me|mi|my)\b/i.test(text.trim())) {
      seekingScore += 1;
      indicators.push('First person start');
    }
    
    // "Need" or "want" at start usually means hiring
    if (/^(need|want|looking for|seeking)\b/i.test(text.trim())) {
      hiringScore += 1;
      indicators.push('Task-focused start');
    }
    
    // Check for price/payment mentions
    if (/\$\d+|\bpay\b|\brate\b|\bprice\b|\bcost\b/i.test(text)) {
      // If talking about "my rate" or "I charge" = seeking
      if (/\b(my|i|mi)\s+(rate|charge|price)/i.test(text)) {
        seekingScore += 1;
        indicators.push('Worker pricing mentioned');
      } else {
        hiringScore += 0.5;
        indicators.push('Payment mentioned');
      }
    }
    
    // Location context
    if (/\b(come to|at my|in my|to my)\b/i.test(text)) {
      hiringScore += 0.5;
      indicators.push('Employer location reference');
    }
    
    return { seekingScore, hiringScore, indicators };
  }
  
  /**
   * Get user-friendly label for the category
   */
  static getCategoryLabel(category: JobCategory): string {
    return category === 'find_work' 
      ? '👷 Worker Available' 
      : '💼 Job Posting';
  }
  
  /**
   * Get description for the category
   */
  static getCategoryDescription(category: JobCategory): string {
    return category === 'find_work'
      ? 'Someone looking for work opportunities'
      : 'Someone looking to hire workers';
  }
}