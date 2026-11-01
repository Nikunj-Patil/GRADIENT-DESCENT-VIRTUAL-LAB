// src/components/ui/Button.jsx
import React from 'react';

export default function Button({
  variant = 'primary',
  disabled = false,
  onClick,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold text-sm rounded-xl px-4 py-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus:ring-indigo-500 shadow-sm shadow-indigo-100',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 focus:ring-slate-300'
  };

  const chosenVariant = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${chosenVariant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
