import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface WorkIconProps {
  className?: string;
  size?: number;
}

const WorkIcon: React.FC<WorkIconProps> = ({ 
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
        {/* Briefcase body */}
        <rect
          x="15"
          y="25"
          width="30"
          height="20"
          rx="2"
          fill={CARIBBEAN_COLORS.primary[500]}
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Briefcase handle */}
        <rect
          x="25"
          y="20"
          width="10"
          height="5"
          rx="2"
          fill="none"
          stroke={CARIBBEAN_COLORS.primary[600]}
          strokeWidth="2"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Lock/clasp */}
        <circle
          cx="30"
          cy="35"
          r="2"
          fill={CARIBBEAN_COLORS.primary[700]}
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Professional accent lines */}
        <line
          x1="18"
          y1="30"
          x2="42"
          y2="30"
          stroke={CARIBBEAN_COLORS.primary[300]}
          strokeWidth="0.5"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
        
        <line
          x1="18"
          y1="40"
          x2="42"
          y2="40"
          stroke={CARIBBEAN_COLORS.primary[300]}
          strokeWidth="0.5"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-1; 0,0"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>

        {/* Success indicators - small dots */}
        <circle cx="20" cy="15" r="1.5" fill={CARIBBEAN_COLORS.success[500]} opacity="0.5">
          <animate
            attributeName="opacity"
            values="0.5;0.9;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="1.5;2;1.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="40" cy="12" r="1" fill={CARIBBEAN_COLORS.secondary[500]} opacity="0.4">
          <animate
            attributeName="opacity"
            values="0.4;0.8;0.4"
            dur="2.5s"
            repeatCount="indefinite"
            begin="0.5s"
          />
          <animate
            attributeName="r"
            values="1;1.5;1"
            dur="2.5s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </circle>
        
        <circle cx="30" cy="10" r="1.2" fill={CARIBBEAN_COLORS.primary[400]} opacity="0.3">
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="3s"
            repeatCount="indefinite"
            begin="1s"
          />
          <animate
            attributeName="r"
            values="1.2;1.8;1.2"
            dur="3s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>

        {/* Growth arrow (subtle) */}
        <path
          d="M10 50 L15 45 L20 50"
          fill="none"
          stroke={CARIBBEAN_COLORS.success[400]}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.4;0.7;0.4"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default WorkIcon;