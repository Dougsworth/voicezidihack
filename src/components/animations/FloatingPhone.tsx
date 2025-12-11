import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface FloatingPhoneProps {
  className?: string;
  size?: number;
}

const FloatingPhone: React.FC<FloatingPhoneProps> = ({ 
  className = "",
  size = 50
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50" 
        className="drop-shadow-sm"
      >
        {/* Phone body */}
        <rect
          x="18"
          y="10"
          width="14"
          height="24"
          rx="3"
          fill={CARIBBEAN_COLORS.neutral[800]}
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Screen */}
        <rect
          x="20"
          y="14"
          width="10"
          height="16"
          rx="1"
          fill={CARIBBEAN_COLORS.secondary[400]}
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values={`${CARIBBEAN_COLORS.secondary[400]};${CARIBBEAN_COLORS.primary[400]};${CARIBBEAN_COLORS.secondary[400]}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Home button */}
        <circle
          cx="25"
          cy="31.5"
          r="1"
          fill={CARIBBEAN_COLORS.neutral[600]}
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Signal waves */}
        <path
          d="M10 15 Q12 13 14 15"
          fill="none"
          stroke={CARIBBEAN_COLORS.success[500]}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        >
          <animate
            attributeName="opacity"
            values="0.7;0.3;0.7"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M8 18 Q12 14 16 18"
          fill="none"
          stroke={CARIBBEAN_COLORS.success[500]}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.5;0.1;0.5"
            dur="2s"
            repeatCount="indefinite"
            begin="0.3s"
          />
        </path>
        
        <path
          d="M6 21 Q12 15 18 21"
          fill="none"
          stroke={CARIBBEAN_COLORS.success[500]}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.3"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.05;0.3"
            dur="2s"
            repeatCount="indefinite"
            begin="0.6s"
          />
        </path>

        {/* Voice call indicator */}
        <circle
          cx="36"
          cy="18"
          r="3"
          fill={CARIBBEAN_COLORS.accent[500]}
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values="2;4;2"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle
          cx="36"
          cy="18"
          r="1"
          fill={CARIBBEAN_COLORS.accent[600]}
        />

        {/* Floating sound notes */}
        <text x="38" y="12" fontSize="8" fill={CARIBBEAN_COLORS.secondary[500]} opacity="0.6">♪</text>
        <text x="42" y="16" fontSize="6" fill={CARIBBEAN_COLORS.primary[500]} opacity="0.5">♫</text>
        <text x="40" y="25" fontSize="7" fill={CARIBBEAN_COLORS.accent[400]} opacity="0.4">♪</text>

        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 1,-3; 0,0"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </svg>
    </div>
  );
};

export default FloatingPhone;