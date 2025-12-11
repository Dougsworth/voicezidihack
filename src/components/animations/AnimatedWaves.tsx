import React from 'react';
import { CARIBBEAN_COLORS } from '@/constants';

interface AnimatedWavesProps {
  className?: string;
  width?: number;
  height?: number;
}

const AnimatedWaves: React.FC<AnimatedWavesProps> = ({ 
  className = "",
  width = 200,
  height = 60
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0"
      >
        {/* Wave 1 - Background */}
        <path
          d={`M0 ${height * 0.7} Q${width * 0.25} ${height * 0.5} ${width * 0.5} ${height * 0.7} T${width} ${height * 0.7} V${height} H0 Z`}
          fill={CARIBBEAN_COLORS.primary[200]}
          opacity="0.4"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`-${width} 0; 0 0; ${width} 0`}
            dur="8s"
            repeatCount="indefinite"
          />
        </path>

        {/* Wave 2 - Middle */}
        <path
          d={`M0 ${height * 0.8} Q${width * 0.3} ${height * 0.6} ${width * 0.6} ${height * 0.8} T${width} ${height * 0.8} V${height} H0 Z`}
          fill={CARIBBEAN_COLORS.secondary[300]}
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${width} 0; 0 0; -${width} 0`}
            dur="6s"
            repeatCount="indefinite"
          />
        </path>

        {/* Wave 3 - Foreground */}
        <path
          d={`M0 ${height * 0.85} Q${width * 0.2} ${height * 0.7} ${width * 0.4} ${height * 0.85} T${width} ${height * 0.85} V${height} H0 Z`}
          fill={CARIBBEAN_COLORS.secondary[400]}
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`-${width * 0.5} 0; 0 0; ${width * 0.5} 0`}
            dur="10s"
            repeatCount="indefinite"
          />
        </path>

        {/* Bubbles */}
        <circle cx="20" cy={height * 0.9} r="2" fill={CARIBBEAN_COLORS.secondary[100]} opacity="0.8">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 5,-20; 10,-40"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.4;0"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="150" cy={height * 0.85} r="1.5" fill={CARIBBEAN_COLORS.primary[100]} opacity="0.7">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; -3,-15; -8,-30"
            dur="3.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0.3;0"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        
        <circle cx="80" cy={height * 0.8} r="1" fill={CARIBBEAN_COLORS.secondary[200]} opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 2,-25; 8,-45"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.6;0.2;0"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};

export default AnimatedWaves;