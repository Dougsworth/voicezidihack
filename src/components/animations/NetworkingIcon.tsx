import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface NetworkingIconProps {
  className?: string;
  size?: number;
}

const NetworkingIcon: React.FC<NetworkingIconProps> = ({ 
  className = "",
  size = 80
}) => {
  return (
    <div className={`relative ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 80 80" 
        className="drop-shadow-sm"
      >
        {/* Connection nodes */}
        <circle cx="20" cy="20" r="4" fill={CARIBBEAN_COLORS.primary[500]}>
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="60" cy="25" r="3.5" fill={CARIBBEAN_COLORS.secondary[500]}>
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="3s"
            repeatCount="indefinite"
            begin="0.5s"
          />
        </circle>
        
        <circle cx="40" cy="45" r="4.5" fill={CARIBBEAN_COLORS.primary[600]}>
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur="3s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>
        
        <circle cx="25" cy="60" r="3" fill={CARIBBEAN_COLORS.secondary[600]}>
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="3s"
            repeatCount="indefinite"
            begin="1.5s"
          />
        </circle>
        
        <circle cx="65" cy="55" r="3.5" fill={CARIBBEAN_COLORS.primary[400]}>
          <animate
            attributeName="opacity"
            values="0.6;1;0.6"
            dur="3s"
            repeatCount="indefinite"
            begin="2s"
          />
        </circle>

        {/* Connection lines */}
        <line
          x1="20" y1="20"
          x2="40" y2="45"
          stroke={CARIBBEAN_COLORS.primary[300]}
          strokeWidth="1.5"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
        
        <line
          x1="60" y1="25"
          x2="40" y2="45"
          stroke={CARIBBEAN_COLORS.secondary[300]}
          strokeWidth="1.5"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur="4s"
            repeatCount="indefinite"
            begin="1s"
          />
        </line>
        
        <line
          x1="40" y1="45"
          x2="25" y2="60"
          stroke={CARIBBEAN_COLORS.primary[300]}
          strokeWidth="1.5"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur="4s"
            repeatCount="indefinite"
            begin="2s"
          />
        </line>
        
        <line
          x1="40" y1="45"
          x2="65" y2="55"
          stroke={CARIBBEAN_COLORS.secondary[300]}
          strokeWidth="1.5"
          opacity="0.4"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur="4s"
            repeatCount="indefinite"
            begin="3s"
          />
        </line>

        {/* Pulse effects */}
        <circle cx="20" cy="20" r="6" fill="none" stroke={CARIBBEAN_COLORS.primary[400]} strokeWidth="1" opacity="0.3">
          <animate
            attributeName="r"
            values="4;8;4"
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
        
        <circle cx="40" cy="45" r="7" fill="none" stroke={CARIBBEAN_COLORS.primary[500]} strokeWidth="1" opacity="0.2">
          <animate
            attributeName="r"
            values="4.5;9;4.5"
            dur="3.5s"
            repeatCount="indefinite"
            begin="1s"
          />
          <animate
            attributeName="opacity"
            values="0.2;0.05;0.2"
            dur="3.5s"
            repeatCount="indefinite"
            begin="1s"
          />
        </circle>
      </svg>
    </div>
  );
};

export default NetworkingIcon;