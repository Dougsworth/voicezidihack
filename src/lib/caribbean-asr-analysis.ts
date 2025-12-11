// Advanced Caribbean ASR Analysis
// Analyzes transcribed speech for Caribbean context, job extraction, and cultural patterns

export type { CaribbeanASRResult } from '@/types';

import type { CaribbeanASRResult } from '@/types';

// Main analysis function that processes Caribbean speech
export async function analyzeCaribbeanSpeech(transcription: string): Promise<CaribbeanASRResult> {
  console.log('>à Starting Caribbean speech analysis...');
  
  
  // Analyze Caribbean accent markers
  const accent = analyzeAccent(transcription);
  
  // Extract speech patterns
  const speechPatterns = analyzeSpeechPatterns(transcription);
  
  // Extract job/work information
  const jobExtraction = extractJobInfo(transcription);
  
  // Identify Caribbean cultural context
  const caribbeanContext = analyzeCaribbeanContext(transcription);
  
  // Calculate overall confidence
  const confidence = calculateConfidence(transcription, accent, speechPatterns, jobExtraction);
  
  return {
    transcription,
    confidence,
    accent,
    speechPatterns,
    jobExtraction,
    caribbeanContext
  };
}

// Analyze Caribbean accent markers and patterns
function analyzeAccent(text: string): CaribbeanASRResult['accent'] {
  const lowerText = text.toLowerCase();
  const detected: string[] = [];
  let primary = 'general_caribbean';
  let confidence = 0.5;
  
  // Jamaican Patois markers
  const jamaicanPatterns = [
    /\bmi\b/, /\bdi\b/, /\bdem\b/, /\bdat\b/, /\byah\b/, /\bseh\b/, 
    /\bnuh\b/, /\bweh\b/, /\bmek\b/, /\bdeh\b/, /\bpon\b/, /\bing\b$/,
    /\bgwan\b/, /\byute\b/, /\bbredrin\b/, /\bsista\b/, /\bfimi\b/
  ];
  
  // Trinidad patterns
  const trinidadPatterns = [
    /\bgyul\b/, /\bfete\b/, /\blime\b/, /\btabanca\b/, /\bmamaguy\b/,
    /\bpalance\b/, /\bfas\b/, /\bchook\b/, /\bbacchanal\b/
  ];
  
  // Barbadian patterns
  const barbadianPatterns = [
    /\bbajan\b/, /\bcou\b/, /\bwunna\b/, /\bpelt\b/, /\bvex\b/
  ];
  
  // Check for Jamaican
  const jamaicanMatches = jamaicanPatterns.filter(pattern => pattern.test(lowerText)).length;
  if (jamaicanMatches > 0) {
    detected.push('jamaican');
    if (jamaicanMatches >= 2) {
      primary = 'jamaican';
      confidence = Math.min(0.9, 0.6 + (jamaicanMatches * 0.1));
    }
  }
  
  // Check for Trinidadian
  const trinidadMatches = trinidadPatterns.filter(pattern => pattern.test(lowerText)).length;
  if (trinidadMatches > 0) {
    detected.push('trinidadian');
    if (trinidadMatches >= jamaicanMatches) {
      primary = 'trinidadian';
      confidence = Math.min(0.9, 0.6 + (trinidadMatches * 0.1));
    }
  }
  
  // Check for Barbadian
  const barbadianMatches = barbadianPatterns.filter(pattern => pattern.test(lowerText)).length;
  if (barbadianMatches > 0) {
    detected.push('barbadian');
    if (barbadianMatches >= Math.max(jamaicanMatches, trinidadMatches)) {
      primary = 'barbadian';
      confidence = Math.min(0.9, 0.6 + (barbadianMatches * 0.1));
    }
  }
  
  // If no specific patterns detected, check for general Caribbean markers
  const generalCaribbeanPatterns = [
    /\baan\b/, /\bwid\b/, /\bfuh\b/, /\bdey\b/, /\bseh\b/, /\byuh\b/
  ];
  
  const generalMatches = generalCaribbeanPatterns.filter(pattern => pattern.test(lowerText)).length;
  if (detected.length === 0 && generalMatches > 0) {
    detected.push('general_caribbean');
    confidence = Math.min(0.7, 0.4 + (generalMatches * 0.1));
  }
  
  return {
    detected,
    primary,
    confidence
  };
}

// Analyze speech patterns and quality
function analyzeSpeechPatterns(text: string): CaribbeanASRResult['speechPatterns'] {
  const words = text.split(/\s+/);
  
  // Determine pace based on text characteristics
  let pace: 'slow' | 'normal' | 'fast' = 'normal';
  if (words.length < 30) pace = 'slow';
  else if (words.length > 100) pace = 'fast';
  
  // Determine clarity based on completeness and coherence
  let clarity: 'poor' | 'fair' | 'good' | 'excellent' = 'fair';
  const hasCompleteThoughts = /[.!?]/.test(text);
  const hasStructure = words.length > 10;
  const hasDetails = /\b(budget|pay|cost|price|location|area|time|when|where)\b/i.test(text);
  
  if (hasCompleteThoughts && hasStructure && hasDetails) {
    clarity = 'excellent';
  } else if (hasCompleteThoughts && hasStructure) {
    clarity = 'good';
  } else if (hasStructure) {
    clarity = 'fair';
  } else {
    clarity = 'poor';
  }
  
  // Determine formality
  let formality: 'casual' | 'semi-formal' | 'formal' = 'casual';
  const formalWords = /\b(require|request|professional|service|assistance|kindly|please|thank you)\b/i;
  const casualWords = /\b(need|want|help|fix|do|make|get)\b/i;
  
  if (formalWords.test(text) && !casualWords.test(text)) {
    formality = 'formal';
  } else if (formalWords.test(text) && casualWords.test(text)) {
    formality = 'semi-formal';
  }
  
  return {
    pace,
    clarity,
    formality
  };
}

// Extract job/work information from transcription
function extractJobInfo(text: string): CaribbeanASRResult['jobExtraction'] {
  const lowerText = text.toLowerCase();
  
  // Determine job type
  const jobPostingKeywords = ['need', 'looking for', 'want', 'require', 'hiring', 'help with', 'fix', 'repair'];
  const workRequestKeywords = ['i am', 'i\'m', 'available', 'i do', 'i offer', 'experienced', 'skilled', 'can provide'];
  
  const hasJobKeywords = jobPostingKeywords.some(keyword => lowerText.includes(keyword));
  const hasWorkKeywords = workRequestKeywords.some(keyword => lowerText.includes(keyword));
  
  let jobType: 'job_posting' | 'work_request' | 'unclear' = 'unclear';
  if (hasJobKeywords && !hasWorkKeywords) jobType = 'job_posting';
  else if (hasWorkKeywords && !hasJobKeywords) jobType = 'work_request';
  else if (hasJobKeywords) jobType = 'job_posting'; // Default to job posting if both
  
  // Extract skills
  const skillKeywords = [
    'plumbing', 'plumber', 'electrician', 'electrical', 'carpenter', 'carpentry',
    'mechanic', 'mechanical', 'cook', 'cooking', 'chef', 'cleaning', 'cleaner',
    'gardening', 'gardener', 'painting', 'painter', 'masonry', 'mason',
    'welding', 'welder', 'driving', 'driver', 'security', 'guard',
    'teaching', 'teacher', 'tutoring', 'tutor', 'childcare', 'babysitter',
    'hairstylist', 'barber', 'salon', 'manicure', 'pedicure', 'massage',
    'construction', 'builder', 'roofing', 'roofer', 'tiling', 'tiler',
    'graphic design', 'designer', 'photography', 'photographer', 'video',
    'computer', 'it support', 'web', 'website', 'repair', 'technician'
  ];
  
  const skills = skillKeywords.filter(skill => lowerText.includes(skill));
  
  // Extract location
  const jamaicanLocations = [
    'kingston', 'spanish town', 'montego bay', 'portmore', 'may pen',
    'old harbour', 'mandeville', 'savanna-la-mar', 'port antonio', 'ocho rios',
    'st. andrew', 'st. catherine', 'st. james', 'clarendon', 'manchester',
    'westmoreland', 'portland', 'st. ann', 'st. elizabeth', 'trelawny',
    'st. mary', 'st. thomas', 'hanover', 'parishes'
  ];
  
  const trinidadLocations = [
    'port of spain', 'san fernando', 'chaguanas', 'point fortin', 'arima',
    'diego martin', 'tunapuna', 'st. joseph', 'couva', 'sangre grande'
  ];
  
  const allLocations = [...jamaicanLocations, ...trinidadLocations];
  const location = allLocations.find(loc => lowerText.includes(loc)) || null;
  
  // Extract urgency
  const urgencyKeywords = {
    high: ['urgent', 'asap', 'emergency', 'immediately', 'right now', 'today'],
    medium: ['soon', 'this week', 'next week', 'quick'],
    low: ['when available', 'no rush', 'flexible']
  };
  
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (urgencyKeywords.high.some(word => lowerText.includes(word))) urgency = 'high';
  else if (urgencyKeywords.low.some(word => lowerText.includes(word))) urgency = 'low';
  
  // Extract experience level
  const experienceKeywords = {
    expert: ['experienced', 'expert', 'professional', 'certified', 'licensed', 'qualified'],
    intermediate: ['some experience', 'learning', 'growing'],
    beginner: ['new', 'beginner', 'starting', 'first time']
  };
  
  let experience: 'beginner' | 'intermediate' | 'expert' | 'unclear' = 'unclear';
  if (experienceKeywords.expert.some(word => lowerText.includes(word))) experience = 'expert';
  else if (experienceKeywords.intermediate.some(word => lowerText.includes(word))) experience = 'intermediate';
  else if (experienceKeywords.beginner.some(word => lowerText.includes(word))) experience = 'beginner';
  
  // Extract budget
  const budgetRegex = /(\d+(?:,\d+)*)\s*(?:jmd|dollars?|bucks?)/gi;
  const rangeRegex = /(\d+(?:,\d+)*)\s*(?:to|\-|and)\s*(\d+(?:,\d+)*)/gi;
  
  let budget = {
    amount: null as number | null,
    currency: 'JMD',
    type: 'negotiable' as 'fixed' | 'hourly' | 'negotiable'
  };
  
  const rangeMatch = rangeRegex.exec(text);
  const budgetMatch = budgetRegex.exec(text);
  
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''));
    const max = parseInt(rangeMatch[2].replace(/,/g, ''));
    budget.amount = Math.round((min + max) / 2);
    budget.type = 'negotiable';
  } else if (budgetMatch) {
    budget.amount = parseInt(budgetMatch[1].replace(/,/g, ''));
    budget.type = lowerText.includes('per hour') || lowerText.includes('hourly') ? 'hourly' : 'fixed';
  }
  
  return {
    jobType,
    skills,
    location,
    urgency,
    experience,
    budget
  };
}

// Analyze Caribbean cultural context and local terms
function analyzeCaribbeanContext(text: string): CaribbeanASRResult['caribbeanContext'] {
  const lowerText = text.toLowerCase();
  
  // Caribbean local terms
  const localTermsDict = [
    'ackee', 'saltfish', 'curry goat', 'jerk', 'patty', 'festival', 'bammy',
    'duppy', 'obeah', 'anansi', 'nyam', 'yam', 'plantain', 'breadfruit',
    'callaloo', 'doubles', 'roti', 'pelau', 'macaroni pie', 'oil down',
    'bake and shark', 'flying fish', 'cou cou', 'pepperpot',
    'bashment', 'dancehall', 'soca', 'calypso', 'reggae', 'steelpan',
    'cricket', 'dominos', 'football', 'netball'
  ];
  
  // Cultural references
  const culturalTerms = [
    'carnival', 'crop over', 'emancipation', 'independence', 'christmas morning',
    'new year\'s day', 'easter', 'labour day', 'heroes day', 'boxing day',
    'church', 'pastor', 'minister', 'revival', 'nine night',
    'family', 'cousin', 'auntie', 'uncle', 'granny', 'grandfather',
    'community', 'neighbor', 'yard', 'village', 'town'
  ];
  
  const localTerms = localTermsDict.filter(term => lowerText.includes(term));
  const culturalReferences = culturalTerms.filter(term => lowerText.includes(term));
  
  // Check for island-specific references
  const islandSpecific = /\b(jamaica|trinidad|barbados|guyana|bahamas|st\.\s*lucia|grenada|dominica|antigua|st\.\s*kitts)\b/i.test(text);
  
  return {
    localTerms,
    culturalReferences,
    islandSpecific
  };
}

// Calculate overall confidence score
function calculateConfidence(
  text: string,
  accent: CaribbeanASRResult['accent'],
  speechPatterns: CaribbeanASRResult['speechPatterns'],
  jobExtraction: CaribbeanASRResult['jobExtraction']
): number {
  let confidence = 0.5; // Base confidence
  
  // Boost based on accent detection
  confidence += accent.confidence * 0.3;
  
  // Boost based on speech clarity
  const clarityBoost = {
    poor: -0.1,
    fair: 0,
    good: 0.15,
    excellent: 0.25
  };
  confidence += clarityBoost[speechPatterns.clarity];
  
  // Boost based on job information completeness
  let jobInfoScore = 0;
  if (jobExtraction.jobType !== 'unclear') jobInfoScore += 0.1;
  if (jobExtraction.skills.length > 0) jobInfoScore += 0.1;
  if (jobExtraction.location) jobInfoScore += 0.1;
  if (jobExtraction.budget.amount) jobInfoScore += 0.1;
  
  confidence += jobInfoScore;
  
  // Boost for text length and structure
  const words = text.split(/\s+/).length;
  if (words > 20) confidence += 0.1;
  if (words > 50) confidence += 0.1;
  
  return Math.max(0.1, Math.min(0.95, confidence));
}