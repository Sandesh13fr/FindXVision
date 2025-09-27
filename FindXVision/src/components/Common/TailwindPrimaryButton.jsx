import React from 'react';

const TailwindPrimaryButton = ({
  children,
  fullWidth = false,
  color = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  ...rest
}) => {
  const colorClasses = {
    primary: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
    secondary: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
    error: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    warning: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
    info: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
  };

  const sizeClasses = {
    small: 'py-1.5 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  const baseClasses = `inline-flex items-center justify-center rounded-full font-bold uppercase tracking-widest transition-all duration-200 ${
    colorClasses[color]
  } ${
    sizeClasses[size]
  } ${
    fullWidth ? 'w-full' : ''
  } ${
    disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
  } text-white shadow-lg transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0`;

  return (
    <button
      className={`${baseClasses} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default TailwindPrimaryButton;