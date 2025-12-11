// Geo Location Validation Service - Uses real map APIs to validate and correct location names
import { levenshteinDistance } from '@/lib/utils';
import { LocationCache } from './locationCache';

interface GeocodingResult {
  formatted_address: string;
  place_name: string;
  confidence: number;
  country: string;
  locality?: string;
  region?: string;
}

export class GeoLocationValidationService {
  // Using OpenStreetMap's Nominatim API (free, no API key required)
  private static readonly NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
  
  // Caribbean countries to focus our searches
  private static readonly CARIBBEAN_COUNTRIES = [
    'Jamaica', 'Trinidad and Tobago', 'Barbados', 'Guyana',
    'Saint Lucia', 'Grenada', 'Saint Vincent and the Grenadines',
    'Antigua and Barbuda', 'Dominica', 'Saint Kitts and Nevis'
  ];
  
  /**
   * Validate and correct a location name using real geocoding data
   */
  static async validateLocation(
    locationText: string, 
    countryHint?: string
  ): Promise<GeocodingResult | null> {
    try {
      // Clean the input
      const cleaned = locationText.trim().replace(/[^\w\s-]/g, '');
      
      // Check cache first
      const cacheKey = `${cleaned}:${countryHint || 'any'}`;
      const cached = LocationCache.get(cacheKey);
      if (cached) {
        console.log(`📦 Location found in cache: ${cleaned}`);
        return cached;
      }
      
      // Try with country hint first if provided
      let result = null;
      
      if (countryHint) {
        result = await this.searchLocation(cleaned, countryHint);
        if (result) {
          LocationCache.set(cacheKey, result);
          return result;
        }
      }
      
      // Try each Caribbean country
      for (const country of this.CARIBBEAN_COUNTRIES) {
        result = await this.searchLocation(cleaned, country);
        if (result && result.confidence > 0.5) {
          LocationCache.set(cacheKey, result);
          return result;
        }
      }
      
      // Try without country restriction
      result = await this.searchLocation(cleaned);
      if (result) {
        LocationCache.set(cacheKey, result);
      }
      return result;
      
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }
  
  /**
   * Search for a location using Nominatim API
   */
  private static async searchLocation(
    query: string, 
    country?: string
  ): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
      q: country ? `${query}, ${country}` : query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
      'accept-language': 'en'
    });
    
    // Add country code restriction if known
    if (country === 'Jamaica') params.append('countrycodes', 'jm');
    if (country === 'Trinidad and Tobago') params.append('countrycodes', 'tt');
    if (country === 'Barbados') params.append('countrycodes', 'bb');
    if (country === 'Guyana') params.append('countrycodes', 'gy');
    
    try {
      const response = await fetch(`${this.NOMINATIM_API}?${params}`, {
        headers: {
          'User-Agent': 'VoiceGigConnect/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const results = await response.json();
      
      if (results.length === 0) {
        return null;
      }
      
      // Find best match using fuzzy matching
      const bestMatch = this.findBestMatch(query, results);
      
      if (bestMatch) {
        return {
          formatted_address: bestMatch.display_name,
          place_name: this.extractPlaceName(bestMatch),
          confidence: this.calculateConfidence(query, bestMatch),
          country: bestMatch.address?.country || '',
          locality: bestMatch.address?.city || bestMatch.address?.town || bestMatch.address?.village,
          region: bestMatch.address?.state || bestMatch.address?.county
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Nominatim API error:', error);
      return null;
    }
  }
  
  /**
   * Find the best match from geocoding results using fuzzy matching
   */
  private static findBestMatch(query: string, results: any[]): any {
    let bestMatch = null;
    let bestScore = Infinity;
    
    const queryLower = query.toLowerCase();
    
    for (const result of results) {
      // Extract key location names
      const placeName = this.extractPlaceName(result).toLowerCase();
      const displayName = result.display_name.toLowerCase();
      
      // Calculate distances
      const placeDistance = levenshteinDistance(queryLower, placeName);
      const displayDistance = levenshteinDistance(queryLower, displayName);
      
      // Use the better score
      const score = Math.min(placeDistance, displayDistance * 0.5); // Prefer place name matches
      
      if (score < bestScore) {
        bestScore = score;
        bestMatch = result;
      }
    }
    
    // Only return if it's a reasonable match
    if (bestScore <= queryLower.length * 0.4) {
      return bestMatch;
    }
    
    return results[0]; // Default to first result
  }
  
  /**
   * Extract the most relevant place name from geocoding result
   */
  private static extractPlaceName(result: any): string {
    const address = result.address || {};
    
    // Priority order for Caribbean locations
    return (
      address.suburb ||
      address.neighbourhood ||
      address.village ||
      address.town ||
      address.city ||
      address.municipality ||
      result.name ||
      'Unknown'
    );
  }
  
  /**
   * Calculate confidence score for a match
   */
  private static calculateConfidence(query: string, result: any): number {
    const placeName = this.extractPlaceName(result);
    const distance = levenshteinDistance(query.toLowerCase(), placeName.toLowerCase());
    
    // Calculate confidence (0-1) based on edit distance
    const maxDistance = Math.max(query.length, placeName.length);
    const similarity = 1 - (distance / maxDistance);
    
    // Boost confidence if it's in a Caribbean country
    const isCaribbean = this.CARIBBEAN_COUNTRIES.some(
      country => result.address?.country?.includes(country)
    );
    
    return Math.min(similarity * (isCaribbean ? 1.2 : 1), 1);
  }
  
  /**
   * Smart location correction using geocoding validation
   */
  static async smartCorrectLocation(
    transcribedText: string,
    fullContext: string
  ): Promise<string> {
    // Extract potential location from text
    const locationMatch = transcribedText.match(
      /(?:in|at|to|from|near|around|inna|deh|a)\s+([A-Z][a-zA-Z\s]+?)(?:,|\.|\s+(?:jamaica|trinidad|barbados|guyana))/i
    );
    
    if (!locationMatch) {
      return transcribedText;
    }
    
    const potentialLocation = locationMatch[1].trim();
    
    // Detect country from context
    let countryHint = null;
    if (fullContext.toLowerCase().includes('jamaica')) countryHint = 'Jamaica';
    else if (fullContext.toLowerCase().includes('trinidad')) countryHint = 'Trinidad and Tobago';
    else if (fullContext.toLowerCase().includes('barbados')) countryHint = 'Barbados';
    else if (fullContext.toLowerCase().includes('guyana')) countryHint = 'Guyana';
    
    // Validate and correct the location
    const validated = await this.validateLocation(potentialLocation, countryHint);
    
    if (validated && validated.confidence > 0.6) {
      // Replace with the correct place name
      const correctedText = transcribedText.replace(
        potentialLocation,
        validated.place_name
      );
      
      console.log(`📍 Location validated: "${potentialLocation}" → "${validated.place_name}" (${Math.round(validated.confidence * 100)}% confidence)`);
      
      return correctedText;
    }
    
    return transcribedText;
  }
}