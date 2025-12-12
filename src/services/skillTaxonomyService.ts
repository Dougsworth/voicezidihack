// Caribbean-Specific Skill Taxonomy and Extraction Service
import { CARIBBEAN_COLORS } from '@/constants';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  implicitSkills: string[]; // Skills that typically come with this one
  caribbeanTerms: string[]; // Local/regional terms
  relatedSkills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert' | 'master';
  marketDemand: 'low' | 'medium' | 'high' | 'critical';
}

export type SkillCategory = 
  | 'construction' 
  | 'electrical' 
  | 'plumbing' 
  | 'automotive'
  | 'domestic' 
  | 'beauty' 
  | 'food_service'
  | 'technology'
  | 'agriculture'
  | 'marine'
  | 'healthcare'
  | 'education'
  | 'security'
  | 'hospitality';

export interface ExtractedSkillProfile {
  primarySkills: Skill[];
  implicitSkills: Skill[];
  suggestedSkills: Skill[];
  confidenceScore: number;
  skillCombinations: string[];
  marketValue: 'low' | 'medium' | 'high' | 'premium';
}

class SkillTaxonomyService {
  private static instance: SkillTaxonomyService;
  private skillDatabase: Skill[] = [];

  constructor() {
    this.initializeCaribbeanSkills();
  }

  static getInstance(): SkillTaxonomyService {
    if (!this.instance) {
      this.instance = new SkillTaxonomyService();
    }
    return this.instance;
  }

  private initializeCaribbeanSkills(): void {
    this.skillDatabase = [
      // Construction & Building
      {
        id: 'mason',
        name: 'Masonry',
        category: 'construction',
        aliases: ['mason', 'bricklayer', 'stonework', 'block work'],
        caribbeanTerms: ['block man', 'concrete work', 'foundation work'],
        implicitSkills: ['concrete mixing', 'measuring', 'leveling'],
        relatedSkills: ['carpenter', 'general_contractor', 'tile_work'],
        experienceLevel: 'intermediate',
        marketDemand: 'high'
      },
      {
        id: 'carpenter',
        name: 'Carpentry',
        category: 'construction',
        aliases: ['carpenter', 'wood work', 'cabinet maker', 'joiner'],
        caribbeanTerms: ['wood worker', 'furniture maker', 'roof work'],
        implicitSkills: ['measuring', 'tool_usage', 'problem_solving'],
        relatedSkills: ['mason', 'general_contractor', 'painter'],
        experienceLevel: 'intermediate',
        marketDemand: 'high'
      },
      {
        id: 'roofer',
        name: 'Roofing',
        category: 'construction',
        aliases: ['roofer', 'roof repair', 'roofing contractor'],
        caribbeanTerms: ['roof man', 'galvanize work', 'hurricane prep'],
        implicitSkills: ['safety_protocols', 'weather_assessment', 'measuring'],
        relatedSkills: ['carpenter', 'general_contractor'],
        experienceLevel: 'expert',
        marketDemand: 'critical'
      },

      // Electrical
      {
        id: 'electrician',
        name: 'Electrical Work',
        category: 'electrical',
        aliases: ['electrician', 'electrical', 'wiring', 'electric'],
        caribbeanTerms: ['light man', 'current work', 'wire man'],
        implicitSkills: ['safety_protocols', 'troubleshooting', 'code_compliance'],
        relatedSkills: ['ac_technician', 'general_contractor'],
        experienceLevel: 'expert',
        marketDemand: 'critical'
      },
      {
        id: 'ac_technician',
        name: 'Air Conditioning',
        category: 'electrical',
        aliases: ['ac repair', 'hvac', 'air conditioning', 'cooling'],
        caribbeanTerms: ['ac man', 'cooling specialist', 'fridge work'],
        implicitSkills: ['electrical_work', 'refrigeration', 'troubleshooting'],
        relatedSkills: ['electrician', 'appliance_repair'],
        experienceLevel: 'expert',
        marketDemand: 'critical'
      },

      // Plumbing
      {
        id: 'plumber',
        name: 'Plumbing',
        category: 'plumbing',
        aliases: ['plumber', 'pipe work', 'water system'],
        caribbeanTerms: ['pipe man', 'water work', 'cistern repair'],
        implicitSkills: ['problem_solving', 'tool_usage', 'water_systems'],
        relatedSkills: ['general_contractor', 'mason'],
        experienceLevel: 'intermediate',
        marketDemand: 'high'
      },

      // Automotive
      {
        id: 'mechanic',
        name: 'Auto Mechanics',
        category: 'automotive',
        aliases: ['mechanic', 'car repair', 'auto repair', 'vehicle service'],
        caribbeanTerms: ['car man', 'engine work', 'motor work'],
        implicitSkills: ['diagnostics', 'tool_usage', 'problem_solving'],
        relatedSkills: ['electrician', 'welder'],
        experienceLevel: 'intermediate',
        marketDemand: 'high'
      },

      // Domestic Services
      {
        id: 'cleaner',
        name: 'Cleaning Services',
        category: 'domestic',
        aliases: ['cleaner', 'housekeeper', 'cleaning', 'domestic help'],
        caribbeanTerms: ['helper', 'maid', 'house girl', 'domestic'],
        implicitSkills: ['time_management', 'attention_to_detail', 'trustworthiness'],
        relatedSkills: ['childcare', 'cooking', 'laundry'],
        experienceLevel: 'beginner',
        marketDemand: 'high'
      },
      {
        id: 'gardener',
        name: 'Gardening & Landscaping',
        category: 'agriculture',
        aliases: ['gardener', 'landscaping', 'yard work', 'lawn care'],
        caribbeanTerms: ['yard man', 'ground keeper', 'plant work'],
        implicitSkills: ['plant_knowledge', 'seasonal_planning', 'tool_usage'],
        relatedSkills: ['tree_cutting', 'general_labor'],
        experienceLevel: 'intermediate',
        marketDemand: 'medium'
      },
      {
        id: 'cook',
        name: 'Cooking & Food Prep',
        category: 'food_service',
        aliases: ['cook', 'chef', 'food preparation', 'catering'],
        caribbeanTerms: ['cook', 'kitchen help', 'food maker'],
        implicitSkills: ['food_safety', 'time_management', 'creativity'],
        relatedSkills: ['cleaner', 'event_planning'],
        experienceLevel: 'intermediate',
        marketDemand: 'medium'
      },

      // Beauty & Personal Care
      {
        id: 'hairdresser',
        name: 'Hair Styling',
        category: 'beauty',
        aliases: ['hairdresser', 'hair stylist', 'barber', 'salon'],
        caribbeanTerms: ['hair dresser', 'salon worker', 'beauty specialist'],
        implicitSkills: ['customer_service', 'creativity', 'hygiene_protocols'],
        relatedSkills: ['nail_technician', 'makeup_artist'],
        experienceLevel: 'intermediate',
        marketDemand: 'medium'
      },

      // Technology
      {
        id: 'computer_repair',
        name: 'Computer Repair',
        category: 'technology',
        aliases: ['computer repair', 'tech support', 'it support', 'laptop fix'],
        caribbeanTerms: ['computer man', 'tech person', 'computer fix'],
        implicitSkills: ['troubleshooting', 'hardware_knowledge', 'customer_service'],
        relatedSkills: ['phone_repair', 'network_setup'],
        experienceLevel: 'intermediate',
        marketDemand: 'high'
      },

      // Security
      {
        id: 'security_guard',
        name: 'Security Services',
        category: 'security',
        aliases: ['security', 'watchman', 'guard', 'security officer'],
        caribbeanTerms: ['watchie', 'security man', 'guard man'],
        implicitSkills: ['vigilance', 'communication', 'conflict_resolution'],
        relatedSkills: ['driver', 'general_labor'],
        experienceLevel: 'beginner',
        marketDemand: 'medium'
      },

      // Marine & Fishing
      {
        id: 'fisherman',
        name: 'Fishing & Marine',
        category: 'marine',
        aliases: ['fisherman', 'fishing', 'boat work', 'marine'],
        caribbeanTerms: ['fisherman', 'boat man', 'sea work'],
        implicitSkills: ['navigation', 'weather_reading', 'equipment_maintenance'],
        relatedSkills: ['mechanic', 'general_labor'],
        experienceLevel: 'intermediate',
        marketDemand: 'medium'
      }
    ];
  }

  // Extract skills from Caribbean voice transcription
  async extractSkills(transcription: string, useAI: boolean = true): Promise<ExtractedSkillProfile> {
    const text = transcription.toLowerCase();
    const foundSkills: Skill[] = [];
    const implicitSkills: Skill[] = [];
    const suggestedSkills: Skill[] = [];

    // Direct skill matching
    for (const skill of this.skillDatabase) {
      const allTerms = [...skill.aliases, ...skill.caribbeanTerms, skill.name.toLowerCase()];
      
      for (const term of allTerms) {
        if (text.includes(term.toLowerCase())) {
          foundSkills.push(skill);
          
          // Add implicit skills
          for (const implicitSkillName of skill.implicitSkills) {
            const implicitSkill = this.findSkillByTerm(implicitSkillName);
            if (implicitSkill && !foundSkills.includes(implicitSkill)) {
              implicitSkills.push(implicitSkill);
            }
          }
          
          // Add related skills as suggestions
          for (const relatedSkillName of skill.relatedSkills) {
            const relatedSkill = this.findSkillByTerm(relatedSkillName);
            if (relatedSkill && !foundSkills.includes(relatedSkill) && !suggestedSkills.includes(relatedSkill)) {
              suggestedSkills.push(relatedSkill);
            }
          }
          break;
        }
      }
    }

    // Use AI for advanced extraction if available (but only for meaningful transcriptions)
    if (useAI && foundSkills.length === 0 && transcription.trim().length > 10) {
      const aiExtracted = await this.extractWithAI(transcription);
      foundSkills.push(...aiExtracted);
    }

    // Calculate market value based on skill combination
    const marketValue = this.calculateMarketValue(foundSkills);
    
    // Generate skill combinations
    const skillCombinations = this.generateSkillCombinations(foundSkills);

    return {
      primarySkills: foundSkills,
      implicitSkills,
      suggestedSkills: suggestedSkills.slice(0, 5), // Limit suggestions
      confidenceScore: foundSkills.length > 0 ? 0.85 : 0.3,
      skillCombinations,
      marketValue
    };
  }

  private findSkillByTerm(term: string): Skill | undefined {
    return this.skillDatabase.find(skill => 
      skill.id === term || 
      skill.name.toLowerCase().includes(term.toLowerCase()) ||
      skill.aliases.some(alias => alias.toLowerCase().includes(term.toLowerCase()))
    );
  }

  private async extractWithAI(transcription: string): Promise<Skill[]> {
    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      if (!OPENAI_API_KEY) return [];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Extract specific skills from this Caribbean job/work description: "${transcription}"
            
Return only a JSON array of skill names that match these categories:
${this.skillDatabase.map(s => s.name).join(', ')}

Focus on:
- Explicit mentions of trades/skills
- Implied capabilities ("fix AC" = Air Conditioning repair)
- Caribbean terminology ("yard man" = Gardening)

Return format: ["skill1", "skill2"]`
          }],
          temperature: 0.1,
          max_tokens: 150
        })
      });

      const data = await response.json();
      const skillNames = JSON.parse(data.choices[0]?.message?.content || '[]');
      
      return skillNames.map((name: string) => this.findSkillByTerm(name)).filter(Boolean);
    } catch (error) {
      console.error('AI skill extraction failed:', error);
      return [];
    }
  }

  private calculateMarketValue(skills: Skill[]): 'low' | 'medium' | 'high' | 'premium' {
    if (skills.length === 0) return 'low';
    
    const demandScores = skills.map(skill => {
      switch (skill.marketDemand) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 1;
      }
    });

    const avgDemand = demandScores.reduce((a, b) => a + b, 0) / demandScores.length;
    const skillCount = skills.length;

    // Premium: High-demand skills + multiple skills
    if (avgDemand >= 3.5 && skillCount >= 3) return 'premium';
    if (avgDemand >= 3) return 'high';
    if (avgDemand >= 2) return 'medium';
    return 'low';
  }

  private generateSkillCombinations(skills: Skill[]): string[] {
    if (skills.length < 2) return [];
    
    const combinations: string[] = [];
    
    // Common Caribbean skill combinations
    const skillNames = skills.map(s => s.name);
    
    if (skillNames.includes('Masonry') && skillNames.includes('Carpentry')) {
      combinations.push('Construction Contractor');
    }
    if (skillNames.includes('Electrical Work') && skillNames.includes('Air Conditioning')) {
      combinations.push('HVAC Specialist');
    }
    if (skillNames.includes('Plumbing') && skillNames.includes('Electrical Work')) {
      combinations.push('Multi-Trade Technician');
    }
    if (skillNames.includes('Cleaning Services') && skillNames.includes('Cooking & Food Prep')) {
      combinations.push('Full-Service Domestic Help');
    }
    
    return combinations;
  }

  // Get skills by category
  getSkillsByCategory(category: SkillCategory): Skill[] {
    return this.skillDatabase.filter(skill => skill.category === category);
  }

  // Get high-demand skills
  getHighDemandSkills(): Skill[] {
    return this.skillDatabase.filter(skill => 
      skill.marketDemand === 'high' || skill.marketDemand === 'critical'
    );
  }

  // Suggest skills based on existing ones
  suggestComplementarySkills(existingSkills: string[]): Skill[] {
    const suggestions: Skill[] = [];
    
    for (const skillName of existingSkills) {
      const skill = this.findSkillByTerm(skillName);
      if (skill) {
        for (const relatedSkillName of skill.relatedSkills) {
          const relatedSkill = this.findSkillByTerm(relatedSkillName);
          if (relatedSkill && !suggestions.includes(relatedSkill)) {
            suggestions.push(relatedSkill);
          }
        }
      }
    }
    
    return suggestions.slice(0, 10); // Limit suggestions
  }
}

export default SkillTaxonomyService;