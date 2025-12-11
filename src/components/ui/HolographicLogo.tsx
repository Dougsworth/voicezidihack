import React from 'react';
import '../../styles/logo.css';

interface HolographicLogoProps {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}

export const HolographicLogo: React.FC<HolographicLogoProps> = ({
  className = '',
  width = 150,
  height = 40,
  alt = 'LinkUpWork Caribbean'
}) => {
  return (
    <div className="logo-container">
      <div className="logo-holographic">
        <img
          src="/linkuplogoimage-removebg-preview.png"
          alt={alt}
          width={width}
          height={height}
          className={`logo-3d logo-glow logo-transparent ${className}`}
          style={{
            objectFit: 'contain',
            filter: 'brightness(1.2) contrast(1.1)',
          }}
        />
      </div>
    </div>
  );
};