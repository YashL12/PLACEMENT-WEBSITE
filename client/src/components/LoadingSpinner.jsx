import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  const sizeMap = {
    small: { spinner: 'w-5 h-5', text: 'text-xs' },
    default: { spinner: 'w-8 h-8', text: 'text-sm' },
    large: { spinner: 'w-12 h-12', text: 'text-base' },
  };
  const s = sizeMap[size] || sizeMap.default;

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative mb-4">
        <div className={`${s.spinner} rounded-full border-2 border-slate-200`} aria-hidden="true" />
        <Loader2
          className={`${s.spinner} text-blue-600 animate-spin absolute inset-0`}
          aria-hidden="true"
        />
      </div>
      <p className={`${s.text} font-medium text-slate-500`}>{message}</p>
    </div>
  );
};
