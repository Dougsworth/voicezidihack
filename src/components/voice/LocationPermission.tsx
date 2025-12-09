import { useState } from 'react'
import { MapPin, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react'
import { Button } from '../ui/button'

interface LocationPermissionProps {
  onLocationGranted: (granted: boolean) => void
  isRequired?: boolean
}

export default function LocationPermission({ 
  onLocationGranted, 
  isRequired = false 
}: LocationPermissionProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle')
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const requestLocation = async () => {
    setStatus('requesting')
    
    try {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setStatus('granted')
          setAccuracy(position.coords.accuracy)
          onLocationGranted(true)
        },
        (error) => {
          setStatus('denied')
          onLocationGranted(false)
        },
        options
      )
    } catch (error) {
      setStatus('denied')
      onLocationGranted(false)
    }
  }

  const skipLocation = () => {
    onLocationGranted(false)
  }

  if (status === 'granted') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <div>
            <p className="font-medium">Location access granted!</p>
            <p className="text-sm">
              Accuracy: ~{accuracy ? Math.round(accuracy) : '?'} meters
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
        
        <h3 className="font-bold text-blue-900 mb-2">
          Enable Location for Better Job Matching
        </h3>
        
        <div className="text-sm text-blue-700 mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span><strong>Accurate job matching</strong> with nearby employers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span><strong>Automatic location tagging</strong> for your posts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span><strong>Island-specific opportunities</strong> in your area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span><strong>Walking distance jobs</strong> prioritized</span>
          </div>
        </div>

        {status === 'denied' && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              <p className="text-sm">
                Location access was denied. Jobs will use general Caribbean region.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={requestLocation}
            disabled={status === 'requesting'}
            className="w-full"
            variant="default"
          >
            {status === 'requesting' ? (
              <>
                <Navigation className="w-4 h-4 mr-2 animate-spin" />
                Getting your location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Enable Location Access
              </>
            )}
          </Button>
          
          {!isRequired && (
            <Button
              onClick={skipLocation}
              variant="ghost"
              size="sm"
              className="w-full text-blue-600"
            >
              Skip for now
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-3">
          <p>• Your location is only used for job matching and never shared publicly.</p>
          <p>• You can change this permission anytime in your browser settings.</p>
        </div>
      </div>
    </div>
  )
}