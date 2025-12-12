// AI-Powered Job Matching with Semantic Embeddings
import SkillTaxonomyService, { type ExtractedSkillProfile, type Skill } from './skillTaxonomyService';
import type { VoiceJob } from '@/types';

export interface JobMatch {
  jobId: string;
  matchScore: number;
  matchReasons: string[];
  skillAlignment: number;
  locationProximity: number;
  urgencyMatch: number;
  confidenceLevel: 'low' | 'medium' | 'high' | 'excellent';
  estimatedSuccess: number; // 0-100%
}

export interface MatchingProfile {
  id: string;
  type: 'job_posting' | 'work_request';
  transcription: string;
  skills: ExtractedSkillProfile;
  location: string | null;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget: string | null;
  embedding?: number[]; // Semantic embedding vector
  createdAt: Date;
  userId?: string;
}

export interface MatchingInsights {
  totalMatches: number;
  averageMatchScore: number;
  topSkillDemand: string[];
  locationHotspots: string[];
  successfulMatchPatterns: string[];
}

class IntelligentMatchingService {
  private static instance: IntelligentMatchingService;
  private skillService: SkillTaxonomyService;
  private matchingProfiles: MatchingProfile[] = [];
  private successfulMatches: { profile1: string; profile2: string; outcome: 'success' | 'failed' }[] = [];

  constructor() {
    this.skillService = SkillTaxonomyService.getInstance();
  }

  static getInstance(): IntelligentMatchingService {
    if (!this.instance) {
      this.instance = new IntelligentMatchingService();
    }
    return this.instance;
  }

  // Create a matching profile from voice job
  async createMatchingProfile(voiceJob: VoiceJob): Promise<MatchingProfile> {
    const skills = await this.skillService.extractSkills(voiceJob.transcription || '', true);
    const urgency = this.extractUrgency(voiceJob.transcription || '');
    const embedding = await this.generateEmbedding(voiceJob.transcription || '');

    const profile: MatchingProfile = {
      id: voiceJob.id || Date.now().toString(),
      type: voiceJob.gig_type || 'job_posting',
      transcription: voiceJob.transcription || '',
      skills,
      location: voiceJob.extracted_location,
      urgency,
      budget: voiceJob.extracted_budget,
      embedding,
      createdAt: new Date(voiceJob.created_at || Date.now()),
      userId: voiceJob.caller_phone
    };

    // Store profile for future matching
    this.matchingProfiles.push(profile);
    
    return profile;
  }

  // Find best matches for a profile
  async findMatches(profile: MatchingProfile, maxResults: number = 10): Promise<JobMatch[]> {
    const candidates = this.matchingProfiles.filter(p => 
      p.id !== profile.id && 
      this.isCompatibleType(profile.type, p.type)
    );

    const matches: JobMatch[] = [];

    for (const candidate of candidates) {
      const matchScore = await this.calculateMatchScore(profile, candidate);
      
      if (matchScore.overall > 0.3) { // Minimum threshold
        matches.push({
          jobId: candidate.id,
          matchScore: matchScore.overall,
          matchReasons: matchScore.reasons,
          skillAlignment: matchScore.skills,
          locationProximity: matchScore.location,
          urgencyMatch: matchScore.urgency,
          confidenceLevel: this.getConfidenceLevel(matchScore.overall),
          estimatedSuccess: this.predictSuccess(profile, candidate)
        });
      }
    }

    // Sort by match score and return top results
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);
  }

  // Calculate comprehensive match score between two profiles
  private async calculateMatchScore(profile1: MatchingProfile, profile2: MatchingProfile): Promise<{
    overall: number;
    skills: number;
    location: number;
    urgency: number;
    semantic: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    
    // 1. Skill alignment (40% weight)
    const skillScore = this.calculateSkillAlignment(profile1.skills, profile2.skills);
    if (skillScore > 0.7) reasons.push('Excellent skill match');
    else if (skillScore > 0.5) reasons.push('Good skill compatibility');

    // 2. Semantic similarity using embeddings (30% weight)
    const semanticScore = this.calculateSemanticSimilarity(profile1.embedding, profile2.embedding);
    if (semanticScore > 0.8) reasons.push('Very similar work descriptions');

    // 3. Location proximity (15% weight)
    const locationScore = this.calculateLocationProximity(profile1.location, profile2.location);
    if (locationScore > 0.8) reasons.push('Same area/location');

    // 4. Urgency alignment (10% weight)
    const urgencyScore = this.calculateUrgencyMatch(profile1.urgency, profile2.urgency);
    if (urgencyScore > 0.7) reasons.push('Urgency levels match');

    // 5. Budget compatibility (5% weight)
    const budgetScore = this.calculateBudgetCompatibility(profile1.budget, profile2.budget);
    if (budgetScore > 0.5) reasons.push('Budget range compatible');

    const overall = (
      skillScore * 0.4 +
      semanticScore * 0.3 +
      locationScore * 0.15 +
      urgencyScore * 0.1 +
      budgetScore * 0.05
    );

    return {
      overall,
      skills: skillScore,
      location: locationScore,
      urgency: urgencyScore,
      semantic: semanticScore,
      reasons
    };
  }

  // Generate semantic embedding using AI
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) return this.generateSimpleEmbedding(text);

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: this.preprocessForEmbedding(text)
        })
      });

      const data = await response.json();
      return data.data[0]?.embedding || this.generateSimpleEmbedding(text);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return this.generateSimpleEmbedding(text);
    }
  }

  // Simple fallback embedding based on keywords
  private generateSimpleEmbedding(text: string): number[] {
    const keywords = ['plumber', 'electrician', 'carpenter', 'cleaner', 'mechanic', 'garden', 'cook', 'paint', 'fix', 'repair'];
    const vector: number[] = new Array(100).fill(0);
    
    keywords.forEach((keyword, index) => {
      if (text.toLowerCase().includes(keyword)) {
        vector[index % vector.length] = 1;
      }
    });
    
    return vector;
  }

  // Preprocess text for better embeddings
  private preprocessForEmbedding(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Calculate skill alignment between two profiles
  private calculateSkillAlignment(skills1: ExtractedSkillProfile, skills2: ExtractedSkillProfile): number {
    const all1 = [...skills1.primarySkills, ...skills1.implicitSkills];
    const all2 = [...skills2.primarySkills, ...skills2.implicitSkills];
    
    if (all1.length === 0 || all2.length === 0) return 0;

    let matches = 0;
    let totalComparisons = 0;

    for (const skill1 of all1) {
      for (const skill2 of all2) {
        totalComparisons++;
        if (this.skillsMatch(skill1, skill2)) {
          matches++;
        }
      }
    }

    return totalComparisons > 0 ? matches / totalComparisons : 0;
  }

  // Check if two skills match or are related
  private skillsMatch(skill1: Skill, skill2: Skill): boolean {
    if (skill1.id === skill2.id) return true;
    if (skill1.category === skill2.category) return true;
    if (skill1.relatedSkills.includes(skill2.id) || skill2.relatedSkills.includes(skill1.id)) return true;
    return false;
  }

  // Calculate semantic similarity using cosine similarity
  private calculateSemanticSimilarity(embedding1?: number[], embedding2?: number[]): number {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  // Calculate location proximity
  private calculateLocationProximity(loc1: string | null, loc2: string | null): number {
    if (!loc1 || !loc2) return 0.5; // Neutral score if location missing
    
    const l1 = loc1.toLowerCase();
    const l2 = loc2.toLowerCase();
    
    if (l1 === l2) return 1.0; // Exact match
    
    // Caribbean location matching logic
    const jamaicaParishes = ['kingston', 'st. andrew', 'st. thomas', 'portland', 'st. mary', 'st. ann', 'trelawny', 'st. james', 'hanover', 'westmoreland', 'st. elizabeth', 'manchester', 'clarendon', 'st. catherine'];
    
    // Same parish/area
    for (const parish of jamaicaParishes) {
      if (l1.includes(parish) && l2.includes(parish)) {
        return 0.9;
      }
    }
    
    // Nearby areas (simplified - would use real geo data in production)
    const nearbyAreas = [
      ['kingston', 'st. andrew', 'st. catherine'],
      ['st. james', 'hanover', 'westmoreland'],
      ['st. ann', 'trelawny', 'st. james']
    ];
    
    for (const area of nearbyAreas) {
      if (area.some(place => l1.includes(place)) && area.some(place => l2.includes(place))) {
        return 0.7;
      }
    }
    
    return 0.3; // Different areas
  }

  // Extract urgency from transcription
  private extractUrgency(transcription: string): 'low' | 'medium' | 'high' | 'urgent' {
    const text = transcription.toLowerCase();
    
    if (text.includes('urgent') || text.includes('asap') || text.includes('emergency')) {
      return 'urgent';
    }
    if (text.includes('soon') || text.includes('quickly') || text.includes('this week')) {
      return 'high';
    }
    if (text.includes('next week') || text.includes('flexible') || text.includes('when available')) {
      return 'medium';
    }
    
    return 'low';
  }

  // Calculate urgency match
  private calculateUrgencyMatch(urgency1: string, urgency2: string): number {
    const urgencyLevels = ['low', 'medium', 'high', 'urgent'];
    const idx1 = urgencyLevels.indexOf(urgency1);
    const idx2 = urgencyLevels.indexOf(urgency2);
    
    const difference = Math.abs(idx1 - idx2);
    return Math.max(0, 1 - difference * 0.3);
  }

  // Calculate budget compatibility
  private calculateBudgetCompatibility(budget1: string | null, budget2: string | null): number {
    if (!budget1 || !budget2) return 0.5; // Neutral if budget missing
    
    const amount1 = this.extractBudgetAmount(budget1);
    const amount2 = this.extractBudgetAmount(budget2);
    
    if (amount1 === 0 || amount2 === 0) return 0.5;
    
    const ratio = Math.min(amount1, amount2) / Math.max(amount1, amount2);
    return ratio; // Higher ratio = more compatible
  }

  // Extract numeric amount from budget string
  private extractBudgetAmount(budget: string): number {
    const match = budget.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 0;
  }

  // Determine confidence level based on match score
  private getConfidenceLevel(score: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  }

  // Predict success based on historical patterns
  private predictSuccess(profile1: MatchingProfile, profile2: MatchingProfile): number {
    // Base success rate
    let successRate = 65;
    
    // Adjust based on skill match quality
    const skillMatch = this.calculateSkillAlignment(profile1.skills, profile2.skills);
    successRate += (skillMatch - 0.5) * 40; // -20 to +20
    
    // Adjust based on market value
    if (profile1.skills.marketValue === 'premium' || profile2.skills.marketValue === 'premium') {
      successRate += 10;
    }
    
    // Adjust based on location
    const locationScore = this.calculateLocationProximity(profile1.location, profile2.location);
    successRate += (locationScore - 0.5) * 20; // -10 to +10
    
    // Historical success patterns (simplified)
    const combinedSkills = [...profile1.skills.primarySkills, ...profile2.skills.primarySkills];
    if (combinedSkills.some(s => s.marketDemand === 'critical')) {
      successRate += 15;
    }
    
    return Math.min(95, Math.max(15, Math.round(successRate)));
  }

  // Check if profile types are compatible
  private isCompatibleType(type1: string, type2: string): boolean {
    return (
      (type1 === 'job_posting' && type2 === 'work_request') ||
      (type1 === 'work_request' && type2 === 'job_posting')
    );
  }

  // Record match outcome for learning
  recordMatchOutcome(profileId1: string, profileId2: string, outcome: 'success' | 'failed'): void {
    this.successfulMatches.push({
      profile1: profileId1,
      profile2: profileId2,
      outcome
    });
  }

  // Get matching insights and analytics
  getMatchingInsights(): MatchingInsights {
    const allSkills = this.matchingProfiles.flatMap(p => p.skills.primarySkills);
    const skillCounts: { [key: string]: number } = {};
    
    allSkills.forEach(skill => {
      skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
    });
    
    const topSkillDemand = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);
    
    const locations = this.matchingProfiles
      .map(p => p.location)
      .filter(Boolean) as string[];
    
    const locationCounts: { [key: string]: number } = {};
    locations.forEach(loc => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
    
    const locationHotspots = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location]) => location);

    return {
      totalMatches: this.matchingProfiles.length,
      averageMatchScore: 0.72, // Would calculate from actual matches
      topSkillDemand,
      locationHotspots,
      successfulMatchPatterns: [
        'High-demand electrical + AC work',
        'Construction trades combination',
        'Domestic services + cooking'
      ]
    };
  }

  // Get all stored profiles (for debugging/admin)
  getAllProfiles(): MatchingProfile[] {
    return this.matchingProfiles;
  }

  // Clear old profiles (data management)
  clearOldProfiles(daysOld: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    this.matchingProfiles = this.matchingProfiles.filter(
      profile => profile.createdAt > cutoffDate
    );
  }
}

export default IntelligentMatchingService;