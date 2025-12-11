// Location Cache Service - Caches geocoding results to reduce API calls
interface CachedLocation {
  query: string;
  result: any;
  timestamp: number;
  hits: number;
}

export class LocationCache {
  private static cache: Map<string, CachedLocation> = new Map();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly MAX_CACHE_SIZE = 1000;
  
  /**
   * Get cached location result
   */
  static get(query: string): any | null {
    const key = this.normalizeQuery(query);
    const cached = this.cache.get(key);
    
    if (cached) {
      // Check if cache is still valid
      if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
        cached.hits++;
        return cached.result;
      } else {
        // Remove expired entry
        this.cache.delete(key);
      }
    }
    
    return null;
  }
  
  /**
   * Set cached location result
   */
  static set(query: string, result: any): void {
    const key = this.normalizeQuery(query);
    
    // Implement LRU eviction if cache is too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove least recently used entry
      let lruKey = '';
      let lruHits = Infinity;
      
      this.cache.forEach((value, key) => {
        if (value.hits < lruHits) {
          lruHits = value.hits;
          lruKey = key;
        }
      });
      
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }
    
    this.cache.set(key, {
      query,
      result,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  /**
   * Normalize query for consistent caching
   */
  private static normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Pre-populate cache with common Caribbean locations
   */
  static initializeCommonLocations(): void {
    const commonLocations = [
      { query: 'liguanea', result: { place_name: 'Liguanea', country: 'Jamaica', confidence: 1.0 } },
      { query: 'half way tree', result: { place_name: 'Half Way Tree', country: 'Jamaica', confidence: 1.0 } },
      { query: 'montego bay', result: { place_name: 'Montego Bay', country: 'Jamaica', confidence: 1.0 } },
      { query: 'spanish town', result: { place_name: 'Spanish Town', country: 'Jamaica', confidence: 1.0 } },
      { query: 'portmore', result: { place_name: 'Portmore', country: 'Jamaica', confidence: 1.0 } },
      { query: 'kingston', result: { place_name: 'Kingston', country: 'Jamaica', confidence: 1.0 } },
      { query: 'ocho rios', result: { place_name: 'Ocho Rios', country: 'Jamaica', confidence: 1.0 } },
      { query: 'port of spain', result: { place_name: 'Port of Spain', country: 'Trinidad and Tobago', confidence: 1.0 } },
      { query: 'bridgetown', result: { place_name: 'Bridgetown', country: 'Barbados', confidence: 1.0 } },
      { query: 'georgetown', result: { place_name: 'Georgetown', country: 'Guyana', confidence: 1.0 } }
    ];
    
    commonLocations.forEach(({ query, result }) => {
      this.set(query, result);
    });
  }
  
  /**
   * Get cache statistics
   */
  static getStats(): { size: number; hits: number; misses: number } {
    let totalHits = 0;
    this.cache.forEach(entry => {
      totalHits += entry.hits;
    });
    
    return {
      size: this.cache.size,
      hits: totalHits,
      misses: 0 // Would need to track this separately
    };
  }
}

// Initialize with common locations
LocationCache.initializeCommonLocations();