import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface FloatingPalmTreeProps {
  className?: string;
  size?: number;
  direction?: 'left' | 'right';
}

const FloatingPalmTree: React.FC<FloatingPalmTreeProps> = ({ 
  className = "",
  size = 80,
  direction = 'right'
}) => {
  const isLeft = direction === 'left';
  
  return (
    <div className={`relative ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80" 
        className="drop-shadow-sm"
        style={{ transform: isLeft ? 'scaleX(-1)' : 'none' }}
      >
        {/* Trunk */}
        <path
          d="M35 60 Q37 45 35 30 Q36 15 35 5"
          fill="none"
          stroke={CARIBBEAN_COLORS.warning[600]}
          strokeWidth="4"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 40; 3 35 40; -2 35 40; 0 35 40"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>

        {/* Palm fronds */}
        <path
          d="M35 8 Q20 5 10 8 Q8 10 12 12 Q25 10 35 8"
          fill={CARIBBEAN_COLORS.success[500]}
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 8; -5 35 8; 2 35 8; 0 35 8"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M35 8 Q50 5 60 8 Q62 10 58 12 Q45 10 35 8"
          fill={CARIBBEAN_COLORS.success[600]}
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 8; 4 35 8; -3 35 8; 0 35 8"
            dur="4.2s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M35 8 Q30 2 25 0 Q23 1 26 4 Q32 6 35 8"
          fill={CARIBBEAN_COLORS.success[400]}
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 8; -3 35 8; 1 35 8; 0 35 8"
            dur="3.8s"
            repeatCount="indefinite"
          />
        </path>
        
        <path
          d="M35 8 Q40 2 45 0 Q47 1 44 4 Q38 6 35 8"
          fill={CARIBBEAN_COLORS.success[700]}
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 8; 2 35 8; -4 35 8; 0 35 8"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Coconuts */}
        <circle cx="30" cy="15" r="2" fill={CARIBBEAN_COLORS.warning[700]}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 15; -2 35 15; 1 35 15; 0 35 15"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="38" cy="12" r="1.5" fill={CARIBBEAN_COLORS.warning[800]}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 35 12; 3 35 12; -1 35 12; 0 35 12"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Floating island base */}
        <ellipse
          cx="35"
          cy="68"
          rx="20"
          ry="8"
          fill={CARIBBEAN_COLORS.warning[200]}
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Beach sand effect */}
        <ellipse
          cx="35"
          cy="65"
          rx="18"
          ry="6"
          fill={CARIBBEAN_COLORS.warning[300]}
          opacity="0.4"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="3s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>
    </div>
  );
};

export default FloatingPalmTree;