// App-wide constants

// WhatsApp Configuration
export const WHATSAPP_CONFIG = {
  number: "18765551465",
  defaultMessage: "Hi! I'd like to post a job or find work through voice note.",
  getLink: (message?: string) => 
    `https://wa.me/${WHATSAPP_CONFIG.number}?text=${encodeURIComponent(message || WHATSAPP_CONFIG.defaultMessage)}`
}

// Caribbean Flags for UI
export const CARIBBEAN_FLAGS = [
  "🇯🇲", "🇹🇹", "🇧🇧", "🇬🇾", "🇧🇸", "🇧🇿", 
  "🇦🇬", "🇱🇨", "🇬🇩", "🇻🇨", "🇩🇲", "🇰🇳"
]

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMinutes: 15
}

// UI Configuration
export const UI_CONFIG = {
  successMessageDuration: 5000, // 5 seconds
  processingTimeout: 30000, // 30 seconds
  maxTitleLength: 50,
  maxVoiceNoteDuration: 300 // 5 minutes
}

// Database Configuration
export const DB_CONFIG = {
  defaultCurrency: 'JMD',
  defaultStatus: 'active' as const,
  defaultContactMethod: 'whatsapp' as const
}

// Caribbean Color Palette
export const CARIBBEAN_COLORS = {
  // Primary - Ocean Blues (professional, trustworthy)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe', 
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main brand blue
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e'
  },
  
  // Secondary - Caribbean Turquoise (vibrant, tropical)
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4', 
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main turquoise
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a'
  },
  
  // Accent - Sunset Orange (energy, urgency)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74', 
    400: '#fb923c',
    500: '#f97316', // Main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12'
  },
  
  // Success - Palm Green (growth, success)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d'
  },
  
  // Warning - Mango Yellow (attention, warmth)
  warning: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308', // Main yellow
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12'
  },
  
  // Error - Coral Red (errors, urgency)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d'
  },
  
  // Neutrals - Modern gray scale
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  }
} as const

// App Routes
export const ROUTES = {
  HOME: '/',
  FIND_WORK: '/find-work',
  HIRE_WORKERS: '/hire-workers',
  JOBS: '/jobs',
  VOICE_DEMO: '/voice-demo'
} as const