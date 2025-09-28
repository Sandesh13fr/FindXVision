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
    primary:
      'bg-[#212121] text-[#121212] hover:bg-white/10  focus:ring-[var(--fx-accent)]/60 border border-[var(--fx-accent)]/60 rounded-xl',
    secondary:
      'bg-[#ff7043] text-[#121212] hover:bg-[#ff8a65] focus:ring-[#ff7043]/60 border border-[#ff7043]/60',
    success:
      'bg-[#4caf50] text-white hover:bg-[#66bb6a] focus:ring-[#4caf50]/60 border border-[#4caf50]/60',
    error:
      'bg-[#f44336] text-white hover:bg-[#ef5350] focus:ring-[#f44336]/60 border border-[#f44336]/60',
    warning:
      'bg-[#ff9800] text-[#121212] hover:bg-[#ffab33] focus:ring-[#ff9800]/60 border border-[#ff9800]/60',
    info:
      'bg-[#03a9f4] text-[#050505] hover:bg-[#29b6f6] focus:ring-[#03a9f4]/60 border border-[#03a9f4]/60',
  };

  const sizeClasses = {
    small: 'py-1.5 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg',
  };

  const baseClasses = `inline-flex items-center justify-center font-bold uppercase tracking-[0.35em] transition-all duration-200 ${
    colorClasses[color]
  } ${
    sizeClasses[size]
  } ${
    fullWidth ? 'w-full' : ''
  } ${
    disabled || loading ? 'opacity-60 cursor-not-allowed' : ''
  } transform hover:-translate-y-0.5 active:translate-y-0`;

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