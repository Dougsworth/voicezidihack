import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface AnimatedMicrophoneProps {
  className?: string;
  size?: number;
}

const AnimatedMicrophone: React.FC<AnimatedMicrophoneProps> = ({ 
  className = "",
  size = 60
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 60 60" 
        className="drop-shadow-sm"
      >
        {/* Sound waves - more subtle */}
        <circle
          cx="30"
          cy="30"
          r="22"
          fill="none"
          stroke={CARIBBEAN_COLORS.primary[300]}
          strokeWidth="1"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values="18;26;18"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle
          cx="30"
          cy="30"
          r="18"
          fill="none"
          stroke={CARIBBEAN_COLORS.primary[400]}
          strokeWidth="1"
          opacity="0.2"
        >
          <animate
            attributeName="r"
            values="14;22;14"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.05;0.2"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Microphone body */}
        <rect
          x="25"
          y="20"
          width="10"
          height="16"
          rx="5"
          fill={CARIBBEAN_COLORS.primary[500]}
        >
          <animateTransform
            attributeName="transform"
            type="scale"
            values="1;1.05;1"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Microphone grille */}
        <rect x="26" y="23" width="8" height="1.5" rx="0.75" fill="white" opacity="0.3"/>
        <rect x="26" y="26" width="8" height="1.5" rx="0.75" fill="white" opacity="0.3"/>
        <rect x="26" y="29" width="8" height="1.5" rx="0.75" fill="white" opacity="0.3"/>
        <rect x="26" y="32" width="8" height="1.5" rx="0.75" fill="white" opacity="0.3"/>

        {/* Microphone stand */}
        <line
          x1="30"
          y1="36"
          x2="30"
          y2="42"
          stroke={CARIBBEAN_COLORS.primary[600]}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Base */}
        <ellipse
          cx="30"
          cy="42"
          rx="6"
          ry="2"
          fill={CARIBBEAN_COLORS.primary[600]}
        />

        {/* Professional signal dots */}
        <circle cx="42" cy="25" r="0.8" fill={CARIBBEAN_COLORS.primary[500]} opacity="0.4">
          <animate
            attributeName="opacity"
            values="0.4;0.8;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="45" cy="28" r="0.6" fill={CARIBBEAN_COLORS.secondary[500]} opacity="0.3">
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur="2s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </circle>
        
        <circle cx="43" cy="31" r="0.5" fill={CARIBBEAN_COLORS.primary[400]} opacity="0.2">
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur="2s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>
      </svg>
    </div>
  );
};

export default AnimatedMicrophone;