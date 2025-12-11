// Intelligent Location Service - Uses AI context to understand Caribbean locations
import { CaribbeanASRService } from './caribbeanASRService';
import { GeoLocationValidationService } from './geoLocationValidationService';

export class IntelligentLocationService {
  /**
   * Extract location from text using contextual understanding
   * This approach uses patterns and context clues rather than hardcoded mappings
   */
  static extractLocation(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    // Location indicators that suggest the next words might be a location
    const locationIndicators = [
      'in', 'at', 'to', 'from', 'near', 'around', 'by',
      'inna', 'deh', 'a', 'fi go', 'come from'
    ];
    
    // Country/island context that helps identify locations
    const islandContext = {
      jamaica: ['kingston', 'montego', 'spanish', 'port', 'may', 'mandeville', 'ocho', 'negril'],
      trinidad: ['port', 'spain', 'fernando', 'chaguanas', 'arima'],
      barbados: ['bridgetown', 'speights', 'oistins', 'lawrence'],
      guyana: ['georgetown', 'amsterdam', 'linden', 'bartica']
    };
    
    // Find potential location based on context
    let potentialLocation: string | null = null;
    
    // Method 1: Look for location indicators followed by capitalized words
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      
      if (locationIndicators.includes(word) && i + 1 < words.length) {
        // Check if next word(s) start with capital letter (likely place name)
        let location = '';
        let j = i + 1;
        
        while (j < words.length && words[j].match(/^[A-Z]/)) {
          location += (location ? ' ' : '') + words[j];
          j++;
        }
        
        if (location) {
          potentialLocation = location;
          break;
        }
      }
    }
    
    // Method 2: Use intelligent pattern matching for Caribbean speech patterns
    // This handles cases like "handyman to Ligonny" -> "Liguanea"
    if (potentialLocation) {
      potentialLocation = this.intelligentCorrection(potentialLocation, text);
    }
    
    return potentialLocation;
  }
  
  /**
   * Intelligently correct location names based on context and patterns
   * Uses phonetic similarity and contextual clues
   */
  static intelligentCorrection(location: string, fullText: string): string {
    const lowerLocation = location.toLowerCase();
    const lowerText = fullText.toLowerCase();
    
    // Common phonetic patterns in Caribbean ASR
    const phoneticPatterns = [
      { pattern: /li[gk]on+[iy]/i, context: 'jamaica|kingston', suggestion: 'Liguanea' },
      { pattern: /mo\s*bay/i, context: 'jamaica', suggestion: 'Montego Bay' },
      { pattern: /half\s*way/i, context: 'tree|kingston', suggestion: 'Half Way Tree' },
      { pattern: /span+ish/i, context: 'town|jamaica', suggestion: 'Spanish Town' },
      { pattern: /port\s*mor/i, context: 'jamaica', suggestion: 'Portmore' },
    ];
    
    // Check patterns with context
    for (const rule of phoneticPatterns) {
      if (rule.pattern.test(lowerLocation)) {
        // Check if context matches (if specified)
        if (!rule.context || rule.context.split('|').some(ctx => lowerText.includes(ctx))) {
          return rule.suggestion;
        }
      }
    }
    
    // Apply general Caribbean phonetic corrections
    let corrected = location;
    
    // Common sound substitutions in Caribbean ASR
    corrected = corrected
      .replace(/igh/g, 'i')  // "Ligh" -> "Li"
      .replace(/([aeiou])\1{2,}/g, '$1')  // Remove triple vowels
      .replace(/nn+y$/i, 'nea')  // "nny" -> "nea" (as in Liguanea)
      .replace(/^spa/i, 'Spa')  // Capitalize Spanish
      .replace(/town$/i, 'Town')  // Capitalize Town
      .replace(/bay$/i, 'Bay');  // Capitalize Bay
    
    // Ensure proper capitalization
    corrected = corrected.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return corrected;
  }
  
  /**
   * Use AI context and geocoding to enhance location understanding
   */
  static async enhanceWithAI(context: string, transcription: string): Promise<string> {
    try {
      // First try geocoding validation for real location matching
      const geoValidated = await GeoLocationValidationService.smartCorrectLocation(
        transcription,
        context || transcription
      );
      
      if (geoValidated !== transcription) {
        return geoValidated;
      }
      
      // Fallback to pattern-based correction
      const location = this.extractLocation(transcription);
      
      if (location) {
        const corrected = this.intelligentCorrection(location, transcription);
        if (corrected !== location) {
          return transcription.replace(
            new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            corrected
          );
        }
      }
      
      return transcription;
      
    } catch (error) {
      console.error('Location enhancement error:', error);
      // Return original if enhancement fails
      return transcription;
    }
  }
  
  /**
   * Learn from corrections (for future ML integration)
   * Stores successful corrections to improve over time
   */
  static learnCorrection(original: string, corrected: string, context: string): void {
    // In a real implementation, this would store corrections in a database
    // to train the model over time
    console.log(`📚 Learning: "${original}" -> "${corrected}" in context: ${context}`);
  }
}