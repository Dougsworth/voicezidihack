import React from 'react';
import { Badge } from '@/components/ui/badge';
import { JobCategory } from '@/services/jobCategorizationService';
import { User, Briefcase, TrendingUp } from 'lucide-react';

interface CategoryBadgeProps {
  category: JobCategory;
  confidence: number;
  className?: string;
  showConfidence?: boolean;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  confidence,
  className = '',
  showConfidence = false
}) => {
  const isWorker = category === 'find_work';
  
  const config = {
    find_work: {
      label: '👷 Worker Available',
      color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      icon: User,
      description: 'Looking for work'
    },
    hire_workers: {
      label: '💼 Job Posting',
      color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      icon: Briefcase,
      description: 'Looking to hire'
    }
  };
  
  const { label, color, icon: Icon, description } = config[category];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="secondary" 
        className={`${color} transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="font-medium">{label}</span>
      </Badge>
      
      {showConfidence && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>{Math.round(confidence * 100)}% match</span>
        </div>
      )}
      
      <span className="text-xs text-gray-400 hidden sm:inline">
        {description}
      </span>
    </div>
  );
};