import React from 'react';
import { motion } from 'framer-motion';
import { 
  HiMicrophone, 
  HiPhone, 
  HiUsers, 
  HiBriefcase,
  HiGlobeAlt,
  HiSpeakerWave,
  HiArrowTrendingUp
} from 'react-icons/hi2';
import { CARIBBEAN_COLORS } from '@/constants';

interface AnimatedIconProps {
  className?: string;
  size?: number;
  opacity?: number;
}

// Professional Microphone with sound waves
export const AnimatedMicrophone: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 60,
  opacity = 0.2
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <HiMicrophone 
          size={size} 
          color={CARIBBEAN_COLORS.primary[500]}
        />
      </motion.div>
      
      {/* Sound waves */}
      <motion.div
        className="absolute -inset-4"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <div 
          className="w-full h-full rounded-full border"
          style={{ 
            borderColor: CARIBBEAN_COLORS.secondary[300],
            borderWidth: 1
          }}
        />
      </motion.div>
    </div>
  );
};

// Professional Phone with signal
export const AnimatedPhone: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 50,
  opacity = 0.25
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          y: [0, -8, 0],
          rotate: [0, 1, -1, 0]
        }}
        transition={{ 
          duration: 3.5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <HiPhone 
          size={size} 
          color={CARIBBEAN_COLORS.primary[600]}
        />
      </motion.div>
      
      {/* Signal indicator */}
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: CARIBBEAN_COLORS.success[500] }}
        />
      </motion.div>
    </div>
  );
};

// Professional Networking icon
export const AnimatedNetworking: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 70,
  opacity = 0.18
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <HiUsers 
          size={size} 
          color={CARIBBEAN_COLORS.secondary[500]}
        />
      </motion.div>
      
      {/* Connection pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.05, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut"
        }}
      >
        <div 
          className="w-full h-full rounded-full border"
          style={{ 
            borderColor: CARIBBEAN_COLORS.secondary[300],
            borderWidth: 1
          }}
        />
      </motion.div>
    </div>
  );
};

// Professional Work/Business icon
export const AnimatedWork: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 60,
  opacity = 0.2
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          y: [0, -6, 0],
          scale: [1, 1.02, 1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <HiBriefcase 
          size={size} 
          color={CARIBBEAN_COLORS.primary[500]}
        />
      </motion.div>
      
      {/* Success indicator */}
      <motion.div
        className="absolute -top-1 -right-1"
        animate={{
          scale: [0, 1, 1.2, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.3, 0.7, 1]
        }}
      >
        <HiArrowTrendingUp 
          size={16} 
          color={CARIBBEAN_COLORS.success[500]}
        />
      </motion.div>
    </div>
  );
};

// Professional Global/Location icon
export const AnimatedGlobal: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 65,
  opacity = 0.15
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        <HiGlobeAlt 
          size={size} 
          color={CARIBBEAN_COLORS.secondary[400]}
        />
      </motion.div>
    </div>
  );
};

// Professional Sound/Audio icon
export const AnimatedSound: React.FC<AnimatedIconProps> = ({ 
  className = "",
  size = 55,
  opacity = 0.2
}) => {
  return (
    <div className={`relative ${className}`} style={{ opacity }}>
      <motion.div
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <HiSpeakerWave 
          size={size} 
          color={CARIBBEAN_COLORS.primary[400]}
        />
      </motion.div>
      
      {/* Sound waves */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{
            scale: [1, 1 + (i * 0.2), 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        >
          <div 
            className="w-full h-full rounded-full border"
            style={{ 
              borderColor: CARIBBEAN_COLORS.primary[300],
              borderWidth: 0.5
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};