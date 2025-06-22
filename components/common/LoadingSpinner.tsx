
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. text-blue-500
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-teal-500' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'h-6 w-6';
      break;
    case 'md':
      sizeClasses = 'h-12 w-12';
      break;
    case 'lg':
      sizeClasses = 'h-20 w-20';
      break;
  }

  return (
    <div className="flex justify-center items-center">
      <div 
        className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 border-transparent ${color.replace('text-', 'border-')}`}
        style={{ borderTopColor: 'currentColor', borderBottomColor: 'currentColor' }} // Use currentColor to respect the text color class
      ></div>
    </div>
  );
};

export default LoadingSpinner;
