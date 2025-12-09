import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowRight, CheckCircle } from 'lucide-react'
import { CARIBBEAN_COLORS, HOTLINE } from '@/constants'

export default function Signup() {
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const formatPhoneInput = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value)
    setPhone(formatted)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Extract digits only
    const digits = phone.replace(/\D/g, '')
    
    if (digits.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    // Store the full phone number
    const fullNumber = `${countryCode}${digits}`
    localStorage.setItem('userPhone', fullNumber)
    localStorage.setItem('userPhoneDisplay', `${countryCode} ${phone}`)
    
    console.log('📱 Phone saved:', fullNumber)
    
    setSuccess(true)
    
    // Redirect to home after short delay
    setTimeout(() => {
      navigate('/')
    }, 1500)
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
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: CARIBBEAN_COLORS.success[100] }}>
                <CheckCircle className="w-8 h-8" style={{ color: CARIBBEAN_COLORS.success[600] }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600">Redirecting to home...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Current Phone (if exists) */}
              {existingPhone && (
                <div className="mb-6 p-3 rounded-lg" style={{ backgroundColor: CARIBBEAN_COLORS.secondary[50] }}>
                  <p className="text-sm" style={{ color: CARIBBEAN_COLORS.secondary[700] }}>
                    Current number: <strong>{existingPhone}</strong>
                  </p>
                </div>
              )}

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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: CARIBBEAN_COLORS.secondary[500] }}
              >
                {existingPhone ? 'Update Number' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Skip Link */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </button>
            </form>
          )}
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

