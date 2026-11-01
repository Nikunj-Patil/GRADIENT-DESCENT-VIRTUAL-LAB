// src/components/ui/Callout.jsx
import React from 'react';

export default function Callout({
  variant = 'idea',
  title,
  children,
  className = ''
}) {
  const configs = {
    idea: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-400',
      text: 'text-amber-900',
      iconBg: 'bg-amber-100 text-amber-700',
      defaultTitle: 'Idea',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      )
    },
    tip: {
      bg: 'bg-teal-50/80',
      border: 'border-teal-500',
      text: 'text-teal-900',
      iconBg: 'bg-teal-100 text-teal-700',
      defaultTitle: 'Tip',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      )
    },
    warning: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-400',
      text: 'text-rose-900',
      iconBg: 'bg-rose-100 text-rose-700',
      defaultTitle: 'Warning',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    }
  };

  const style = configs[variant] || configs.idea;
  const displayTitle = title || style.defaultTitle;

  return (
    <div
      className={`my-4 flex items-start gap-3 rounded-2xl border-l-4 ${style.border} ${style.bg} p-4 shadow-sm ${className}`}
    >
      <div className={`mt-0.5 flex-shrink-0 rounded-xl p-2 ${style.iconBg}`}>
        {style.icon}
      </div>
      <div className={`text-sm leading-relaxed ${style.text}`}>
        {displayTitle && (
          <h4 className="mb-1 font-bold text-slate-900 text-base">{displayTitle}</h4>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
