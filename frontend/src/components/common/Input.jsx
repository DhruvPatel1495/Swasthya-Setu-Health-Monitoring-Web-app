import React from 'react';

export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <input
        ref={ref}
        className={`bg-dark-bg border ${error ? 'border-red-500' : 'border-dark-border'} text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
