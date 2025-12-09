// Geolocation Service - Get accurate location for job postings
import type { CaribbeanASRResult } from '../types'

export interface GeolocationData {
  latitude: number
  longitude: number
  accuracy: number
  city?: string
  parish?: string
  island?: string
  country?: string
  address?: string
  postalCode?: string
  timestamp: number
}

export interface CaribbeanLocation extends GeolocationData {
  isCaribbean: boolean
  detectedIsland: string | null
  nearestTown?: string
  touristArea?: boolean
}

export class GeolocationService {
  private static readonly CARIBBEAN_BOUNDS = {
    north: 27.0,
    south: 10.0, 
    east: -59.0,
    west: -85.0
  }

  private static readonly CARIBBEAN_ISLANDS = {
    jamaica: {
      name: 'Jamaica',
      bounds: { north: 18.54, south: 17.70, east: -76.18, west: -78.37 },
      parishes: ['Kingston', 'St. Andrew', 'St. Catherine', 'Clarendon', 'Manchester', 'St. Elizabeth', 'Westmoreland', 'Hanover', 'St. James', 'Trelawny', 'St. Ann', 'St. Mary', 'Portland', 'St. Thomas']
    },
    trinidad: {
      name: 'Trinidad and Tobago',
      bounds: { north: 11.35, south: 10.03, east: -60.52, west: -61.95 },
      areas: ['Port of Spain', 'San Fernando', 'Chaguanas', 'Arima', 'Point Fortin', 'Scarborough']
    },
    barbados: {
      name: 'Barbados', 
      bounds: { north: 13.33, south: 13.04, east: -59.42, west: -59.65 },
      areas: ['Bridgetown', 'Speightstown', 'Oistins', 'Holetown', 'St. Lawrence Gap']
    },
    guyana: {
      name: 'Guyana',
      bounds: { north: 8.56, south: 1.18, east: -56.48, west: -61.38 },
      areas: ['Georgetown', 'Linden', 'New Amsterdam', 'Bartica', 'Anna Regina']
    },
    bahamas: {
      name: 'Bahamas',
      bounds: { north: 26.92, south: 20.91, east: -72.71, west: -80.48 },
      areas: ['Nassau', 'Freeport', 'Marsh Harbour', 'Cooper\'s Town', 'Dunmore Town']
    }
  }

  /**
   * Get user's current location with high accuracy
   */
  static async getCurrentLocation(highAccuracy = true): Promise<GeolocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 15000 : 10000,
        maximumAge: 60000 // Cache for 1 minute
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = position.coords
          
          try {
            // Get detailed location info from reverse geocoding
            const locationDetails = await this.reverseGeocode(coords.latitude, coords.longitude)
            
            resolve({
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
              timestamp: position.timestamp,
              ...locationDetails
            })
          } catch (error) {
            // Still return basic location even if geocoding fails
            resolve({
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy,
              timestamp: position.timestamp
            })
          }
        },
        (error) => {
          let errorMessage = 'Unable to get location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          reject(new Error(errorMessage))
        },
        options
      )
    })
  }

  /**
   * Enhance location with Caribbean-specific context
   */
  static async getCaribbeanLocation(coords?: GeolocationData): Promise<CaribbeanLocation> {
    let location: GeolocationData
    
    if (coords) {
      location = coords
    } else {
      location = await this.getCurrentLocation()
    }

    const isCaribbean = this.isInCaribbean(location.latitude, location.longitude)
    const detectedIsland = this.detectIsland(location.latitude, location.longitude)
    const nearestTown = await this.findNearestTown(location.latitude, location.longitude)
    const touristArea = this.isTouristArea(location.latitude, location.longitude)

    return {
      ...location,
      isCaribbean,
      detectedIsland,
      nearestTown,
      touristArea
    }
  }

  /**
   * Check if coordinates are in Caribbean region
   */
  static isInCaribbean(lat: number, lng: number): boolean {
    return (
      lat >= this.CARIBBEAN_BOUNDS.south &&
      lat <= this.CARIBBEAN_BOUNDS.north &&
      lng >= this.CARIBBEAN_BOUNDS.west &&
      lng <= this.CARIBBEAN_BOUNDS.east
    )
  }

  /**
   * Detect which Caribbean island based on coordinates
   */
  static detectIsland(lat: number, lng: number): string | null {
    for (const [key, island] of Object.entries(this.CARIBBEAN_ISLANDS)) {
      const bounds = island.bounds
      if (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      ) {
        return island.name
      }
    }
    return null
  }

  /**
   * Reverse geocode coordinates to get address details
   */
  private static async reverseGeocode(lat: number, lng: number): Promise<Partial<GeolocationData>> {
    try {
      // Using OpenStreetMap Nominatim (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'LinkUpWork-Caribbean/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Geocoding failed')
      }

      const data = await response.json()
      const address = data.address || {}

      return {
        city: address.city || address.town || address.village || address.hamlet,
        parish: address.state || address.county || address.state_district,
        country: address.country,
        address: data.display_name,
        postalCode: address.postcode
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error)
      return {}
    }
  }

  /**
   * Find nearest known town/city
   */
  private static async findNearestTown(lat: number, lng: number): Promise<string | undefined> {
    const island = this.detectIsland(lat, lng)
    if (!island) return undefined

    // Find the island data
    const islandData = Object.values(this.CARIBBEAN_ISLANDS).find(i => i.name === island)
    if (!islandData) return undefined

    const areas = 'areas' in islandData ? islandData.areas : islandData.parishes
    
    // For now, return the first major city (could be enhanced with distance calculation)
    return areas[0]
  }

  /**
   * Determine if location is in a tourist area (simplified)
   */
  private static isTouristArea(lat: number, lng: number): boolean {
    // Simplified check - could be enhanced with actual tourist zone data
    const island = this.detectIsland(lat, lng)
    if (!island) return false

    // Basic heuristic: coastal areas more likely to be tourist zones
    // This could be much more sophisticated with actual tourism data
    return Math.random() > 0.7 // Placeholder logic
  }

  /**
   * Get formatted location string for display
   */
  static formatLocation(location: CaribbeanLocation): string {
    const parts: string[] = []
    
    if (location.nearestTown) parts.push(location.nearestTown)
    if (location.parish && location.parish !== location.nearestTown) parts.push(location.parish)
    if (location.detectedIsland) parts.push(location.detectedIsland)
    
    return parts.length > 0 ? parts.join(', ') : 'Caribbean'
  }

  /**
   * Enhance ASR analysis with geolocation context
   */
  static enhanceASRWithLocation(
    analysis: CaribbeanASRResult, 
    location: CaribbeanLocation
  ): CaribbeanASRResult {
    // Override or enhance the detected location from speech
    const enhancedLocation = location.nearestTown || 
                           this.formatLocation(location) || 
                           analysis.jobExtraction.location

    // Boost accent confidence if location matches detected accent
    let accentConfidence = analysis.accent.confidence
    if (location.detectedIsland) {
      const islandKey = location.detectedIsland.toLowerCase()
      if (islandKey.includes('jamaica') && analysis.accent.primary === 'jamaican') {
        accentConfidence = Math.min(accentConfidence + 0.2, 1.0)
      } else if (islandKey.includes('trinidad') && analysis.accent.primary === 'trinidadian') {
        accentConfidence = Math.min(accentConfidence + 0.2, 1.0)
      } else if (islandKey.includes('barbados') && analysis.accent.primary === 'barbadian') {
        accentConfidence = Math.min(accentConfidence + 0.2, 1.0)
      } else if (islandKey.includes('guyana') && analysis.accent.primary === 'guyanese') {
        accentConfidence = Math.min(accentConfidence + 0.2, 1.0)
      }
    }

    return {
      ...analysis,
      accent: {
        ...analysis.accent,
        confidence: accentConfidence
      },
      jobExtraction: {
        ...analysis.jobExtraction,
        location: enhancedLocation
      },
      caribbeanContext: {
        ...analysis.caribbeanContext,
        islandSpecific: location.isCaribbean
      }
    }
  }

  /**
   * Request location permission with user-friendly messaging
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      const result = await navigator.permissions?.query({ name: 'geolocation' })
      return result?.state === 'granted'
    } catch {
      // Fallback: try to get location directly
      try {
        await this.getCurrentLocation(false)
        return true
      } catch {
        return false
      }
    }
  }
}