// Utility for consistent time formatting across the application

export const formatTimeAgo = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // For very recent posts, show precise timing
  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  // For older posts, show the actual date/time  
  const options: Intl.DateTimeFormatOptions = { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], options);
};

// For debugging - shows exact timestamp
export const formatExactTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No timestamp';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid timestamp';
  
  return date.toLocaleString();
};

// Check if a timestamp is very recent (for demo purposes)
export const isVeryRecent = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  return minutes < 30; // Consider anything within 30 minutes as "very recent"
};