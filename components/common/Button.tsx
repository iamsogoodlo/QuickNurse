
import React, { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'hero-outline';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  fullWidth = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out inline-flex items-center justify-center";
  
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-teal-500 hover:bg-teal-600 text-white focus:ring-teal-500';
      break;
    case 'secondary':
      variantStyles = 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400';
      break;
    case 'danger':
      variantStyles = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500';
      break;
    case 'success':
      variantStyles = 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500';
      break;
    case 'hero-outline':
      variantStyles = 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-teal-600 focus:ring-white';
      break;
  }

  const widthStyle = fullWidth ? 'w-full' : '';
  const loadingStyle = isLoading ? 'opacity-75 cursor-not-allowed' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${widthStyle} ${loadingStyle} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : children}
    </button>
  );
};

export default Button;