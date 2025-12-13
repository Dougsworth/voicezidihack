import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowRight, CheckCircle, MessageCircle, ArrowLeft } from 'lucide-react'
import { CARIBBEAN_COLORS } from '@/constants'

interface PhoneVerificationProps {
  onVerified?: (phone: string) => void
}

export default function PhoneVerification({ onVerified }: PhoneVerificationProps) {
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+1876')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const sendOTP = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const fullNumber = `${countryCode}${digits}`
      
      // Call Supabase Edge Function to send OTP via Twilio Verify
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phone-verify?action=send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullNumber })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStep('verify')
        console.log('OTP sent to:', fullNumber)
      } else {
        setError(data.message || 'Failed to send verification code')
      }
    } catch (err) {
      console.error('Send OTP error:', err)
      setError('Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const digits = phone.replace(/\D/g, '')
      const fullNumber = `${countryCode}${digits}`
      
      // Call Supabase Edge Function to verify OTP
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/phone-verify?action=verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: fullNumber,
          code: otp 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Store verified phone number
        localStorage.setItem('userPhone', fullNumber)
        localStorage.setItem('userPhoneDisplay', `${countryCode} ${phone}`)
        localStorage.setItem('phoneVerified', 'true')
        
        setSuccess(true)
        
        if (onVerified) {
          onVerified(fullNumber)
        } else {
          setTimeout(() => navigate('/'), 1500)
        }
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (err) {
      console.error('Verify OTP error:', err)
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setOtp('')
    setError('')
    await sendOTP()
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.success[100] }}>
          <CheckCircle className="w-8 h-8" style={{ color: CARIBBEAN_COLORS.success[600] }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Phone Verified!</h2>
        <p className="text-gray-600">Your number has been successfully verified.</p>
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <div>
        {/* Header */}
        <div className="text-center mb-6">
          <button
            onClick={() => setStep('phone')}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[100] }}>
            <MessageCircle className="w-8 h-8" style={{ color: CARIBBEAN_COLORS.secondary[600] }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
          <p className="text-gray-600">
            We sent a 6-digit code to<br />
            <span className="font-medium">{countryCode} {phone}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6)
              setOtp(value)
              setError('')
            }}
            placeholder="123456"
            className="w-full text-center text-2xl font-mono tracking-widest py-4 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            maxLength={6}
            autoComplete="one-time-code"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyOTP}
          disabled={loading || otp.length !== 6}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          style={{ backgroundColor: CARIBBEAN_COLORS.secondary[500] }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Verify Code
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Resend */}
        <button
          onClick={resendOTP}
          disabled={loading}
          className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Didn't receive code? Resend
        </button>
      </div>
    )
  }

  // Phone input step
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.primary[100] }}>
          <Phone className="w-8 h-8" style={{ color: CARIBBEAN_COLORS.primary[600] }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Phone</h2>
        <p className="text-gray-600">
          We'll send a verification code to confirm your number
        </p>
      </div>

      {/* Phone Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="flex gap-2">
          {/* Country Code */}
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="+1">+1 (US/CA)</option>
            <option value="+1876">+1876 (JM)</option>
            <option value="+1868">+1868 (TT)</option>
            <option value="+1246">+1246 (BB)</option>
            <option value="+1473">+1473 (GD)</option>
            <option value="+1758">+1758 (LC)</option>
            <option value="+1767">+1767 (DM)</option>
            <option value="+1784">+1784 (VC)</option>
            <option value="+1869">+1869 (KN)</option>
            <option value="+592">+592 (GY)</option>
            <option value="+501">+501 (BZ)</option>
          </select>
          
          {/* Phone Number */}
          <div className="flex-1 relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(876) 555-1234"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              maxLength={14}
            />
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Send Code Button */}
      <button
        onClick={sendOTP}
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
        style={{ backgroundColor: CARIBBEAN_COLORS.secondary[500] }}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Send Verification Code
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Skip Link */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700"
      >
        Skip for now
      </button>
    </div>
  )
}