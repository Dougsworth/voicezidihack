import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'
import { CARIBBEAN_COLORS, HOTLINE } from '@/constants'
import PhoneVerification from '@/components/auth/PhoneVerification'

export default function Signup() {
  const navigate = useNavigate()

  const handleVerified = (phoneNumber: string) => {
    console.log('📱 Phone verified:', phoneNumber)
    navigate('/')
  }

  const existingPhone = localStorage.getItem('userPhoneDisplay')

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: CARIBBEAN_COLORS.neutral[50] }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img 
              src="/linkuplogoimage-removebg-preview.png" 
              alt="LinkUpWork"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold" style={{ color: CARIBBEAN_COLORS.neutral[900] }}>
              LinkUp<span style={{ color: CARIBBEAN_COLORS.secondary[600] }}>Work</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {existingPhone ? 'Update Your Number' : 'Get Started'}
          </h1>
          <p className="text-gray-600">
            Enter your phone number so people can contact you
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Current Phone Notice (if exists) */}
          {existingPhone && (
            <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[50] }}>
              <p className="text-sm" style={{ color: CARIBBEAN_COLORS.secondary[700] }}>
                Current number: <strong>{existingPhone}</strong>
              </p>
            </div>
          )}

          <PhoneVerification onVerified={handleVerified} />
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Or call our hotline to post via voice:
          </p>
          <a 
            href={HOTLINE.tel}
            className="inline-flex items-center gap-2 font-semibold"
            style={{ color: CARIBBEAN_COLORS.secondary[600] }}
          >
            <Phone className="w-4 h-4" />
            {HOTLINE.display}
          </a>
        </div>
      </div>
    </div>
  )
}

