import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading placement records...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
      <Loader2 className={`animate-spin text-blue-600 mb-3 ${sizeClasses[size] || sizeClasses.default}`} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};
