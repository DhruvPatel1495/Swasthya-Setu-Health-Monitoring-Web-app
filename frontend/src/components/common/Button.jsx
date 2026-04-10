import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-dark-bg hover:bg-primary-dark focus:ring-primary/50 shadow-lg shadow-primary/20",
    secondary: "bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-600 border border-gray-700",
    outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/50",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 shadow-lg shadow-red-500/20"
  };

  return (
    <button className={twMerge(clsx(baseClasses, variants[variant], className))} {...props}>
      {children}
    </button>
  );
};
